import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import MarketplaceCard from '../components/marketplace/MarketplaceCard';
import { getDatasets } from '../services/api';
import { DatabaseZap, BrainCircuit, KeyRound, ArrowRight, Sparkles, Zap, Shield } from 'lucide-react';

const HomePage = () => {
    const [datasets, setDatasets] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadDatasets = async () => {
            setLoading(true);
            try {
                const data = await getDatasets();
                setDatasets(data);
            } catch (error) {
                console.error("Failed to load datasets:", error);
            } finally {
                setLoading(false);
            }
        };
        loadDatasets();
    }, []);

    const SkeletonCard = () => (
        <div className="card animate-pulse">
            <div className="p-6 space-y-4">
                <div className="flex justify-between items-center">
                    <div className="h-5 bg-gray-700 rounded-xl w-1/4"></div>
                    <div className="h-5 bg-gray-700 rounded-xl w-1/3"></div>
                </div>
                <div className="space-y-2">
                    <div className="h-6 bg-gray-700 rounded w-full"></div>
                    <div className="h-4 bg-gray-700 rounded w-5/6"></div>
                    <div className="h-4 bg-gray-700 rounded w-4/6"></div>
                </div>
                <div className="border-t border-gray-700 !my-4"></div>
                <div className="flex justify-between items-center">
                    <div className="h-5 bg-gray-700 rounded w-1/3"></div>
                    <div className="h-5 bg-gray-700 rounded w-1/4"></div>
                </div>
                <div className="border-t border-gray-700 !my-4"></div>
                <div className="flex justify-between items-center">
                    <div className="h-8 bg-gray-700 rounded w-1/3"></div>
                    <div className="h-4 bg-gray-700 rounded w-1/4"></div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 via-purple-900/20 to-pink-900/20"></div>
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl"></div>
            
            <div className="relative z-10 container mx-auto px-6">
                {/* Hero Section */}
                <div className="text-center py-20 sm:py-32">
                    <div className="relative">
                        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white leading-tight">
                            Monetize Your Code.
                            <br />
                            <span className="gradient-text">Power the Future of AI.</span>
                        </h1>
                        <div className="absolute -top-4 -right-4 text-yellow-400 animate-bounce">
                            <Sparkles className="w-8 h-8" />
                        </div>
                    </div>
                    <p className="mt-8 max-w-3xl mx-auto text-lg md:text-xl text-gray-300 leading-relaxed">
                        De-Bugger is the first-ever marketplace for tokenized developer knowledge. Turn your solved bugs and programming errors into valuable, tradable datasets used to train next-generation AI coding assistants.
                    </p>
                    <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
                        <Link to="/marketplace" className="btn-primary flex items-center justify-center gap-2 text-lg">
                            <Zap className="w-5 h-5" />
                            Explore Datasets
                            <ArrowRight className="w-5 h-5" />
                        </Link>
                        <Link to="/submit" className="btn-secondary flex items-center justify-center gap-2 text-lg">
                            <DatabaseZap className="w-5 h-5" />
                            Submit Your Data
                        </Link>
                    </div>
                </div>

                {/* Features Section */}
                <div className="py-20">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-white mb-4">Why Choose De-Bugger?</h2>
                        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                            Transform your debugging expertise into a sustainable income stream
                        </p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="card text-center group">
                            <div className="p-8 space-y-6">
                                <div className="relative">
                                    <div className="w-20 h-20 bg-gradient-to-br from-indigo-500/20 to-blue-500/20 rounded-2xl flex items-center justify-center mx-auto border border-indigo-500/30 group-hover:border-indigo-400/50 transition-colors duration-300">
                                        <DatabaseZap className="w-10 h-10 text-indigo-400 group-hover:text-indigo-300 transition-colors duration-300" />
                                    </div>
                                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-pink-500 to-violet-500 rounded-full flex items-center justify-center">
                                        <Sparkles className="w-3 h-3 text-white" />
                                    </div>
                                </div>
                                <h3 className="text-2xl font-bold text-white">Tradable Datasets</h3>
                                <p className="text-gray-400 leading-relaxed">
                                    Every submission is an on-chain asset. Your expertise becomes a liquid, tradable token, giving you continuous ownership and earning potential in a decentralized economy.
                                </p>
                            </div>
                        </div>

                        <div className="card text-center group">
                            <div className="p-8 space-y-6">
                                <div className="relative">
                                    <div className="w-20 h-20 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl flex items-center justify-center mx-auto border border-purple-500/30 group-hover:border-purple-400/50 transition-colors duration-300">
                                        <BrainCircuit className="w-10 h-10 text-purple-400 group-hover:text-purple-300 transition-colors duration-300" />
                                    </div>
                                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center">
                                        <Zap className="w-3 h-3 text-white" />
                                    </div>
                                </div>
                                <h3 className="text-2xl font-bold text-white">AI-Powered Insights</h3>
                                <p className="text-gray-400 leading-relaxed">
                                    Our integrated AI agents analyze every dataset, providing complexity scores, automated tagging, and interactive Q&A previews, ensuring buyers know the exact value of the data.
                                </p>
                            </div>
                        </div>

                        <div className="card text-center group">
                            <div className="p-8 space-y-6">
                                <div className="relative">
                                    <div className="w-20 h-20 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-2xl flex items-center justify-center mx-auto border border-emerald-500/30 group-hover:border-emerald-400/50 transition-colors duration-300">
                                        <KeyRound className="w-10 h-10 text-emerald-400 group-hover:text-emerald-300 transition-colors duration-300" />
                                    </div>
                                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                                        <Shield className="w-3 h-3 text-white" />
                                    </div>
                                </div>
                                <h3 className="text-2xl font-bold text-white">Instant, Verifiable Access</h3>
                                <p className="text-gray-400 leading-relaxed">
                                    Purchasing an access token instantly grants you the right to download the full, encrypted dataset from Filecoin. Ownership is verifiable, and access is immediate.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Section */}
                <div className="py-16">
                    <div className="card">
                        <div className="p-8">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                                <div className="space-y-2">
                                    <div className="text-3xl font-bold gradient-text">1000+</div>
                                    <div className="text-gray-400">Datasets Available</div>
                                </div>
                                <div className="space-y-2">
                                    <div className="text-3xl font-bold gradient-text-secondary">50+</div>
                                    <div className="text-gray-400">Active Developers</div>
                                </div>
                                <div className="space-y-2">
                                    <div className="text-3xl font-bold gradient-text-accent">$10K+</div>
                                    <div className="text-gray-400">Total Earnings</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* CTA Section */}
                <div className="py-20 text-center">
                    <div className="card max-w-4xl mx-auto">
                        <div className="p-12 space-y-8">
                            <h2 className="text-4xl font-bold text-white">
                                Ready to Turn Your Code Into Cash?
                            </h2>
                            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                                Join thousands of developers who are already monetizing their debugging expertise on the world's first AI training data marketplace.
                            </p>
                            <div className="flex flex-col sm:flex-row justify-center gap-4">
                                <Link to="/submit" className="btn-primary text-lg flex items-center justify-center gap-2">
                                    <DatabaseZap className="w-5 h-5" />
                                    Start Earning Today
                                    <ArrowRight className="w-5 h-5" />
                                </Link>
                                <Link to="/marketplace" className="btn-outline text-lg flex items-center justify-center gap-2">
                                    <BrainCircuit className="w-5 h-5" />
                                    Browse Datasets
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomePage;