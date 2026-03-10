/** @type {import('next').NextConfig} - no redirects/rewrites/headers to avoid route src/source errors */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;
