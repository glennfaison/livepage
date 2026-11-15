import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  distDir: process.env.LIVEPAGE_NEXT_DIST_DIR ?? ".next",
  transpilePackages: ["@vercel/speed-insights", "@vercel/analytics"],
  /**
   * Permanent redirect for legacy page-template illustration paths.
   *
   * Five page templates embed `/template-art/*.svg` as image `src` /
   * `fallbackSrc`. Those paths are copied into users' saved pages
   * (localStorage) and into exported standalone HTML (where root-relative
   * paths become absolute against the builder origin). A plain rename would
   * break both. Thumbnails live only in catalog metadata and need no
   * redirect. Keep this rule indefinitely.
   */
  async redirects() {
    return [
      {
        source: "/template-art/:path*",
        destination: "/page-template-art/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
