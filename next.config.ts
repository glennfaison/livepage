import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  distDir: process.env.LIVEPAGE_NEXT_DIST_DIR ?? ".next",
  transpilePackages: ["@vercel/speed-insights", "@vercel/analytics"],
  async redirects() {
    return [
      {
        // Permanent redirect so saved pages and exported HTML that still reference
        // the old /template-art/ paths continue to resolve after the rename to
        // /page-template-art/. Do not remove while old content exists in the wild.
        source: "/template-art/:path*",
        destination: "/page-template-art/:path*",
        permanent: true,
      },
    ];
  },
  /* config options here */
};

export default nextConfig;
