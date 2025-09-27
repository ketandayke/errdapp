import 'dotenv/config'; // Use 'dotenv/config' for ES Modules
import express from 'express';
import cors from 'cors';
import datasetRoutes from './routes/datasetsRoutes.js';

// --- SERVER SETUP ---
const app = express();
app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(express.json({ limit: '10mb' })); // Allow server to accept JSON in request body

// --- API ROUTES ---
app.get('/',(req,res)=>{
    res.send("working fine with backend");
})
app.use('/api/datasets', datasetRoutes);

// --- START SERVER ---
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`🚀 De-Bugger backend server running on port ${PORT}`);
    console.log(`🔗 Using Marketplace contract at: ${process.env.MARKETPLACE_CONTRACT_ADDRESS}`);
});

