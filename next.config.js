/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['localhost'],
  },
  env: {
    APP_NAME: 'Morpit',
    APP_URL: process.env.APP_URL || 'https://morpit.fit',
  },
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', 'morpit.fit'],
    },
  },
}

module.exports = nextConfig
