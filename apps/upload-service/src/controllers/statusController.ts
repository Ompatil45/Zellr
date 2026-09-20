import "../env.js";
import { createClient } from "redis";
import type { Request, Response } from "express";


const subscriber = createClient({
  url: process.env.REDIS_URL ?? "redis://127.0.0.1:6379",
});
await subscriber.connect();

if (!subscriber.isOpen) {
  await subscriber.connect();
}

async function Status(req: Request, res: Response) {
  try {
    const id = req.query.id;

    if (!id) {
      return res.status(400).json({ error: "ID is required" });
    }

    const response = await subscriber.hGet("status", id as string);

    res.json({
      status: response || "not found",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
}

export default Status;
