const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("De-Bugger Marketplace", function () {
  let DatasetNFT, Marketplace;
  let nftContract, marketplace;
  let owner, seller, buyer, feeRecipient;
  
  const sampleDataset = {
    price: ethers.utils.parseEther("0.1"),
    tokenURI: "https://akave.storage/metadata/1.json",
    lighthouseHash: "QmSampleHash123456789",
    complexity: 85,
    uniqueness: 92,
    category: "JavaScript"
  };
  
  beforeEach(async function () {
    // Get signers
    [owner, seller, buyer, feeRecipient] = await ethers.getSigners();
    
    // Deploy DatasetNFT contract
    DatasetNFT = await ethers.getContractFactory("DatasetNFT");
    nftContract = await DatasetNFT.deploy();
    await nftContract.deployed();
    
    // Deploy Marketplace contract
    Marketplace = await ethers.getContractFactory("Marketplace");
    marketplace = await Marketplace.deploy(nftContract.address, feeRecipient.address);
    await marketplace.deployed();
    
    // Link contracts
    await nftContract.setMarketplaceAddress(marketplace.address);
  });
  
  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await marketplace.owner()).to.equal(owner.address);
      expect(await nftContract.owner()).to.equal(owner.address);
    });
    
    it("Should link contracts correctly", async function () {
      expect(await nftContract.marketplaceAddress()).to.equal(marketplace.address);
      expect(await marketplace.nftContract()).to.equal(nftContract.address);
    });
    
    it("Should set correct fee recipient", async function () {
      expect(await marketplace.feeRecipient()).to.equal(feeRecipient.address);
    });
  });
  
  describe("Dataset Listing", function () {
    it("Should list a dataset successfully", async function () {
      const tx = await marketplace.connect(seller).listDataset(
        sampleDataset.price,
        sampleDataset.tokenURI,
        sampleDataset.lighthouseHash,
        sampleDataset.complexity,
        sampleDataset.uniqueness,
        sampleDataset.category
      );
      
      await expect(tx)
        .to.emit(marketplace, "DatasetListed")
        .withArgs(1, seller.address, sampleDataset.price, sampleDataset.category, sampleDataset.complexity, sampleDataset.uniqueness);
      
      const dataset = await marketplace.getDataset(1);
      expect(dataset.seller).to.equal(seller.address);
      expect(dataset.price).to.equal(sampleDataset.price);
      expect(dataset.complexity).to.equal(sampleDataset.complexity);
      expect(dataset.uniqueness).to.equal(sampleDataset.uniqueness);
      expect(dataset.active).to.equal(true);
    });
    
    it("Should reject listing with invalid parameters", async function () {
      // Zero price
      await expect(
        marketplace.connect(seller).listDataset(
          0,
          sampleDataset.tokenURI,
          sampleDataset.lighthouseHash,
          sampleDataset.complexity,
          sampleDataset.uniqueness,
          sampleDataset.category
        )
      ).to.be.revertedWith("Marketplace: price must be greater than 0");
      
      // Invalid complexity
      await expect(
        marketplace.connect(seller).listDataset(
          sampleDataset.price,
          sampleDataset.tokenURI,
          sampleDataset.lighthouseHash,
          0,
          sampleDataset.uniqueness,
          sampleDataset.category
        )
      ).to.be.revertedWith("Marketplace: complexity must be 1-100");
      
      // Empty tokenURI
      await expect(
        marketplace.connect(seller).listDataset(
          sampleDataset.price,
          "",
          sampleDataset.lighthouseHash,
          sampleDataset.complexity,
          sampleDataset.uniqueness,
          sampleDataset.category
        )
      ).to.be.revertedWith("Marketplace: tokenURI cannot be empty");
    });
    
    it("Should increment token IDs correctly", async function () {
      await marketplace.connect(seller).listDataset(
        sampleDataset.price,
        sampleDataset.tokenURI,
        sampleDataset.lighthouseHash,
        sampleDataset.complexity,
        sampleDataset.uniqueness,
        sampleDataset.category
      );
      
      expect(await marketplace.nextTokenId()).to.equal(2);
      expect(await marketplace.totalDatasetsListed()).to.equal(1);
    });
  });
  
  describe("Dataset Purchase", function () {
    beforeEach(async function () {
      // List a dataset first
      await marketplace.connect(seller).listDataset(
        sampleDataset.price,
        sampleDataset.tokenURI,
        sampleDataset.lighthouseHash,
        sampleDataset.complexity,
        sampleDataset.uniqueness,
        sampleDataset.category
      );
    });
    
    it("Should purchase access successfully", async function () {
      const initialSellerBalance = await seller.getBalance();
      const initialFeeRecipientBalance = await feeRecipient.getBalance();
      
      const tx = await marketplace.connect(buyer).buyAccess(1, {
        value: sampleDataset.price
      });
      
      await expect(tx)
        .to.emit(marketplace, "AccessPurchased")
        .withArgs(1, buyer.address, seller.address, sampleDataset.price);
      
      // Check NFT was minted
      expect(await nftContract.hasAccess(buyer.address, 1)).to.equal(true);
      expect(await nftContract.balanceOf(buyer.address, 1)).to.equal(1);
      
      // Check payment distribution
      const platformFee = sampleDataset.price.mul(10).div(100); // 10%
      const sellerAmount = sampleDataset.price.sub(platformFee);
      
      const finalSellerBalance = await seller.getBalance();
      const finalFeeRecipientBalance = await feeRecipient.getBalance();
      
      expect(finalSellerBalance.sub(initialSellerBalance)).to.equal(sellerAmount);
      expect(finalFeeRecipientBalance.sub(initialFeeRecipientBalance)).to.equal(platformFee);
      
      // Check statistics updated
      const dataset = await marketplace.getDataset(1);
      expect(dataset.totalSales).to.equal(1);
      expect(await marketplace.sellerEarnings(seller.address)).to.equal(sellerAmount);
    });
    
    it("Should reject purchase with insufficient payment", async function () {
      const insufficientAmount = sampleDataset.price.sub(ethers.utils.parseEther("0.01"));
      
      await expect(
        marketplace.connect(buyer).buyAccess(1, {
          value: insufficientAmount
        })
      ).to.be.revertedWith("Marketplace: insufficient payment");
    });
    
    it("Should reject seller buying own dataset", async function () {
      await expect(
        marketplace.connect(seller).buyAccess(1, {
          value: sampleDataset.price
        })
      ).to.be.revertedWith("Marketplace: seller cannot buy own dataset");
    });
    
    it("Should reject duplicate purchase by same buyer", async function () {
      // First purchase should succeed
      await marketplace.connect(buyer).buyAccess(1, {
        value: sampleDataset.price
      });
      
      // Second purchase should fail
      await expect(
        marketplace.connect(buyer).buyAccess(1, {
          value: sampleDataset.price
        })
      ).to.be.revertedWith("Marketplace: already has access");
    });
    
    it("Should reject purchase of non-existent dataset", async function () {
      await expect(
        marketplace.connect(buyer).buyAccess(999, {
          value: sampleDataset.price
        })
      ).to.be.revertedWith("Marketplace: dataset does not exist");
    });
  });
  
  describe("Dataset Management", function () {
    beforeEach(async function () {
      await marketplace.connect(seller).listDataset(
        sampleDataset.price,
        sampleDataset.tokenURI,
        sampleDataset.lighthouseHash,
        sampleDataset.complexity,
        sampleDataset.uniqueness,
        sampleDataset.category
      );
    });
    
    it("Should allow seller to update dataset", async function () {
      const newPrice = ethers.utils.parseEther("0.2");
      
      const tx = await marketplace.connect(seller).updateDataset(1, newPrice, false);
      
      await expect(tx)
        .to.emit(marketplace, "DatasetUpdated")
        .withArgs(1, newPrice, false);
      
      const dataset = await marketplace.getDataset(1);
      expect(dataset.price).to.equal(newPrice);
      expect(dataset.active).to.equal(false);
    });
    
    it("Should reject update by non-seller", async function () {
      const newPrice = ethers.utils.parseEther("0.2");
      
      await expect(
        marketplace.connect(buyer).updateDataset(1, newPrice, true)
      ).to.be.revertedWith("Marketplace: not the seller");
    });
    
    it("Should allow owner to set DAO validation", async function () {
      const tx = await marketplace.connect(owner).setDAOValidation(1, true);
      
      await expect(tx)
        .to.emit(marketplace, "DAOValidationUpdated")
        .withArgs(1, true);
      
      const dataset = await marketplace.getDataset(1);
      expect(dataset.daoValidated).to.equal(true);
    });
  });
  
  describe("Platform Management", function () {
    it("Should allow owner to update platform fee", async function () {
      const newFee = 15; // 15%
      
      const tx = await marketplace.connect(owner).setPlatformFee(newFee);
      
      await expect(tx)
        .to.emit(marketplace, "PlatformFeeUpdated")
        .withArgs(newFee);
      
      expect(await marketplace.platformFeePercentage()).to.equal(newFee);
    });
    
    it("Should reject fee above 25%", async function () {
      await expect(
        marketplace.connect(owner).setPlatformFee(30)
      ).to.be.revertedWith("Marketplace: fee cannot exceed 25%");
    });
    
    it("Should allow owner to pause/unpause", async function () {
      await marketplace.connect(owner).pause();
      expect(await marketplace.paused()).to.equal(true);
      
      // Should reject operations when paused
      await expect(
        marketplace.connect(seller).listDataset(
          sampleDataset.price,
          sampleDataset.tokenURI,
          sampleDataset.lighthouseHash,
          sampleDataset.complexity,
          sampleDataset.uniqueness,
          sampleDataset.category
        )
      ).to.be.revertedWith("Pausable: paused");
      
      await marketplace.connect(owner).unpause();
      expect(await marketplace.paused()).to.equal(false);
    });
  });
  
  describe("Statistics", function () {
    it("Should track marketplace statistics correctly", async function () {
      // List multiple datasets
      await marketplace.connect(seller).listDataset(
        sampleDataset.price,
        sampleDataset.tokenURI,
        sampleDataset.lighthouseHash,
        sampleDataset.complexity,
        sampleDataset.uniqueness,
        sampleDataset.category
      );
      
      await marketplace.connect(seller).listDataset(
        sampleDataset.price,
        "https://akave.storage/metadata/2.json",
        "QmAnotherHash789",
        75,
        88,
        "Python"
      );
      
      expect(await marketplace.totalDatasetsListed()).to.equal(2);
      expect(await marketplace.getActiveDatasetCount()).to.equal(2);
      
      // Make a purchase
      await marketplace.connect(buyer).buyAccess(1, {
        value: sampleDataset.price
      });
      
      expect(await marketplace.totalSalesVolume()).to.equal(sampleDataset.price);
      
      const sellerAmount = sampleDataset.price.mul(90).div(100); // 90% after 10% fee
      expect(await marketplace.sellerEarnings(seller.address)).to.equal(sellerAmount);
    });
  });
});