/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  // カスタム設定
  images: {
    domains: ['lh3.googleusercontent.com'], // Geminiのアバター画像用
    // Vercelの画像最適化
    unoptimized: false,
  },
  // 環境変数
  env: {
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  },
  // 静的ファイルのキャッシュ設定
  async headers() {
    return [
      {
        source: '/og-image-home-new.png',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/og-image-static.png',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
  // tmp/og-imagesディレクトリを静的ファイルとして提供
  async rewrites() {
    return [
      {
        source: '/tmp/og-images/:path*',
        destination: '/tmp/og-images/:path*',
      },
    ];
  },
};

module.exports = nextConfig;