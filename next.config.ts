import withNextIntl from 'next-intl/plugin'
import { join } from 'path'

const nextConfig = withNextIntl()({
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

  typescript: {
    ignoreBuildErrors: process.env.VERCEL === '1',
  },

  experimental: {
    turbo: false, // force Next.js à utiliser Webpack plutôt que Turbopack
  },

  // 🔥 Contourne TS : on ajoute eslint mais TS ne connaît pas cette clé
  eslint: {
    ignoreDuringBuilds: true,
  },

  webpack(config: { module: { rules: { test: RegExp; include: string; type: string; }[]; }; }) {
    // 🔧 Forcer @uploadthing/shared à être traité correctement en ESM
    config.module.rules.push({
      test: /\.cts$/,
      include: join(__dirname, 'node_modules/@uploadthing/shared'),
      type: 'javascript/auto',
    });

    return config;
  },
} as any);

export default nextConfig;
