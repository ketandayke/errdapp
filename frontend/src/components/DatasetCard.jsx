import { Brain, CheckCircle, Users, ShoppingCart, Eye } from 'lucide-react';
import { ethers } from 'ethers';
import { useWeb3 } from '../contexts/Web3Context';
import toast from 'react-hot-toast';

// Make sure you have copied the Marketplace.json ABI to this path
import MarketplaceABI from '../../abis/Marketplace.json';

const DatasetCard = ({ dataset }) => {
    const { signer, isConnected, isCorrectNetwork, connectWallet } = useWeb3();

    // --- DATA PARSING LOGIC ---
    // Extract attributes from the live data structure. Provide defaults if not present.
    const complexity = dataset.attributes?.find(a => a.trait_type === "Complexity Score")?.value || 70;
    const category = dataset.attributes?.find(a => a.trait_type === "Platform/Library")?.value || 'General';
    const verified = true;
    const purchases = dataset.totalSales || 0;

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

    const getComplexityBadge = (score) => {
        if (score > 70) return { class: 'complexity-high', text: 'High' };
        if (score > 40) return { class: 'complexity-medium', text: 'Medium' };
        return { class: 'complexity-low', text: 'Low' };
    };

    const complexityBadge = getComplexityBadge(complexity);

    return (
        <div className="card card-hover group overflow-hidden">
            {/* Gradient overlay for hover effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/0 via-purple-600/0 to-pink-600/0 group-hover:from-indigo-600/5 group-hover:via-purple-600/5 group-hover:to-pink-600/5 transition-all duration-500 rounded-2xl"></div>
            
            <div className="relative p-6 space-y-4">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <span className="px-3 py-1 bg-gradient-to-r from-indigo-500/20 to-blue-500/20 text-indigo-300 text-sm font-semibold rounded-xl border border-indigo-500/30">
                        {category}
                    </span>
                    {verified && (
                        <div className="flex items-center gap-2 text-emerald-400">
                            <CheckCircle className="w-4 h-4" />
                            <span className="text-sm font-medium">Verified</span>
                        </div>
                    )}
                </div>

                {/* Title */}
                <div>
                    <h3 className="text-xl font-bold text-white group-hover:gradient-text transition-all duration-300">
                        {dataset.name}
                    </h3>
                    <p className="text-gray-400 text-sm mt-2 line-clamp-2 leading-relaxed">
                        {dataset.description}
                    </p>
                </div>
                
                {/* Stats */}
                <div className="flex items-center justify-between py-3 border-t border-gray-700/50">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5" title="Complexity Score">
                            <Brain className="w-4 h-4 text-orange-400" />
                            <span className="text-sm font-medium text-gray-300">{complexity}</span>
                        </div>
                        <div className="flex items-center gap-1.5" title="Purchases">
                            <Users className="w-4 h-4 text-purple-400" />
                            <span className="text-sm font-medium text-gray-300">{purchases}</span>
                        </div>
                    </div>
                    <span className={`px-3 py-1 text-xs font-semibold rounded-xl ${complexityBadge.class}`}>
                        {complexityBadge.text}
                    </span>
                </div>
                
                {/* Price and Seller */}
                <div className="flex justify-between items-center py-3 border-t border-gray-700/50">
                    <div>
                        <div className="text-2xl font-bold gradient-text-accent">
                            {dataset.price} tFIL
                        </div>
                        <div className="text-xs text-gray-500 mt-1" title={dataset.seller}>
                            by {`${dataset.seller.substring(0, 6)}...${dataset.seller.substring(dataset.seller.length - 4)}`}
                        </div>
                    </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                    <button className="btn-outline flex-1 flex items-center justify-center gap-2 py-3">
                        <Eye className="w-4 h-4" />
                        <span className="font-semibold">Preview</span>
                    </button>
                    <button 
                        onClick={handleBuy}
                        disabled={!isConnected}
                        className="btn-primary flex-1 flex items-center justify-center gap-2 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <ShoppingCart className="w-4 h-4" />
                        <span className="font-semibold">Buy Access</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DatasetCard;