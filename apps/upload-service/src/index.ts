import express from "express";
import "./env.js";
import cors from "cors";
import Deploy from "./controllers/uploadControllers.js";
import Status from "./controllers/statusController.js";
// import { uploadFile, listBuckets } from './aws/aws.js'

const app = express();

app.use(cors());
app.use(express.json());

app.post("/upload", Deploy);
// console.log("start upload")
app.get("/status", Status)
app.get("/health", (_req, res) => res.status(200).json({ status: "ok" }));

//below block for object store testing purpose!!!!!!!!!!!!!!!!!!!!!!!
// First, list all available buckets to verify the bucket name
// listBuckets()
//   .then(buckets => {
//     console.log("Available buckets:", buckets);
//     const targetBucket = process.env.R2_BUCKET_NAME || "zellr";
//     if (!buckets.includes(targetBucket)) {
//       console.error(` Bucket "${targetBucket}" not found! Available buckets: ${buckets.join(", ")}`);
//       console.error("Please check your bucket name in Cloudflare R2 dashboard or set R2_BUCKET_NAME env variable.");
//       return;
//     }
//     console.log(`Bucket "${targetBucket}" found!`);
    
//     // Test with a file that actually exists
//     return uploadFile(
//       "test/package.json",  // This will be the key in your R2 bucket
//       "./package.json"  // Use a file that exists, like your package.json
//     );
//   })
//   .then(location => {
//     if (location) {
//       console.log("Upload successful! Location:", location);
//     }
//   })
//   .catch(err => {
//     console.error("Upload failed:", err);
//   });


app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: "Internal server error" });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason: Error | any, promise: Promise<any>) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error: Error) => {
  console.error('Uncaught Exception:', error);
});

// Defaults to 3000 (the port docker-compose maps to host :4000). Outside
// Docker, set PORT=4000 so it does not clash with `next dev` on :3000.
const PORT = Number(process.env.PORT) || 3000;

app.listen(PORT, () => {
  console.log(`Upload service is running on port ${PORT}`);
});
