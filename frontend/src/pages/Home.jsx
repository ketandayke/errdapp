import { useState, useEffect } from 'react';
import MarketplaceCard from '../components/marketplace/MarketplaceCard';
import { getDatasets } from '../services/api';
import { DatabaseZap, BrainCircuit, KeyRound, ArrowRight } from 'lucide-react';

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
        <div className="bg-primary-700 rounded-lg p-6 border border-primary-600 animate-pulse space-y-4">
            <div className="flex justify-between items-center">
                <div className="h-5 bg-primary-600 rounded w-1/4"></div>
                <div className="h-5 bg-primary-600 rounded w-1/3"></div>
            </div>
            <div className="space-y-2">
                <div className="h-6 bg-primary-600 rounded w-full"></div>
                <div className="h-4 bg-primary-600 rounded w-5/6"></div>
                <div className="h-4 bg-primary-600 rounded w-4/6"></div>
            </div>
            <div className="border-t border-primary-600 !my-4"></div>
            <div className="flex justify-between items-center">
                <div className="h-5 bg-primary-600 rounded w-1/3"></div>
                <div className="h-5 bg-primary-600 rounded w-1/4"></div>
            </div>
            <div className="border-t border-primary-600 !my-4"></div>
            <div className="flex justify-between items-center">
                <div className="h-8 bg-primary-600 rounded w-1/3"></div>
                <div className="h-4 bg-primary-600 rounded w-1/4"></div>
            </div>
        </div>
    );

    return (
        <div className="container mx-auto px-6">
            {/* Hero Section */}
            <div className="text-center py-20 sm:py-32">
                <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-text-primary">
                    Monetize Your Code.
                    <br />
                    <span className="gradient-text">Power the Future of AI.</span>
                </h1>
                <p className="mt-6 max-w-2xl mx-auto text-lg md:text-xl text-text-secondary">
                    De-Bugger is the first-ever marketplace for tokenized developer knowledge. Turn your solved bugs and programming errors into valuable, tradable datasets used to train next-generation AI coding assistants.
                </p>
                <div className="mt-8 flex justify-center gap-4">
                    <a href="#marketplace" className="bg-accent-purple text-white font-bold py-3 px-8 rounded-lg hover:opacity-90 transition-opacity">
                        Explore Datasets
                    </a>
                    <a href="#" className="bg-primary-600 text-text-secondary font-bold py-3 px-8 rounded-lg hover:bg-primary-700 transition-colors">
                        Submit Your Data
                    </a>
                </div>
            </div>

            {/* Features Section */}
            <div className="py-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-center border-t border-b border-primary-600">
                <div className="flex flex-col items-center gap-4">
                    <div className="bg-accent-blue/10 p-4 rounded-full">
                        <DatabaseZap className="text-accent-blue" size={32} />
                    </div>
                    <h3 className="text-2xl font-bold">Tradable Datasets</h3>
                    <p className="text-text-secondary">
                        Every submission is an on-chain asset. Your expertise becomes a liquid, tradable token, giving you continuous ownership and earning potential in a decentralized economy.
                    </p>
                </div>
                <div className="flex flex-col items-center gap-4">
                    <div className="bg-accent-purple/10 p-4 rounded-full">
                        <BrainCircuit className="text-accent-purple" size={32} />
                    </div>
                    <h3 className="text-2xl font-bold">AI-Powered Insights</h3>
                    <p className="text-text-secondary">
                        Our integrated AI agents analyze every dataset, providing complexity scores, automated tagging, and interactive Q&A previews, ensuring buyers know the exact value of the data.
                    </p>
                </div>
                <div className="flex flex-col items-center gap-4">
                    <div className="bg-accent-green/10 p-4 rounded-full">
                        <KeyRound className="text-accent-green" size={32} />
                    </div>
                    <h3 className="text-2xl font-bold">Instant, Verifiable Access</h3>
                    <p className="text-text-secondary">
                        Purchasing an access token instantly grants you the right to download the full, encrypted dataset from Filecoin. Ownership is verifiable, and access is immediate.
                    </p>
                </div>
            </div>

            {/* Marketplace Section */}
            {/* <div id="marketplace" className="py-20">
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-extrabold text-white mb-2">Explore the Live Marketplace</h2>
                    <p className="text-lg text-text-secondary">Discover unique, real-world error datasets to enhance your AI models.</p>
                </div>
                
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[...Array(3)].map((_, i) => <SkeletonCard key={i} />)}
                    </div>
                ) : !datasets || datasets.length === 0 ? (
                    <div className="text-center py-20 bg-primary-700 rounded-lg">
                        <h3 className="text-2xl font-bold text-accent-orange">The Marketplace is Eager for Data!</h3>
                        <p className="text-text-secondary mt-2">No datasets have been submitted yet. Be the first to contribute.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {datasets.map(dataset => (
                            <MarketplaceCard key={dataset.tokenId} dataset={dataset} />
                        ))}
                    </div>
                )}
            </div> */}
        </div>
    );
};

export default HomePage;