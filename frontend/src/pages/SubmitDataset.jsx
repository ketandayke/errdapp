import { useState } from 'react';
import { useWeb3 } from '../contexts/Web3Context';
import { submitDataset } from '../services/api';
import toast from 'react-hot-toast';
import { Upload, DollarSign, Code, AlertTriangle, CheckCircle, Sparkles, Brain, Wallet } from 'lucide-react';

const SubmitDataset = () => {
    const { account, isConnected, isCorrectNetwork, connectWallet } = useWeb3();
    const [formData, setFormData] = useState({
        price: '',
        code: '',
        error: '',
        solution: '',
    });
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isConnected || !isCorrectNetwork) {
            toast.error("Please connect your wallet to the Filecoin Calibration network first.");
            if (!isConnected) connectWallet();
            return;
        }

        if (!formData.price || !formData.code || !formData.error || !formData.solution) {
            toast.error("Please fill out all fields.");
            return;
        }

        setIsLoading(true);
        const toastId = toast.loading("Submitting your dataset for AI analysis...");

        try {
            const submissionData = {
                ...formData,
                developerAddress: account,
            };

            const result = await submitDataset(submissionData);
            toast.success(`Dataset successfully listed with Token ID: ${result.tokenId}!`, { id: toastId });
            // Clear form on success
            setFormData({ price: '', code: '', error: '', solution: '' });
        } catch (error) {
            console.error("Submission failed:", error);
            toast.error(error.response?.data?.message || "An error occurred during submission.", { id: toastId });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container mx-auto px-6 py-12">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <Upload className="w-8 h-8 text-indigo-400" />
                        <h1 className="text-4xl md:text-5xl font-extrabold gradient-text">
                            Submit Your Dataset
                        </h1>
                        <Sparkles className="w-8 h-8 text-yellow-400" />
                    </div>
                    <p className="text-lg text-gray-300 max-w-2xl mx-auto">
                        Transform your debugging expertise into a valuable asset. Earn 90% of every sale while helping AI models learn from real-world solutions.
                    </p>
                </div>

                {/* Benefits Cards */}
                <div className="grid md:grid-cols-3 gap-6 mb-12">
                    <div className="card text-center">
                        <div className="p-6 space-y-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-xl flex items-center justify-center mx-auto">
                                <DollarSign className="w-6 h-6 text-green-400" />
                            </div>
                            <h3 className="font-bold text-white">Earn 90%</h3>
                            <p className="text-sm text-gray-400">Keep 90% of every sale</p>
                        </div>
                    </div>
                    <div className="card text-center">
                        <div className="p-6 space-y-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl flex items-center justify-center mx-auto">
                                <Brain className="w-6 h-6 text-purple-400" />
                            </div>
                            <h3 className="font-bold text-white">AI Analysis</h3>
                            <p className="text-sm text-gray-400">Automatic quality scoring</p>
                        </div>
                    </div>
                    <div className="card text-center">
                        <div className="p-6 space-y-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-xl flex items-center justify-center mx-auto">
                                <CheckCircle className="w-6 h-6 text-blue-400" />
                            </div>
                            <h3 className="font-bold text-white">Instant Listing</h3>
                            <p className="text-sm text-gray-400">Go live immediately</p>
                        </div>
                    </div>
                </div>

                {/* Main Form */}
                <div className="card">
                    <div className="p-8">
                        <form className="space-y-8" onSubmit={handleSubmit}>
                            {/* Wallet Address */}
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-gray-300 mb-2 flex items-center gap-2">
                                    <Wallet className="w-4 h-4 text-gray-400" />
                                    <span>Seller Wallet Address</span>
                                    {isConnected && <CheckCircle className="w-4 h-4 text-green-400" />}
                                </label>
                                <input 
                                    type="text" 
                                    disabled 
                                    value={account || "Please connect your wallet"} 
                                    className="input-field w-full opacity-75 cursor-not-allowed"
                                />
                                {!isConnected && (
                                    <p className="text-sm text-amber-400 flex items-center gap-2">
                                        <AlertTriangle className="w-4 h-4" />
                                        Connect your wallet to continue
                                    </p>
                                )}
                            </div>

                            {/* Price */}
                            <div className="space-y-2">
                                <label htmlFor="price" className="block text-sm font-semibold text-gray-300 mb-2 flex items-center gap-2">
                                    <DollarSign className="w-4 h-4 text-green-400" />
                                    Dataset Price (in tFIL)
                                </label>
                                <input 
                                    id="price" 
                                    name="price" 
                                    type="number" 
                                    step="0.01" 
                                    min="0" 
                                    placeholder="e.g., 0.05" 
                                    value={formData.price} 
                                    onChange={handleChange} 
                                    required 
                                    className="input-field w-full"
                                />
                                <p className="text-sm text-gray-500">Set a competitive price to attract buyers</p>
                            </div>

                            {/* Code Snippet */}
                            <div className="space-y-2">
                                <label htmlFor="code" className="block text-sm font-semibold text-gray-300 mb-2 flex items-center gap-2">
                                    <Code className="w-4 h-4 text-blue-400" />
                                    Code Snippet
                                </label>
                                <textarea 
                                    id="code" 
                                    name="code" 
                                    rows="10" 
                                    placeholder="// Paste your code that had the bug or error
function example() {
    // Your buggy code here
    return result;
}" 
                                    value={formData.code} 
                                    onChange={handleChange} 
                                    required 
                                    className="textarea-field w-full font-mono text-sm"
                                />
                                <p className="text-sm text-gray-500">Include the original code that contained the bug</p>
                            </div>

                            {/* Error Description */}
                            <div className="space-y-2">
                                <label htmlFor="error" className="block text-sm font-semibold text-gray-300 mb-2 flex items-center gap-2">
                                    <AlertTriangle className="w-4 h-4 text-red-400" />
                                    Error Log or Description
                                </label>
                                <textarea 
                                    id="error" 
                                    name="error" 
                                    rows="6" 
                                    placeholder="Describe the error you encountered:

• What went wrong?
• Error messages received
• Expected vs actual behavior
• Steps to reproduce"
                                    value={formData.error} 
                                    onChange={handleChange} 
                                    required 
                                    className="textarea-field w-full"
                                />
                                <p className="text-sm text-gray-500">Be specific about the error for better AI analysis</p>
                            </div>

                            {/* Solution */}
                            <div className="space-y-2">
                                <label htmlFor="solution" className="block text-sm font-semibold text-gray-300 mb-2 flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4 text-green-400" />
                                    Solution & Fix
                                </label>
                                <textarea 
                                    id="solution" 
                                    name="solution" 
                                    rows="8" 
                                    placeholder="Explain your solution:

• How did you fix the bug?
• What was the root cause?
• Key insights or lessons learned
• Alternative approaches considered"
                                    value={formData.solution} 
                                    onChange={handleChange} 
                                    required 
                                    className="textarea-field w-full"
                                />
                                <p className="text-sm text-gray-500">Detailed solutions are valued higher by AI training systems</p>
                            </div>

                            {/* Terms and Submit */}
                            <div className="space-y-6 pt-6 border-t border-gray-700">
                                <div className="card bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border-indigo-500/20">
                                    <div className="p-6">
                                        <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                                            <Brain className="w-5 h-5 text-purple-400" />
                                            What happens next?
                                        </h3>
                                        <ul className="space-y-2 text-sm text-gray-300">
                                            <li className="flex items-start gap-2">
                                                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full mt-2 flex-shrink-0"></div>
                                                Your dataset will be analyzed by our AI for quality and complexity scoring
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full mt-2 flex-shrink-0"></div>
                                                An NFT will be minted representing ownership of your dataset
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full mt-2 flex-shrink-0"></div>
                                                Your dataset goes live on the marketplace immediately
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full mt-2 flex-shrink-0"></div>
                                                You earn 90% of every sale, paid instantly to your wallet
                                            </li>
                                        </ul>
                                    </div>
                                </div>

                                <button 
                                    type="submit" 
                                    disabled={isLoading || !isConnected || !isCorrectNetwork} 
                                    className="w-full btn-primary text-lg py-4 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                                >
                                    {isLoading ? (
                                        <>
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            <Upload className="w-5 h-5" />
                                            Submit for AI Analysis
                                            <Sparkles className="w-5 h-5" />
                                        </>
                                    )}
                                </button>

                                {(!isConnected || !isCorrectNetwork) && (
                                    <div className="text-center">
                                        <button
                                            type="button"
                                            onClick={connectWallet}
                                            className="btn-outline inline-flex items-center gap-2"
                                        >
                                            <Wallet className="w-4 h-4" />
                                            Connect Wallet First
                                        </button>
                                    </div>
                                )}
                            </div>
                        </form>
                    </div>
                </div>

                {/* Tips Section */}
                <div className="mt-12 grid md:grid-cols-2 gap-6">
                    <div className="card">
                        <div className="p-6 space-y-4">
                            <h3 className="font-semibold text-white flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-yellow-400" />
                                Tips for Higher Earnings
                            </h3>
                            <ul className="space-y-2 text-sm text-gray-300">
                                <li>• Include detailed error descriptions</li>
                                <li>• Explain your debugging process</li>
                                <li>• Add context about why the bug occurred</li>
                                <li>• Price competitively for your first submissions</li>
                            </ul>
                        </div>
                    </div>
                    <div className="card">
                        <div className="p-6 space-y-4">
                            <h3 className="font-semibold text-white flex items-center gap-2">
                                <CheckCircle className="w-5 h-5 text-green-400" />
                                Quality Standards
                            </h3>
                            <ul className="space-y-2 text-sm text-gray-300">
                                <li>• Real code from actual projects</li>
                                <li>• Clear, reproducible errors</li>
                                <li>• Complete, working solutions</li>
                                <li>• Professional documentation style</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SubmitDataset;