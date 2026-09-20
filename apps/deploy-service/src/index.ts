
import "./env.js";
import { createClient } from "redis";
import { copyFinalDist, downloadS3Folder } from "./aws/aws.js";
import { buildProject } from "./helper.js";
import { detectFramework } from "./framework.js";
import path from "path";

const subscriber = createClient({
  url: process.env.REDIS_URL ?? "redis://127.0.0.1:6379",
});
await subscriber.connect();

const publisher = createClient({
  url: process.env.REDIS_URL ?? "redis://127.0.0.1:6379",
});
await publisher.connect();

async function main() {
    while(1) {
        let id: string | undefined;
        try {
            const res = await subscriber.brPop(
                'build-queue',
                0
            );
            
            if (!res || !res.element) {
                console.log("No items in queue");
                continue;
            }
            
            id = res.element;
            console.log(`Processing build for ID: ${id}`);
            
            // Logs to check the process of deployment
            await downloadS3Folder(`output/${id}`);
            console.log(`Downloaded files for ${id}`);

            const detection = detectFramework(path.join(process.cwd(), `output/${id}`));
            console.log(`Detected ${detection.framework}: ${detection.kind} (${detection.confidence})`, detection.signals);
            if (detection.kind === "dynamic") {
                throw new Error(`${detection.framework} was detected as a dynamic application. Zellr only deploys static sites.`);
            }

            await buildProject(id, detection);
            console.log(`Built project ${id}`);

            await copyFinalDist(id, detection);
            console.log(`Uploaded dist for ${id}`);

            await publisher.hSet("status", id, "deployed");
            console.log(`Deployment complete for ${id}`);
        } catch (err) {
            console.error("Error in main loop:", err);
            if (id) await publisher.hSet("status", id, "failed");
            // Continue processing next item instead of crashing
        }
    }
}

main()
