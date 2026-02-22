import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/ors-wms",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
