import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // The control plane imports the framework-free core from `src/` which uses
  // NodeNext-style explicit `.js` import specifiers (resolved to `.ts` by tsc).
  // Teach webpack the same mapping so `next build` can bundle those modules.
  webpack: config => {
    config.resolve.extensionAlias = {
      ...config.resolve.extensionAlias,
      '.js': ['.ts', '.tsx', '.js'],
    };
    return config;
  },
};

export default nextConfig;
