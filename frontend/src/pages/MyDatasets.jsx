import { useState, useEffect } from 'react';
import { useWeb3 } from '../contexts/Web3Context';
import { getDatasets } from '../services/api';
import { ethers } from 'ethers';
import toast from 'react-hot-toast';
import { Download, ExternalLink, Brain, Upload } from 'lucide-react';

// Import both ABIs - make sure paths are correct
import MarketplaceABI from '../../../contracts/artifacts/contracts/Marketplace.sol/Marketplace.json';
import DatasetNFTABI from '../../../contracts/artifacts/contracts/DatasetNFT.sol/DatasetNFT.json';


// A new, more detailed card for displaying owned/submitted datasets
const OwnedDatasetCard = ({ dataset, type = 'purchase' }) => {
    const { signer } = useWeb3();

    const category = dataset.attributes?.find(a => a.trait_type === "Platform/Library")?.value || 'General';

    const handleDownload = async () => {
        const toastId = toast.loading("Preparing secure download...");
        
        try {
            // This is where you would integrate the Lighthouse SDK on the frontend
            console.log("Attempting to download private data for CID:", dataset.private_data_cid);
            
            // Example of how you would generate the auth message for Lighthouse
            const message = await signer.signMessage(`I am signing a message to download CID: ${dataset.private_data_cid}`);
            console.log("Generated Auth Signature:", message);
            
            // You would now pass the CID and the signed message to the Lighthouse SDK's download function.
            // const decryptedFile = await lighthouse.fetch(dataset.private_data_cid, message);

            toast.success("Download would start here! Check the console for details.", { id: toastId, duration: 5000 });

        } catch(error) {
            console.error("Download failed:", error);
            toast.error("Download failed. See console for details.", { id: toastId });
        }
    };
    
    // Construct the block explorer URL
    const explorerUrl = `https://calibration.filfox.info/en/token/${import.meta.env.VITE_NFT_CONTRACT_ADDRESS}?a=${dataset.tokenId}`;

    return (
        <div className="bg-primary-700 p-4 rounded-lg flex flex-col sm:flex-row justify-between items-center border border-primary-600 gap-4">
            <div className="flex-grow">
                <div className="flex items-center gap-3">
                     <span className={`p-2 rounded-full ${type === 'purchase' ? 'bg-accent-green/10' : 'bg-accent-blue/10'}`}>
                        {type === 'purchase' ? <Download className="text-accent-green" size={20}/> : <Upload className="text-accent-blue" size={20}/>}
                    </span>
                    <div>
                        <h3 className="font-bold text-lg text-text-primary">{dataset.name}</h3>
                        <p className="text-sm text-text-muted">Token ID: {dataset.tokenId} • Category: {category}</p>
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
                 <a href={explorerUrl} target="_blank" rel="noopener noreferrer" className="bg-primary-600 text-text-secondary font-bold py-2 px-4 rounded-lg hover:bg-primary-800 transition-colors flex items-center gap-2">
                    <ExternalLink size={16} />
                    Explorer
                </a>
                {type === 'purchase' && (
                    <button 
                        onClick={handleDownload}
                        className="bg-accent-green text-white font-bold py-2 px-4 rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2"
                    >
                        <Download size={16} />
                        Download Data
                    </button>
                )}
            </div>
        </div>
    );
};


const MyDatasets = () => {
    const { account, provider, isConnected } = useWeb3();
    const [purchasedDatasets, setPurchasedDatasets] = useState([]);
    const [submittedDatasets, setSubmittedDatasets] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMyDatasets = async () => {
            if (!isConnected || !provider || !account) {
                setLoading(false);
                return;
            }

            setLoading(true);
            try {
                const allDatasets = await getDatasets();
                if (allDatasets.length === 0) {
                    setPurchasedDatasets([]);
                    setSubmittedDatasets([]);
                    return;
                }
                
                // Filter for datasets submitted by the current user
                const mySubmissions = allDatasets.filter(d => d.seller.toLowerCase() === account.toLowerCase());
                setSubmittedDatasets(mySubmissions);

                // Check balances to find purchased datasets
                const nftContractAddress = import.meta.env.VITE_NFT_CONTRACT_ADDRESS;
                const nftContract = new ethers.Contract(nftContractAddress, DatasetNFTABI.abi, provider);

                const balanceChecks = allDatasets.map(dataset => 
                    nftContract.balanceOf(account, dataset.tokenId)
                );
                
                const balances = await Promise.all(balanceChecks);

                const myPurchases = allDatasets.filter((_, index) => balances[index].gt(0));
                
                setPurchasedDatasets(myPurchases);

            } catch (error) {
                console.error("Failed to fetch owned datasets:", error);
                toast.error("Could not fetch your datasets.");
            } finally {
                setLoading(false);
            }
        };

        fetchMyDatasets();
    }, [account, isConnected, provider]);


    if (!isConnected) {
        return (
            <div className="text-center p-12">
                <h2 className="text-3xl font-bold text-white mb-2">My Datasets</h2>
                <p className="text-text-secondary mt-4">Please connect your wallet to view your purchased and submitted datasets.</p>
            </div>
        );
    }
    
    if (loading) {
        return <div className="text-center p-10 text-lg text-text-secondary">Loading your datasets from the blockchain...</div>;
    }

    return (
        <div className="container mx-auto px-6 py-12">
            <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-white mb-2">My Datasets</h2>
                <p className="text-text-secondary">Access your purchased knowledge and track your submissions.</p>
            </div>

            <div className="max-w-4xl mx-auto space-y-8">
                {/* Purchased Datasets Section */}
                <div>
                    <h3 className="text-2xl font-bold text-white mb-4 border-b-2 border-primary-600 pb-2 flex items-center gap-3">
                        <Download className="text-accent-green"/> My Purchases
                    </h3>
                    {purchasedDatasets.length === 0 ? (
                        <p className="text-center text-text-muted p-4">You haven't purchased any datasets yet.</p>
                    ) : (
                        <div className="space-y-4">
                            {purchasedDatasets.map(dataset => (
                                <OwnedDatasetCard key={`purchase-${dataset.tokenId}`} dataset={dataset} type="purchase" />
                            ))}
                        </div>
                    )}
                </div>

                {/* Submitted Datasets Section */}
                <div>
                    <h3 className="text-2xl font-bold text-white mb-4 border-b-2 border-primary-600 pb-2 flex items-center gap-3">
                        <Upload className="text-accent-blue"/> My Submissions
                    </h3>
                    {submittedDatasets.length === 0 ? (
                        <p className="text-center text-text-muted p-4">You haven't submitted any datasets yet.</p>
                    ) : (
                        <div className="space-y-4">
                            {submittedDatasets.map(dataset => (
                                <OwnedDatasetCard key={`submission-${dataset.tokenId}`} dataset={dataset} type="submission" />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MyDatasets;