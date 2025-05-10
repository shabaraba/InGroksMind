/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  // カスタム設定
  images: {
    domains: ['lh3.googleusercontent.com'], // Geminiのアバター画像用
  },
  // 環境変数
  env: {
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
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