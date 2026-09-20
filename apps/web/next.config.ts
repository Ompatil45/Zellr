import type { NextConfig } from "next";
import { resolve } from "node:path";
import dotenv from "dotenv";

dotenv.config({ path: resolve(__dirname, "../../.env") });

const nextConfig: NextConfig = {
  output: "standalone",
  turbopack: {
    // Keep dependency resolution inside this monorepo instead of its parent directory.
    root: resolve(__dirname, "../.."),
  },

  /* config options here */
};

export default nextConfig;
