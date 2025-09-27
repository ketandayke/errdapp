import lighthouse from '@lighthouse-web3/sdk';
import { S3Client, PutObjectCommand, CreateBucketCommand, HeadBucketCommand } from "@aws-sdk/client-s3";

// --- Lighthouse Configuration ---
const LIGHTHOUSE_API_KEY = process.env.LIGHTHOUSE_API_KEY;

// --- Akave O3 (S3) Configuration ---
const BUCKET_NAME = process.env.AKAVE_BUCKET_NAME;
const s3Client = new S3Client({
    endpoint: process.env.AKAVE_ENDPOINT,
    region: process.env.AKAVE_REGION,
    credentials: {
        accessKeyId: process.env.AKAVE_ACCESS_KEY_ID,
        secretAccessKey: process.env.AKAVE_SECRET_ACCESS_KEY,
    },
});

/**
 * A self-healing function that runs on server startup to ensure the S3 bucket exists.
 * If the bucket is not found, it will attempt to create it.
 */
const ensureBucketExists = async () => {
    try {
        // HeadBucket is a lightweight command to check for a bucket's existence.
        await s3Client.send(new HeadBucketCommand({ Bucket: BUCKET_NAME }));
        console.log(`[✔] Akave O3 bucket "${BUCKET_NAME}" already exists.`);
    } catch (error) {
        // If the error indicates the bucket doesn't exist, create it.
        if (error.name === 'NoSuchBucket' || error.$metadata?.httpStatusCode === 404) {
            console.warn(`[!] Akave O3 bucket "${BUCKET_NAME}" not found. Attempting to create it...`);
            try {
                await s3Client.send(new CreateBucketCommand({ Bucket: BUCKET_NAME }));
                console.log(`[✔] Successfully created Akave O3 bucket "${BUCKET_NAME}".`);
            } catch (createError) {
                console.error(`[❌] CRITICAL: Failed to create Akave O3 bucket. Please create it manually.`, createError);
                process.exit(1); // Exit if we can't create the bucket
            }
        } else {
            console.error(`[❌] CRITICAL: Error checking Akave O3 bucket. Check your credentials and endpoint.`, error);
            process.exit(1); // Exit on other errors like authentication failure
        }
    }
};
// Run the check when the service is initialized.
ensureBucketExists();


/**
 * Uploads data to Lighthouse for encrypted, persistent storage on Filecoin.
 * @param {object} data - The private data object to upload.
 * @returns {Promise<string>} - The CID of the uploaded data.
 */
export const uploadToLighthouse = async (data) => {
    const dataString = JSON.stringify(data);
    const response = await lighthouse.uploadText(dataString, LIGHTHOUSE_API_KEY);
    if (!response.data.Hash) {
        throw new Error("Lighthouse upload failed, CID not received.");
    }
    console.log(`  Lighthouse CID: ${response.data.Hash}`);
    return response.data.Hash;
};

/**
 * Uploads public metadata to Akave O3 (S3-compatible storage).
 * @param {object} metadata - The public metadata object.
 * @param {string} filename - The desired filename for the object.
 * @returns {Promise<string>} - The public URL of the metadata file.
 */
export const uploadToAkave = async (metadata, filename) => {
    const params = {
        Bucket: BUCKET_NAME,
        Key: filename,
        Body: JSON.stringify(metadata, null, 2),
        ContentType: 'application/json',
        ACL: 'public-read',
    };

    try {
        await s3Client.send(new PutObjectCommand(params));
        // This URL format (virtual-hosted style) is standard for S3-compatible services like Akave O3.
        const endpoint = process.env.AKAVE_ENDPOINT;
        const url = `${endpoint.replace('https://', `https://${BUCKET_NAME}.`)}/${filename}`;
        console.log(`  Akave O3 URL: ${url}`);
        return url;
    } catch (err) {
        console.error("Error uploading to Akave O3:", err);
        throw new Error("Failed to upload public metadata.");
    }
};

