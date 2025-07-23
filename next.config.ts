import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Increase API route body size limit to handle image uploads
  experimental: {
    serverComponentsExternalPackages: [],
  },
  // Configure body size limits for API routes
  api: {
    bodyParser: {
      sizeLimit: '10mb', // Increase from default 1mb to 10mb
    },
  },
};

export default nextConfig;
