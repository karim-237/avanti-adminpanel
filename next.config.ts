import withNextIntl from 'next-intl/plugin'
import path from 'path'

const nextConfig = withNextIntl()({
  // 🔹 Forcer la transpilation des packages Uploadthing
  transpilePackages: ['uploadthing', '@uploadthing/react', '@uploadthing/shared'],

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

  // 🔹 Bypass TypeScript et ESLint sur Vercel
  typescript: {
    ignoreBuildErrors: process.env.VERCEL === '1',
  },

  eslint: {
    ignoreDuringBuilds: true,
  },

  // 🔹 Désactiver Turbopack pour plus de compatibilité
  experimental: {
    turbo: false,
  },

  // 🔹 Webpack : ignorer certains fichiers problématiques
  webpack(config: any) {
    // ⚡ Ignore les fichiers .cts et .md dans @uploadthing
    config.module.rules.push({
      test: /\.cts$|\.md$/,
      include: path.join(__dirname, 'node_modules/@uploadthing'),
      type: 'javascript/auto',
      use: [],
    })

    return config
  },
} as any) // 🔹 force TS à ignorer les vérifications sur eslint/experimental

export default nextConfig
