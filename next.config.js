/** @type {import('next').NextConfig} */
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig = {
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  images: {
    domains: ['localhost'],
    remotePatterns: [
      // Railway Object Storage / Tigris
      { protocol: 'https', hostname: '*.t3.storageapi.dev' },
      { protocol: 'https', hostname: '*.up.railway.app' },
      // Generic S3-compatible endpoints
      { protocol: 'https', hostname: '*.s3.*.amazonaws.com' },
      { protocol: 'https', hostname: '*.s3.amazonaws.com' },
      { protocol: 'https', hostname: '*.storageapi.dev' },
      // Production backend media proxy
      { protocol: 'https', hostname: 'api.gongafit.com' },
      { protocol: 'http', hostname: 'localhost', port: '4000' },
    ],
  },
};

module.exports = withBundleAnalyzer(nextConfig);
