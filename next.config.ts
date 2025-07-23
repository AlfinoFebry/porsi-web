import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // External packages that should not be bundled by webpack
  serverExternalPackages: [],
};

export default nextConfig;
