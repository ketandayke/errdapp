import express from 'express';
import { submitDataset, getAllDatasets } from '../controllers/datasetControllers.js';

const router = express.Router();

// @route   POST /api/datasets/submit
// @desc    Handles new dataset submissions from developers
router.post('/submit', submitDataset);

// @route   GET /api/datasets
// @desc    Retrieves all listed datasets for the marketplace view
router.get('/', getAllDatasets);

export default router;

