import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactCompiler: true,

  async rewrites() {
    return [
      {
        destination: '/feeds/:feedId/rss',
        source: '/feeds/:feedId.xml',
      },
    ];
  },
};

export default nextConfig;
