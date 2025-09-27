import { Code, Brain, DollarSign, CheckCircle, Users, Eye, ShoppingCart } from 'lucide-react';
import { ethers } from 'ethers';

const MarketplaceCard = ({ dataset }) => {
    // Placeholder logic - replace with real data from metadata
    const complexity = dataset.metadata?.attributes?.find(a => a.trait_type === "Complexity Score")?.value || 75;
    const category = dataset.metadata?.attributes?.find(a => a.trait_type === "Platform/Library")?.value || 'Unknown';

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
                    <div className="flex items-center gap-2 text-emerald-400">
                        <CheckCircle className="w-4 h-4" />
                        <span className="text-sm font-medium">Verified</span>
                    </div>
                </div>

                {/* Title */}
                <div>
                    <h3 className="text-xl font-bold text-white group-hover:gradient-text transition-all duration-300">
                        {dataset.metadata.name}
                    </h3>
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
                            <span className="text-sm font-medium text-gray-300">0</span>
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
                            {ethers.utils.formatEther(dataset.price)} tFIL
                        </div>
                        <div className="text-xs text-gray-500 mt-1" title={dataset.seller}>
                            by {dataset.seller}
                        </div>
                    </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                    <button className="btn-outline flex-1 flex items-center justify-center gap-2 py-3">
                        <Eye className="w-4 h-4" />
                        <span className="font-semibold">Preview Q&A</span>
                    </button>
                    <button className="btn-primary flex-1 flex items-center justify-center gap-2 py-3">
                        <ShoppingCart className="w-4 h-4" />
                        <span className="font-semibold">Buy Access</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MarketplaceCard;