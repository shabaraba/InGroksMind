/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',

  // Next.jsのビルド設定(トラブルシューティング用)
  webpack: (config, { dev, isServer }) => {
    // Netlify環境で問題が発生した場合のデバッグ情報
    if (!dev && !isServer) {
      console.log('Building client bundles for production...');
    }
    // Node.js APIを使用するファイルをクライアントビルドから除外
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        child_process: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },

  // カスタム設定
  images: {
    domains: ['lh3.googleusercontent.com'], // Geminiのアバター画像用
  },

  // 環境変数
  env: {
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  },

  // 動的ルートの設定
  trailingSlash: false,

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