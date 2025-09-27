import axios from 'axios';

// Get the backend URL from environment variables, with a fallback
const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: `${API_URL}/api`,
});

/**
 * Fetches all listed datasets from the backend.
 * This is now corrected to handle live data and errors gracefully.
 */
export const getDatasets = async () => {
  try {
    // The backend endpoint returns the data directly
    console.log("this is api url",API_URL);
    const response = await api.get('/datasets');
    console.log("this is datasets received",response.data);
    return response.data; // Should be an array of datasets
  } catch (error) {
    console.error("Error fetching datasets:", error);
    // Return an empty array on error so the UI doesn't break
    // This is crucial for a good user experience.
    return []; 
  }
};

/**
 * Submits a new dataset to the backend.
 * @param {object} datasetData - The data for the new dataset.
 */
export const submitDataset = async (datasetData) => {
    try {
        const response = await api.post('/datasets/submit', datasetData);
        console.log("this is response after submitting the dataset",response.data);
        return response.data;
    } catch (error) {
        console.error("Error submitting dataset:", error);
        // Re-throw the error so the component calling it can handle it (e.g., show a toast)
        throw error;
    }
};
