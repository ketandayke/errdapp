import { ethers } from 'ethers';
import fs from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

// --- The Universal Fix for Importing JSON in ES Modules ---
// 1. Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// 2. Construct the full path to the ABI file
const marketplaceAbiPath = path.join(__dirname, '../abis/Marketplace.json');
// 3. Read the file synchronously and parse it
const marketplaceAbiFile = fs.readFileSync(marketplaceAbiPath, 'utf8');
const marketplaceAbi = JSON.parse(marketplaceAbiFile);
// --- End of Fix ---

// --- Ethers.js Setup ---
const provider = new ethers.JsonRpcProvider(process.env.FVM_RPC_URL);
const signer = new ethers.Wallet(process.env.SPONSOR_WALLET_PRIVATE_KEY, provider);
const marketplaceContract = new ethers.Contract(process.env.MARKETPLACE_CONTRACT_ADDRESS, marketplaceAbi.abi, signer);

/**
 * Calls the smart contract to list a new dataset.
 * @param {string} developerAddress - The address of the dataset creator.
 * @param {string} price - The price of the dataset in the native token (e.g., "0.5").
 * @param {string} tokenURI - The public URL of the metadata file on Akave.
 * @returns {Promise<BigInt>} - The tokenId of the newly listed dataset.
 */
export const listDatasetOnChain = async (developerAddress, price, tokenURI) => {
    try {
        const priceInWei = ethers.parseEther(price);
        const tx = await marketplaceContract.listDataset(
            developerAddress,
            priceInWei,
            tokenURI
        );
        
        console.log(`  Transaction sent: ${tx.hash}. Waiting for confirmation...`);
        const receipt = await tx.wait();
        
        // Find the event in the transaction receipt to get the tokenId
        const event = receipt.logs.find(log => {
            try {
                const parsedLog = marketplaceContract.interface.parseLog(log);
                return parsedLog?.name === 'DatasetListed';
            } catch (e) {
                return false;
            }
        });
        
        if (!event) {
            console.warn("DatasetListed event not found. Fetching from nextTokenId.");
            const tokenId = await marketplaceContract.nextTokenId() - 1n; // Use BigInt literal
            return tokenId;
        }
        
        const tokenId = event.args.tokenId;
        return tokenId;
    } catch (error) {
        console.error("Error listing dataset on chain:", error);
        throw new Error("Blockchain transaction failed.");
    }
};

/**
 * Fetches all datasets from the blockchain and enriches them with public metadata.
 * @returns {Promise<Array<object>>} - An array of dataset objects.
 */
export const fetchAllDatasets = async () => {
    try {
        const nextTokenId = await marketplaceContract.nextTokenId();
        const datasets = [];

        for (let i = 1; i < nextTokenId; i++) {
            const onChainData = await marketplaceContract.datasets(i);
            if (onChainData.isListed) {
                try {
                    const response = await fetch(onChainData.tokenURI);
                    if (!response.ok) {
                        console.warn(`Could not fetch metadata for tokenId ${i} from ${onChainData.tokenURI}. Status: ${response.status}`);
                        continue; // Skip this dataset if metadata is unavailable
                    }
                    const publicMetadata = await response.json();
                    
                    datasets.push({
                        tokenId: i,
                        seller: onChainData.seller,
                        price: ethers.formatEther(onChainData.price),
                        tokenURI: onChainData.tokenURI,
                        ...publicMetadata
                    });
                } catch (fetchError) {
                     console.warn(`Error fetching or parsing metadata for tokenId ${i}:`, fetchError);
                }
            }
        }
        return datasets.reverse(); // Show newest datasets first
    } catch (error) {
        console.error("Error fetching all datasets:", error);
        throw new Error("Could not retrieve datasets from the blockchain.");
    }
};

