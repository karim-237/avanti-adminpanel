import type { NextConfig } from 'next'
import withNextIntl from 'next-intl/plugin'

const nextConfig: NextConfig = withNextIntl()({
  images: {
    domains: ['res.cloudinary.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'utfs.io',
        port: '',
      },
    ],
  },

  // 🔥 Ignore uniquement sur Vercel
  typescript: {
    ignoreBuildErrors: process.env.VERCEL === '1',
  },
})

export default nextConfig
