const hre = require("hardhat");
const fs = require("fs");

async function main() {
  console.log("🚀 Starting deployment to Filecoin...");

  const [deployer] = await hre.ethers.getSigners();

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", balance.toString());

  // Deploy DatasetNFT
  const DatasetNFT = await hre.ethers.getContractFactory("DatasetNFT");
  const nftContract = await DatasetNFT.deploy();
  await nftContract.waitForDeployment();
  const nftAddress = await nftContract.getAddress();
  console.log("✅ DatasetNFT deployed to:", nftAddress);

  // Deploy Marketplace
  const Marketplace = await hre.ethers.getContractFactory("Marketplace");
  const marketplace = await Marketplace.deploy(nftAddress, deployer.address);
  await marketplace.waitForDeployment();
  const marketplaceAddress = await marketplace.getAddress();
  console.log("✅ Marketplace deployed to:", marketplaceAddress);

  // Link contracts
  const linkTx = await nftContract.setMarketplaceAddress(marketplaceAddress);
  await linkTx.wait();
  console.log("✅ Contracts linked successfully!");

  // Save deployment info
  const deploymentInfo = {
    network: hre.network.name,
    chainId: hre.network.config.chainId,
    deployer: deployer.address,
    contracts: {
      DatasetNFT: {
        address: nftAddress,
        transactionHash: nftContract.deploymentTransaction().hash
      },
      Marketplace: {
        address: marketplaceAddress,
        transactionHash: marketplace.deploymentTransaction().hash
      }
    },
    timestamp: new Date().toISOString(),
    blockNumber: await hre.ethers.provider.getBlockNumber()
  };

  if (!fs.existsSync("deployments")) {
    fs.mkdirSync("deployments");
  }
  fs.writeFileSync(
    `deployments/${hre.network.name}-deployment.json`,
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log("🎉 Deployment completed successfully!");
}

main().catch((error) => { console.error(error); process.exitCode = 1; });