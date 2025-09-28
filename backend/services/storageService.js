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
    // --- THIS IS THE FIX ---
    // This forces the SDK to use the path-style URL (e.g., endpoint/bucket)
    // instead of the virtual-hosted style (e.g., bucket.endpoint)
    forcePathStyle: true,
});

/**
 * A self-healing function that runs on server startup to ensure the S3 bucket exists.
 */
const ensureBucketExists = async () => {
    try {
        await s3Client.send(new HeadBucketCommand({ Bucket: BUCKET_NAME }));
        console.log(`[✔] Akave O3 bucket "${BUCKET_NAME}" is accessible.`);
    } catch (error) {
        if (error.name === 'NoSuchBucket' || error.$metadata?.httpStatusCode === 404) {
            console.warn(`[!] Akave O3 bucket "${BUCKET_NAME}" not found. Attempting to create it...`);
            try {
                await s3Client.send(new CreateBucketCommand({ Bucket: BUCKET_NAME }));
                console.log(`[✔] Successfully created Akave O3 bucket "${BUCKET_NAME}".`);
            } catch (createError) {
                console.error(`[❌] CRITICAL: Failed to create Akave O3 bucket. Please create it manually.`, createError);
                process.exit(1);
            }
        } else {
            console.error(`[❌] CRITICAL: Error checking Akave O3 bucket. Check your credentials and endpoint.`, error);
            process.exit(1);
        }
    }
};
// Run the check when the service is initialized.
ensureBucketExists();


/**
 * Uploads data to Lighthouse for encrypted, persistent storage on Filecoin.
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
 */
export const uploadToAkave = async (metadata, filename) => {
    const params = {
        Bucket: BUCKET_NAME,
        Key: filename,
        Body: JSON.stringify(metadata, null, 2),
        ContentType: 'application/json',
        ACL: 'public-read'
    };

    try {
        await s3Client.send(new PutObjectCommand(params));
        // --- THIS URL IS ALSO CORRECTED ---
        // Now using the path-style URL format.
        const url = `${process.env.AKAVE_ENDPOINT}/${BUCKET_NAME}/${filename}`;
        console.log(`  Akave O3 URL: ${url}`);
        return url;
    } catch (err) {
        console.error("Error uploading to Akave O3:", err);
        throw new Error("Failed to upload public metadata.");
    }
};