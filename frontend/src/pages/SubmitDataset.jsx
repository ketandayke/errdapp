import { useState } from 'react';
import { useWeb3 } from '../contexts/Web3Context';
import { submitDataset } from '../services/api';
import toast from 'react-hot-toast';

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
        const toastId = toast.loading("Submitting your dataset for analysis...");

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
            <div className="max-w-4xl mx-auto bg-primary-700 p-8 rounded-lg border border-primary-600">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-white mb-2">Submit Your Dataset</h2>
                    <p className="text-text-secondary">Contribute your debugging knowledge and earn 90% of every sale.</p>
                </div>
                <form className="space-y-6" onSubmit={handleSubmit}>
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-2">Your Wallet Address (Seller)</label>
                        <input type="text" disabled value={account || "Please connect your wallet"} className="w-full bg-primary-800 border border-primary-600 rounded-lg p-3 text-text-muted" />
                    </div>
                    <div>
                        <label htmlFor="price" className="block text-sm font-medium text-text-secondary mb-2">Price (in tFIL)</label>
                        <input id="price" name="price" type="number" step="0.01" min="0" placeholder="e.g., 0.05" value={formData.price} onChange={handleChange} required className="w-full bg-primary-800 border border-primary-600 rounded-lg p-3 text-white" />
                    </div>
                    <div>
                        <label htmlFor="code" className="block text-sm font-medium text-text-secondary mb-2">Code Snippet</label>
                        <textarea id="code" name="code" rows="8" placeholder="// The code that caused the error..." value={formData.code} onChange={handleChange} required className="w-full bg-primary-800 border border-primary-600 rounded-lg p-3 text-white font-code"></textarea>
                    </div>
                    <div>
                        <label htmlFor="error" className="block text-sm font-medium text-text-secondary mb-2">Error Log or Description</label>
                        <textarea id="error" name="error" rows="4" placeholder="Describe the error or paste the logs..." value={formData.error} onChange={handleChange} required className="w-full bg-primary-800 border border-primary-600 rounded-lg p-3 text-white font-code"></textarea>
                    </div>
                    <div>
                        <label htmlFor="solution" className="block text-sm font-medium text-text-secondary mb-2">Solution</label>
                        <textarea id="solution" name="solution" rows="4" placeholder="Explain how you fixed it..." value={formData.solution} onChange={handleChange} required className="w-full bg-primary-800 border border-primary-600 rounded-lg p-3 text-white font-code"></textarea>
                    </div>
                    <div className="pt-4">
                        <button type="submit" disabled={isLoading || !isConnected} className="w-full bg-gradient-to-r from-accent-blue to-accent-purple text-white font-bold py-3 px-4 rounded-lg hover:opacity-90 transition-opacity text-lg disabled:opacity-50 disabled:cursor-not-allowed">
                            {isLoading ? "Submitting..." : "Submit for AI Review"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SubmitDataset;