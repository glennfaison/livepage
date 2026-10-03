import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  distDir: process.env.LIVEPAGE_NEXT_DIST_DIR ?? ".next",
  /* config options here */
};

export default nextConfig;
