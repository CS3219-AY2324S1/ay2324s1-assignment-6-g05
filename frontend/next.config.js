/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: true,
  },
  output: 'standalone',
  reactStrictMode: false
};

module.exports = nextConfig;
