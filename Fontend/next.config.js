/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  allowedDevOrigins: [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://172.21.16.1:3000",
  ],
  experimental: {
    typedRoutes: true,
  },
  env: {
    NEXT_PUBLIC_API_URL:
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
    NEXT_PUBLIC_API_VERSION: process.env.NEXT_PUBLIC_API_VERSION || "v1",
  },
};

module.exports = nextConfig;
