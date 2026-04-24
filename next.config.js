/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['localhost'],
  },
  env: {
    APP_NAME: 'Morfit',
    APP_URL: process.env.APP_URL || 'https://morfit.fit',
  },
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', 'morfit.fit'],
    },
  },
}

module.exports = nextConfig
