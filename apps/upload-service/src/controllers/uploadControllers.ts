import { simpleGit } from "simple-git";
import { generateRandomID } from "../utils/randomID.js";

import type { Request, Response } from "express";
import path from "path";
import fs from "fs";
import { getAllFiles } from "../file.js";
import { uploadFile } from "../aws/aws.js";
import "../env.js";
import { createClient } from "redis";

const publisher = createClient({
  url: process.env.REDIS_URL ?? "redis://127.0.0.1:6379",
});
await publisher.connect();

if (!publisher.isOpen) {
  await publisher.connect();
}

const commonFrontendDirectories = ["apps/web", "apps/frontend", "frontend", "client", "web", "ui"];

function safeProjectDirectory(value: unknown) {
  if (typeof value !== "string" || !value.trim()) return "";
  const normalized = value.trim().replace(/^[/\\]+|[/\\]+$/g, "");
  const segments = normalized.split(/[\\/]+/);
  if (segments.some((segment) => !segment || segment === "." || segment === "..")) {
    throw new Error("Project directory must be a relative folder inside the repository.");
  }
  return segments.join(path.sep);
}

function resolveProjectDirectory(repositoryPath: string, requestedDirectory: string) {
  if (requestedDirectory) {
    const requestedPath = path.resolve(repositoryPath, requestedDirectory);
    if (!requestedPath.startsWith(`${repositoryPath}${path.sep}`) || !fs.existsSync(requestedPath) || !fs.statSync(requestedPath).isDirectory()) {
      throw new Error("The selected project directory does not exist in this repository.");
    }
    return { projectPath: requestedPath, directory: requestedDirectory };
  }

  const detectedDirectory = commonFrontendDirectories.find((directory) =>
    fs.existsSync(path.join(repositoryPath, directory, "package.json")),
  );

  if (detectedDirectory) {
    return { projectPath: path.join(repositoryPath, detectedDirectory), directory: detectedDirectory };
  }

  return { projectPath: repositoryPath, directory: "." };
}

const Deploy = async (req: Request, res: Response) => {
  try {
    const missingR2Config = ["ACCESS_KEY_ID", "SECRET_ACCESS_KEY", "ENDPOINT", "R2_BUCKET_NAME"]
      .filter((name) => !process.env[name]);
    if (missingR2Config.length) {
      return res.status(500).json({
        message: `R2 is not configured. Add ${missingR2Config.join(", ")} to the root .env file.`,
      });
    }

    const { repoUrl } = req.body;
    if (typeof repoUrl !== "string" || !repoUrl.startsWith("https://github.com/")) {
      return res.status(400).json({ message: "Please provide a valid GitHub repository URL." });
    }
    const requestedDirectory = safeProjectDirectory(req.body.rootDirectory);
    const id = generateRandomID();
    const repositoryPath = path.join(process.cwd(), "output", id);
    await simpleGit().clone(repoUrl, repositoryPath);
    const { projectPath, directory } = resolveProjectDirectory(repositoryPath, requestedDirectory);

    const files = getAllFiles(projectPath);
    //Iterate over all the files and upload them to S3 one by one (or together) not s3 but cf r2
    // Use Promise.all to upload all files in parallel, or use for...of for sequential uploads
    await Promise.all(
      files.map(async (file) => {
        const key = path.posix.join("output", id, path.relative(projectPath, file).split(path.sep).join("/"));
        await uploadFile(key, file);
        console.log(`Uploaded: ${key}`);
      })
    );
    //slice function will remove this part users/nraj/zellr/dist/output/122c2/app.js  slice will remove users/nraj/zellr/dist/output + / where 1 was "/"
    //it will eventually give us output/122c2/app.js a clean path to store in r2

    //after files are uploaded to s3 we use publisher below 
    await new Promise((resolve) => setTimeout(resolve, 5000))
    await publisher.hSet("status", id, "uploaded");
    await publisher.lPush("build-queue", id);
    res.status(200).json({
      message: "file uploaded successfully",
      id: id,
      rootDirectory: directory,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};
export default Deploy;
