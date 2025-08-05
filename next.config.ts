import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    serverActions: {
      bodySizeLimit: "20mb",
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "r2.fivemanage.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "proxy.dokku.co.kr",
        port: "",
        pathname: "/screenshot/**",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/api/metrics",
        destination: "http://141.11.194.130:3001/metrics",
      },
    ];
  },
};

export default nextConfig;
