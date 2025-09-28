import { useState, useEffect } from 'react';
import { useWeb3 } from '../contexts/Web3Context';
import { getDatasets } from '../services/api';
import { ethers } from 'ethers';
import toast from 'react-hot-toast';
import { Download, ExternalLink, Brain, Upload, User, ShoppingBag, Wallet, Eye, TrendingUp, Calendar } from 'lucide-react';

// Import both ABIs - make sure paths are correct
import MarketplaceABI from '../../abis/Marketplace.json';
import DatasetNFTABI from '../../abis/DatasetNFT.json';

// Enhanced card component for owned/submitted datasets
const OwnedDatasetCard = ({ dataset, type = 'purchase' }) => {
    const { signer } = useWeb3();

    const category = dataset.attributes?.find(a => a.trait_type === "Platform/Library")?.value || 'General';
    const complexity = dataset.attributes?.find(a => a.trait_type === "Complexity Score")?.value || 70;

    const handleDownload = async () => {
        const toastId = toast.loading("Preparing secure download...");
    
        try {
            const url = `https://files.lighthouse.storage/viewFile/${dataset.private_data_cid}`;
            console.log("Downloading from:", url);
    
            // Trigger download by opening in new tab (or use `window.location.href` for direct)
            window.open(url, "_blank");
    
            toast.success("Download started!", { id: toastId, duration: 4000 });
        } catch (error) {
            console.error("Download failed:", error);
            toast.error("Download failed. See console for details.", { id: toastId });
        }
    };
    
    
    const explorerUrl = `https://calibration.filfox.info/en/token/${import.meta.env.VITE_NFT_CONTRACT_ADDRESS}?a=${dataset.tokenId}`;

    const getComplexityBadge = (score) => {
        if (score > 70) return { class: 'complexity-high', text: 'High' };
        if (score > 40) return { class: 'complexity-medium', text: 'Medium' };
        return { class: 'complexity-low', text: 'Low' };
    };

    const complexityBadge = getComplexityBadge(complexity);

    return (
        <div className="card group overflow-hidden">
            <div className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                    {/* Dataset Info */}
                    <div className="flex-1 space-y-4">
                        <div className="flex items-start gap-4">
                            <div className={`p-3 rounded-xl ${
                                type === 'purchase' 
                                    ? 'bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30' 
                                    : 'bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30'
                            }`}>
                                {type === 'purchase' 
                                    ? <Download className="w-6 h-6 text-emerald-400" />
                                    : <Upload className="w-6 h-6 text-indigo-400" />
                                }
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="text-xl font-bold text-white mb-2 group-hover:gradient-text transition-all duration-300">
                                    {dataset.name}
                                </h3>
                                <div className="flex flex-wrap items-center gap-3 text-sm text-gray-400">
                                    <span className="flex items-center gap-1">
                                        <Calendar className="w-4 h-4" />
                                        Token #{dataset.tokenId}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Brain className="w-4 h-4" />
                                        {category}
                                    </span>
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-lg ${complexityBadge.class}`}>
                                        {complexityBadge.text} Complexity
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Stats for submissions */}
                        {type === 'submission' && (
                            <div className="flex items-center gap-6 pt-2">
                                <div className="flex items-center gap-2 text-emerald-400">
                                    <TrendingUp className="w-4 h-4" />
                                    <span className="text-sm font-semibold">
                                        {dataset.price} tFIL
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 text-purple-400">
                                    <ShoppingBag className="w-4 h-4" />
                                    <span className="text-sm">
                                        {dataset.totalSales || 0} sales
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3 flex-shrink-0">
                        <a 
                            href={explorerUrl} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="btn-secondary flex items-center gap-2"
                        >
                            <ExternalLink className="w-4 h-4" />
                            <span className="hidden sm:inline">Explorer</span>
                        </a>
                        
                        {type === 'purchase' ? (
                            <button 
                                onClick={handleDownload}
                                className="btn-primary flex items-center gap-2"
                            >
                                <Download className="w-4 h-4" />
                                <span className="hidden sm:inline">Download</span>
                            </button>
                        ) : (
                            <button className="btn-outline flex items-center gap-2">
                                <Eye className="w-4 h-4" />
                                <span className="hidden sm:inline">Preview</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const MyDatasets = () => {
    const { account, provider, isConnected } = useWeb3();
    const [purchasedDatasets, setPurchasedDatasets] = useState([]);
    const [submittedDatasets, setSubmittedDatasets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('purchases');

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
                
                const mySubmissions = allDatasets.filter(d => d.seller.toLowerCase() === account.toLowerCase());
                setSubmittedDatasets(mySubmissions);

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
            <div className="min-h-screen flex items-center justify-center">
                <div className="card text-center max-w-md">
                    <div className="p-12 space-y-6">
                        <div className="w-20 h-20 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center mx-auto">
                            <Wallet className="w-10 h-10 text-indigo-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-white">Connect Your Wallet</h2>
                        <p className="text-gray-400">
                            Please connect your wallet to view your purchased and submitted datasets.
                        </p>
                    </div>
                </div>
            </div>
        );
    }
    
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center space-y-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto"></div>
                    <p className="text-lg text-gray-300">Loading your datasets from the blockchain...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/10 via-purple-900/10 to-pink-900/10"></div>
            <div className="absolute top-0 right-1/4 w-72 h-72 bg-purple-500/5 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-1/4 w-72 h-72 bg-indigo-500/5 rounded-full blur-3xl"></div>
            
            <div className="relative z-10 container mx-auto px-6 py-12">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <User className="w-8 h-8 text-indigo-400" />
                        <h1 className="text-4xl md:text-5xl font-extrabold gradient-text">
                            My Datasets
                        </h1>
                    </div>
                    <p className="text-lg text-gray-300 max-w-2xl mx-auto">
                        Manage your purchased datasets and track your submission performance.
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid md:grid-cols-3 gap-6 mb-12">
                    <div className="card text-center">
                        <div className="p-6 space-y-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-xl flex items-center justify-center mx-auto">
                                <Download className="w-6 h-6 text-emerald-400" />
                            </div>
                            <div className="text-2xl font-bold text-white">{purchasedDatasets.length}</div>
                            <div className="text-sm text-gray-400">Purchased</div>
                        </div>
                    </div>
                    <div className="card text-center">
                        <div className="p-6 space-y-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-xl flex items-center justify-center mx-auto">
                                <Upload className="w-6 h-6 text-indigo-400" />
                            </div>
                            <div className="text-2xl font-bold text-white">{submittedDatasets.length}</div>
                            <div className="text-sm text-gray-400">Submitted</div>
                        </div>
                    </div>
                    <div className="card text-center">
                        <div className="p-6 space-y-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl flex items-center justify-center mx-auto">
                                <TrendingUp className="w-6 h-6 text-purple-400" />
                            </div>
                            <div className="text-2xl font-bold text-white">
                                {submittedDatasets.reduce((total, dataset) => total + (dataset.totalSales || 0), 0)}
                            </div>
                            <div className="text-sm text-gray-400">Total Sales</div>
                        </div>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="card mb-8">
                    <div className="p-2">
                        <div className="flex bg-gray-800/50 rounded-xl overflow-hidden">
                            <button
                                onClick={() => setActiveTab('purchases')}
                                className={`flex-1 flex items-center justify-center gap-3 py-3 px-6 font-semibold transition-all duration-300 ${
                                    activeTab === 'purchases'
                                        ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg'
                                        : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                                }`}
                            >
                                <Download className="w-5 h-5" />
                                My Purchases ({purchasedDatasets.length})
                            </button>
                            <button
                                onClick={() => setActiveTab('submissions')}
                                className={`flex-1 flex items-center justify-center gap-3 py-3 px-6 font-semibold transition-all duration-300 ${
                                    activeTab === 'submissions'
                                        ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg'
                                        : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                                }`}
                            >
                                <Upload className="w-5 h-5" />
                                My Submissions ({submittedDatasets.length})
                            </button>
                        </div>
                    </div>
                </div>

                {/* Dataset Lists */}
                <div className="max-w-6xl mx-auto">
                    {activeTab === 'purchases' ? (
                        <div className="space-y-6">
                            {purchasedDatasets.length === 0 ? (
                                <div className="card text-center py-16">
                                    <div className="space-y-4">
                                        <div className="w-24 h-24 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto">
                                            <ShoppingBag className="w-12 h-12 text-gray-500" />
                                        </div>
                                        <h3 className="text-2xl font-bold text-gray-300">No Purchases Yet</h3>
                                        <p className="text-gray-500 max-w-md mx-auto">
                                            Browse the marketplace to discover valuable datasets for your AI training needs.
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                purchasedDatasets.map(dataset => (
                                    <OwnedDatasetCard 
                                        key={`purchase-${dataset.tokenId}`} 
                                        dataset={dataset} 
                                        type="purchase" 
                                    />
                                ))
                            )}
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {submittedDatasets.length === 0 ? (
                                <div className="card text-center py-16">
                                    <div className="space-y-4">
                                        <div className="w-24 h-24 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto">
                                            <Upload className="w-12 h-12 text-gray-500" />
                                        </div>
                                        <h3 className="text-2xl font-bold text-gray-300">No Submissions Yet</h3>
                                        <p className="text-gray-500 max-w-md mx-auto">
                                            Start monetizing your debugging expertise by submitting your first dataset.
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                submittedDatasets.map(dataset => (
                                    <OwnedDatasetCard 
                                        key={`submission-${dataset.tokenId}`} 
                                        dataset={dataset} 
                                        type="submission" 
                                    />
                                ))
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MyDatasets;