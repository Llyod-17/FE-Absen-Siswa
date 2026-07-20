import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://api.smart-presence.smkpluspnb.sch.id/api/:path*'
      },
    ];  
  },
};

export default nextConfig;
