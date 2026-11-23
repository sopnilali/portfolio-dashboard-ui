import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    optimizeCss: false, // Disable experimental CSS optimization
  },
  serverExternalPackages: ["@prisma/client", "@prisma/adapter-pg", "pg", "bcryptjs", "jsonwebtoken", "cloudinary"],
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
      };
    }
    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', // Allow ALL HTTPS image sources
      }
    ],
  },
};

export default nextConfig;
