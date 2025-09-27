import { Brain, CheckCircle, Users } from 'lucide-react';
import { ethers } from 'ethers';
import { useWeb3 } from '../contexts/Web3Context';
import toast from 'react-hot-toast';

// Make sure you have copied the Marketplace.json ABI to this path
import MarketplaceABI from '../../abis/Marketplace.json';

const DatasetCard = ({ dataset }) => {
    const { signer, isConnected, isCorrectNetwork, connectWallet } = useWeb3();

    // --- DATA PARSING LOGIC ---
    // Extract attributes from the live data structure. Provide defaults if not present.
    const complexity = dataset.attributes?.find(a => a.trait_type === "Complexity Score")?.value || 70; // Default to 70 if not found
    const category = dataset.attributes?.find(a => a.trait_type === "Platform/Library")?.value || 'General';
    const verified = true; // Placeholder for future DAO validation
    const purchases = dataset.totalSales || 0; // Assuming totalSales might be added later

    const handleBuy = async () => {
        if (!isConnected) {
            toast.error("Please connect your wallet first!");
            connectWallet();
            return;
        }

        if (!isCorrectNetwork) {
            toast.error("Please switch to the Filecoin Calibration network to make a purchase.");
            return;
        }

        const toastId = toast.loading("Preparing transaction...");
        
        try {
            const marketplaceAddress = import.meta.env.VITE_MARKETPLACE_CONTRACT_ADDRESS;
            const contract = new ethers.Contract(marketplaceAddress, MarketplaceABI.abi, signer);

            const priceInWei = ethers.utils.parseEther(dataset.price.toString());
            
            const tx = await contract.buyAccess(dataset.tokenId, {
                value: priceInWei
            });
            
            toast.loading(`Processing transaction... (${tx.hash.slice(0, 8)}...)`, { id: toastId });

            await tx.wait(); 

            toast.success(`Successfully purchased access to Dataset #${dataset.tokenId}!`, { id: toastId });

        } catch (error) {
            console.error("Purchase failed:", error);
            const errorMessage = error.reason || error.data?.message || error.message || "Transaction failed.";
            toast.error(`Purchase failed: ${errorMessage.substring(0, 60)}...`, { id: toastId });
        }
    };

    const getComplexityClass = (score) => {
        if (score > 70) return 'text-complexity-high bg-complexity-high/10';
        if (score > 40) return 'text-complexity-med bg-complexity-med/10';
        return 'text-complexity-low bg-complexity-low/10';
    };

    return (
        <div className="bg-primary-700 rounded-lg p-6 border border-primary-600 flex flex-col gap-4 transition-all duration-300 hover:scale-[1.02] hover:shadow-glow-purple">
            <div className="flex justify-between items-center text-sm">
                <span className="font-code text-accent-blue bg-accent-blue/10 px-2 py-1 rounded">{category}</span>
                {verified && (
                    <span className="flex items-center gap-2 text-verified">
                        <CheckCircle size={16} /> DAO Verified
                    </span>
                )}
            </div>

            <h3 className="text-xl font-bold text-text-primary">{dataset.name}</h3>
            <p className="text-sm text-text-secondary flex-grow min-h-[40px]">{dataset.description}</p>
            
            <div className="border-t border-primary-600 my-2"></div>

            <div className="flex justify-between items-center text-text-muted text-sm">
                 <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1.5" title="Complexity Score">
                        <Brain size={16} className="text-accent-orange" /> {complexity}
                    </span>
                    <span className="flex items-center gap-1.5" title="Purchases">
                        <Users size={16} className="text-accent-purple" /> {purchases}
                    </span>
                </div>
                <span className={`font-bold px-2 py-1 rounded ${getComplexityClass(complexity)}`}>
                    {complexity > 70 ? 'High' : complexity > 40 ? 'Medium' : 'Low'}
                </span>
            </div>
            
            <div className="border-t border-primary-600 my-2"></div>
            
            <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-text-primary">{dataset.price} tFIL</span>
                    <span className="font-code text-text-muted text-sm truncate w-1/3 text-right" title={dataset.seller}>
                        {`${dataset.seller.substring(0, 6)}...${dataset.seller.substring(dataset.seller.length - 4)}`}
                    </span>
                </div>
                <div className="flex gap-4">
                    <button className="flex-1 bg-transparent border border-accent-purple text-accent-purple font-bold py-2 px-4 rounded-lg hover:bg-accent-purple hover:text-white transition-all">
                        Preview
                    </button>
                    <button 
                        onClick={handleBuy}
                        className="flex-1 bg-gradient-to-r from-accent-blue to-accent-purple text-white font-bold py-2 px-4 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={!isConnected}
                    >
                        Buy Access
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DatasetCard;