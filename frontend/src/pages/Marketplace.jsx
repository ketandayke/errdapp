import { useState, useEffect } from 'react';
import DatasetCard from '../components/DatasetCard';
import { getDatasets } from '../services/api';

const Marketplace = () => {
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

    // A more detailed skeleton loader for a better UX
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
        <div className="container mx-auto px-6 py-12">
            <div className="text-center mb-12">
                <h2 className="text-4xl font-extrabold text-white mb-2">The Knowledge Marketplace</h2>
                <p className="text-lg text-text-secondary">Turn debugging expertise into a valuable, tradable asset.</p>
            </div>
            
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
                </div>
            ) : !datasets || datasets.length === 0 ? (
                <div className="text-center py-20">
                    <h3 className="text-2xl font-bold text-accent-orange">No Datasets Found</h3>
                    <p className="text-text-secondary mt-2">Be the first to submit a dataset and start earning!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {datasets.map(dataset => (
                        <DatasetCard key={dataset.tokenId} dataset={dataset} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default Marketplace;