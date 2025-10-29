import createJiti from "jiti";
import type { NextConfig } from "next";
import { fileURLToPath } from "node:url";

const jiti = createJiti(fileURLToPath(import.meta.url));
jiti("./src/env");

const nextConfig: NextConfig = {
  reactStrictMode: false,
};

export default nextConfig;
