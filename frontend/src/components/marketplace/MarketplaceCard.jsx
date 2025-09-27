import { Code, Brain, DollarSign, CheckCircle, Users } from 'lucide-react';
import { ethers } from 'ethers';

const MarketplaceCard = ({ dataset }) => {
    // Placeholder logic - replace with real data from metadata
    const complexity = dataset.metadata?.attributes?.find(a => a.trait_type === "Complexity Score")?.value || 75;
    const category = dataset.metadata?.attributes?.find(a => a.trait_type === "Platform/Library")?.value || 'Unknown';

    const getComplexityClass = (score) => {
        if (score > 70) return 'text-complexity-high bg-complexity-high/10';
        if (score > 40) return 'text-complexity-med bg-complexity-med/10';
        return 'text-complexity-low bg-complexity-low/10';
    };
    const getComplexityText = (score) => {
        if (score > 70) return 'High';
        if (score > 40) return 'Medium';
        return 'Low';
    };

    return (
        <div className="bg-primary-700 rounded-lg p-6 border border-primary-600 flex flex-col gap-4 transition-all duration-300 hover:scale-[1.02] hover:shadow-glow-purple">
            <div className="flex justify-between items-center text-sm">
                <span className="font-code text-accent-blue bg-accent-blue/10 px-2 py-1 rounded">{category}</span>
                {/* {dataset.verified && ( */}
                    <span className="flex items-center gap-2 text-verified">
                        <CheckCircle size={16} /> DAO Verified
                    </span>
                {/* )} */}
            </div>

            <h3 className="text-xl font-bold text-text-primary">{dataset.metadata.name}</h3>
            
            <div className="border-t border-primary-600 my-2"></div>

            <div className="flex justify-between items-center text-text-muted text-sm">
                 <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1.5" title="Complexity Score">
                        <Brain size={16} className="text-accent-orange" /> {complexity}
                    </span>
                    <span className="flex items-center gap-1.5" title="Purchases">
                        <Users size={16} className="text-accent-purple" /> 0
                    </span>
                </div>
                <span className={`font-bold px-2 py-1 rounded ${getComplexityClass(complexity)}`}>
                    {getComplexityText(complexity)}
                </span>
            </div>
            
            <div className="border-t border-primary-600 my-2"></div>
            
            <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-text-primary">{ethers.utils.formatEther(dataset.price)} tFIL</span>
                    <span className="font-code text-text-muted text-sm truncate w-1/3 text-right">{dataset.seller}</span>
                </div>
                <div className="flex gap-4">
                    <button className="flex-1 bg-transparent border border-accent-purple text-accent-purple font-bold py-2 px-4 rounded-lg hover:bg-accent-purple hover:text-white transition-all">
                        Preview Q&A
                    </button>
                    <button className="flex-1 bg-gradient-to-r from-accent-blue to-accent-purple text-white font-bold py-2 px-4 rounded-lg hover:opacity-90 transition-opacity">
                        Buy Access
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MarketplaceCard;
