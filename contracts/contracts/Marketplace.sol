// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./DatasetNFT.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Marketplace is ReentrancyGuard, Ownable {
    DatasetNFT public immutable datasetNFT;
    address payable public feeReceiver;

    uint256 public platformFeeBps = 1000; // 1000 basis points = 10%
    uint256 public nextTokenId = 1;

    struct Dataset {
        address payable seller;
        uint256 price; // In wei
        string tokenURI; // URL to the public metadata on Akave O3
        bool isListed;
    }

    mapping(uint256 => Dataset) public datasets;

    event DatasetListed(
        uint256 indexed tokenId,
        address indexed seller,
        uint256 price,
        string tokenURI
    );
    event AccessSold(
        uint256 indexed tokenId,
        address indexed buyer,
        uint256 pricePaid
    );

    constructor(address _nftContractAddress, address payable _feeReceiver) {
        datasetNFT = DatasetNFT(_nftContractAddress);
        feeReceiver = _feeReceiver;
    }

    /**
     * @dev Lists a new dataset.
     * SECURITY: Only the contract owner (your backend wallet) can call this.
     */
    function listDataset(
        address payable _seller,
        uint256 _price,
        string memory _tokenURI
    ) external onlyOwner returns (uint256) {
        require(_price > 0, "Price must be > 0");
        uint256 tokenId = nextTokenId++;

        datasets[tokenId] = Dataset({
            seller: _seller,
            price: _price,
            tokenURI: _tokenURI,
            isListed: true
        });

        datasetNFT.createDataset(tokenId);

        emit DatasetListed(tokenId, _seller, _price, _tokenURI);
        return tokenId;
    }

    /**
     * @dev Allows a user to buy an access token for a dataset.
     */
    function buyAccess(uint256 tokenId) external payable nonReentrant {
        Dataset storage dataset = datasets[tokenId];
        require(dataset.isListed, "Dataset not available");
        require(msg.value >= dataset.price, "Insufficient payment");

        uint256 platformFee = (dataset.price * platformFeeBps) / 10000;
        uint256 sellerShare = dataset.price - platformFee;

        // Transfer funds
        (bool successFee, ) = feeReceiver.call{value: platformFee}("");
        require(successFee, "Failed to send platform fee");

        (bool successSeller, ) = dataset.seller.call{value: sellerShare}("");
        require(successSeller, "Failed to pay seller");

        // Mint the access token to the buyer
        datasetNFT.mintAccess(msg.sender, tokenId);

        emit AccessSold(tokenId, msg.sender, dataset.price);

        if (msg.value > dataset.price) {
            payable(msg.sender).transfer(msg.value - dataset.price);
        }
    }
    
    // --- Admin Functions ---
    function setPlatformFee(uint256 _newFeeBps) external onlyOwner {
        platformFeeBps = _newFeeBps;
    }
}