import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // The PDF route loads a headless browser lazily at request time. Keep these
  // heavy, native-binary deps out of the webpack bundle (they are required()'d
  // in a Node runtime, never traced into the client or edge bundle).
  serverExternalPackages: ['puppeteer-core', '@sparticuz/chromium', 'puppeteer'],
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
