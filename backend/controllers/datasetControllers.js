import { analyzeDataWithGroq } from '../services/aiService.js';
import { uploadToLighthouse, uploadToAkave } from '../services/storageService.js';
import { listDatasetOnChain, fetchAllDatasets } from '../services/blockchainService.js';

/**
 * Controller to handle the submission of a new dataset.
 * This function orchestrates the entire process from AI analysis to on-chain listing.
 */
export const submitDataset = async (req, res) => {
    try {
        console.log("this is body",req.body);
        const { developerAddress, price, code, error, solution } = req.body;
        if (!developerAddress || !price || !code || !error || !solution) {
            return res.status(400).json({ message: "Missing required fields." });
        }
        console.log(`[+] Received submission from ${developerAddress}`);

        // 1. AI Analysis with Groq
        console.log("  [1/4] Analyzing data with Groq...");
        const aiAnalysis = await analyzeDataWithGroq({ code, error, solution });

        // 2. Store Private Data on Lighthouse/Filecoin
        console.log("  [2/4] Storing private data on Lighthouse...");
        const privateData = { code, error, solution, full_analysis: aiAnalysis.fullAnalysis };
        const lighthouseCid = await uploadToLighthouse(privateData);

        // 3. Create and Store Public Metadata on Akave O3
        console.log("  [3/4] Storing public metadata on Akave O3...");
        const metadataFilename = `${Date.now()}-${developerAddress.slice(2, 8)}-metadata.json`;
        const publicMetadata = {
            name: aiAnalysis.title,
            description: aiAnalysis.summary,
            attributes: aiAnalysis.attributes,
            private_data_cid: lighthouseCid,
        };
        const tokenURI = await uploadToAkave(publicMetadata, metadataFilename);

        // 4. List the Dataset on the FVM Blockchain
        console.log("  [4/4] Listing dataset on the FVM...");
        const tokenId = await listDatasetOnChain(
            developerAddress,
            price,
            tokenURI
        );

        console.log(`[✔] Successfully listed dataset with Token ID: ${tokenId}`);
        res.status(201).json({ 
            message: "Dataset listed successfully!", 
            tokenId: tokenId.toString(),
            tokenURI: tokenURI
        });

    } catch (error) {
        console.error("[-] Error in submission process:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};

/**
 * Controller to fetch all datasets for the marketplace view.
 */
export const getAllDatasets = async (req, res) => {
    try {
        const datasets = await fetchAllDatasets();
        res.status(200).json(datasets);
    } catch (error) {
        console.error("[-] Error fetching datasets:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};

