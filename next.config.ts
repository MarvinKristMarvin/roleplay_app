import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {},
  output: "standalone", // Ensures Render can run Next.js properly
};

export default nextConfig;
