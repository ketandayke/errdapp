import { useState, useEffect } from 'react';
import DatasetCard from '../components/DatasetCard';
import { getDatasets } from '../services/api';
import { Search, Filter, SortDesc, Grid3X3, List, Sparkles } from 'lucide-react';

const Marketplace = () => {
    const [datasets, setDatasets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('newest');
    const [filterCategory, setFilterCategory] = useState('all');
    const [viewMode, setViewMode] = useState('grid');

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

    // Filter and sort datasets
    const filteredDatasets = datasets
        .filter(dataset => {
            const matchesSearch = dataset.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                dataset.description?.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = filterCategory === 'all' || 
                                  dataset.attributes?.find(a => a.trait_type === "Platform/Library")?.value === filterCategory;
            return matchesSearch && matchesCategory;
        })
        .sort((a, b) => {
            switch (sortBy) {
                case 'price-low':
                    return parseFloat(a.price) - parseFloat(b.price);
                case 'price-high':
                    return parseFloat(b.price) - parseFloat(a.price);
                case 'popularity':
                    return (b.totalSales || 0) - (a.totalSales || 0);
                default:
                    return b.tokenId - a.tokenId; // newest first
            }
        });

    const categories = ['all', 'JavaScript', 'Python', 'React', 'Node.js', 'General'];

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
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/10 via-purple-900/10 to-pink-900/10"></div>
            <div className="absolute top-0 left-1/3 w-72 h-72 bg-purple-500/5 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 right-1/3 w-72 h-72 bg-indigo-500/5 rounded-full blur-3xl"></div>
            
            <div className="relative z-10 container mx-auto px-6 py-12">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <Sparkles className="w-8 h-8 text-yellow-400" />
                        <h1 className="text-4xl md:text-5xl font-extrabold gradient-text">
                            Knowledge Marketplace
                        </h1>
                        <Sparkles className="w-8 h-8 text-yellow-400" />
                    </div>
                    <p className="text-lg text-gray-300 max-w-2xl mx-auto">
                        Discover and purchase premium debugging datasets to enhance your AI models and development skills.
                    </p>
                </div>

                {/* Search and Filters */}
                <div className="card mb-8">
                    <div className="p-6">
                        <div className="flex flex-col lg:flex-row gap-4 items-center">
                            {/* Search */}
                            <div className="relative flex-1 w-full">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    placeholder="Search datasets..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="input-field pl-10 w-full"
                                />
                            </div>

                            {/* Category Filter */}
                            <div className="relative">
                                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <select
                                    value={filterCategory}
                                    onChange={(e) => setFilterCategory(e.target.value)}
                                    className="input-field pl-10 pr-8 appearance-none cursor-pointer"
                                >
                                    {categories.map(category => (
                                        <option key={category} value={category} className="bg-gray-800">
                                            {category === 'all' ? 'All Categories' : category}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Sort */}
                            <div className="relative">
                                <SortDesc className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="input-field pl-10 pr-8 appearance-none cursor-pointer"
                                >
                                    <option value="newest" className="bg-gray-800">Newest First</option>
                                    <option value="price-low" className="bg-gray-800">Price: Low to High</option>
                                    <option value="price-high" className="bg-gray-800">Price: High to Low</option>
                                    <option value="popularity" className="bg-gray-800">Most Popular</option>
                                </select>
                            </div>

                            {/* View Mode */}
                            <div className="flex bg-gray-800/50 rounded-xl border border-gray-600/50 overflow-hidden">
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`p-3 transition-colors duration-200 ${
                                        viewMode === 'grid' ? 'bg-indigo-500 text-white' : 'text-gray-400 hover:text-white'
                                    }`}
                                >
                                    <Grid3X3 className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`p-3 transition-colors duration-200 ${
                                        viewMode === 'list' ? 'bg-indigo-500 text-white' : 'text-gray-400 hover:text-white'
                                    }`}
                                >
                                    <List className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Results Counter */}
                {!loading && (
                    <div className="flex items-center justify-between mb-6">
                        <p className="text-gray-400">
                            Showing <span className="text-white font-semibold">{filteredDatasets.length}</span> dataset{filteredDatasets.length !== 1 ? 's' : ''}
                            {searchTerm && (
                                <span> for "<span className="text-indigo-400">{searchTerm}</span>"</span>
                            )}
                        </p>
                    </div>
                )}
                
                {/* Datasets Grid/List */}
                {loading ? (
                    <div className={`grid ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'} gap-6`}>
                        {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
                    </div>
                ) : filteredDatasets.length === 0 ? (
                    <div className="card text-center py-16">
                        <div className="space-y-4">
                            <div className="w-24 h-24 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto">
                                <Search className="w-12 h-12 text-gray-500" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-300">No Datasets Found</h3>
                            <p className="text-gray-500 max-w-md mx-auto">
                                {searchTerm || filterCategory !== 'all' 
                                    ? "Try adjusting your search or filter criteria." 
                                    : "Be the first to submit a dataset and start earning!"
                                }
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className={`grid gap-6 ${
                        viewMode === 'grid' 
                            ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
                            : 'grid-cols-1 max-w-4xl mx-auto'
                    }`}>
                        {filteredDatasets.map(dataset => (
                            <DatasetCard 
                                key={dataset.tokenId} 
                                dataset={dataset} 
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Marketplace;