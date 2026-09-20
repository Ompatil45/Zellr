import "../env.js";
import type { Request, Response } from "express";
import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import path from "path";
import { pipeline } from "stream";
import { promisify } from "util";

const pipelineAsync = promisify(pipeline);
const s3Client = new S3Client({
  region: "auto",
  credentials: { accessKeyId: process.env.ACCESS_KEY_ID!, secretAccessKey: process.env.SECRET_ACCESS_KEY! },
  ...(process.env.ENDPOINT ? { endpoint: process.env.ENDPOINT } : {}),
});

const mimeTypes: Record<string, string> = {
  ".css": "text/css; charset=utf-8", ".html": "text/html; charset=utf-8", ".ico": "image/x-icon", ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8", ".map": "application/json; charset=utf-8", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".svg": "image/svg+xml", ".webp": "image/webp", ".woff": "font/woff", ".woff2": "font/woff2",
};

export default async function Subdomain(req: Request, res: Response) {
  try {
    if (req.path === "/health") return res.status(200).json({ status: "ok" });

    // 6g3xo.zellr.localhost -> 6g3xo -> R2 prefix dist/6g3xo/
    const id = req.hostname.split(".")[0];
    if (!id || !/^[a-z0-9]+$/i.test(id)) return res.status(404).send("Unknown deployment host");

    const requestPath = req.path === "/" ? "index.html" : req.path.replace(/^\/+/, "");
    if (requestPath.split("/").some((part) => part === "..")) return res.status(400).send("Invalid path");

    const object = await s3Client.send(new GetObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME || "zellr-bucket",
      Key: `dist/${id}/${requestPath}`,
    }));
    if (!object.Body) return res.status(404).send("File not found");

    const inferredType = mimeTypes[path.extname(requestPath).toLowerCase()] ?? "application/octet-stream";
    // R2 uploads without an explicit ContentType default to octet-stream.
    // Prefer our extension mapping in that case so browsers render HTML/CSS/JS.
    const contentType = object.ContentType && object.ContentType !== "application/octet-stream"
      ? object.ContentType
      : inferredType;
    res.status(200);
    res.setHeader("Content-Type", contentType);
    res.setHeader("Cache-Control", requestPath.includes(".") && requestPath !== "index.html" ? "public, max-age=31536000, immutable" : "no-cache");
    await pipelineAsync(object.Body as NodeJS.ReadableStream, res);
  } catch (error) {
    const code = error && typeof error === "object" && "$metadata" in error ? (error as { $metadata?: { httpStatusCode?: number } }).$metadata?.httpStatusCode : undefined;
    if (code === 404) return res.status(404).send("File not found");
    console.error("Deployment request failed", error);
    if (!res.headersSent) res.status(502).send("Deployment unavailable");
  }
}
