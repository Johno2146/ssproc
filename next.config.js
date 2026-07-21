/** @type {import('next').NextConfig} */
const nextConfig = {
  images: { domains: ["ssproc.co.za"] },
  typescript: { ignoreBuildErrors: true },
  experimental: {
    webpackBuildWorker: false,
  },
  webpack: (config) => {
    config.parallelism = 1;
    return config;
  },
};
module.exports = nextConfig;