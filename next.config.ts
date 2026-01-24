import withNextIntl from 'next-intl/plugin';
import path from 'path';

const nextConfig = withNextIntl()({
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

  typescript: {
    ignoreBuildErrors: process.env.VERCEL === '1',
  },

  eslint: {
    ignoreDuringBuilds: true,
  },

  // ⚡ Désactiver Turbopack et forcer Webpack
  experimental: {
    turbo: false,
  },

  webpack(config: { module: { rules: { test: RegExp; include: string; type: string; use: never[]; }[]; }; }) {
    // ✅ Forcer Webpack à traiter les .cts et ignorer certains fichiers
    config.module.rules.push({
      test: /\.cts$|\.md$/,
      include: path.join(__dirname, 'node_modules/@uploadthing'),
      type: 'javascript/auto',
      use: [],
    });

    return config;
  },
} as any);

export default nextConfig;
