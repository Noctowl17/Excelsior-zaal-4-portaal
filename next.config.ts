import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Nodig voor een lichte, standalone Docker-image (zie Dockerfile).
  output: "standalone",
};

export default nextConfig;
