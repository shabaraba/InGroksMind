/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Cloudflare Workers用の設定
  output: 'export', // 静的エクスポート
  distDir: 'out',

  // Cloudflare Workers用のベースパス設定
  // カスタムドメインを使用するため、ベースパスは不要
  basePath: '',

  // Next.jsのビルド設定(トラブルシューティング用)
  webpack: (config, { dev, isServer }) => {
    // 本番ビルド時のデバッグ情報
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
    // 静的エクスポートのため、画像の最適化を無効化
    unoptimized: true,
  },

  // 環境変数
  env: {
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || 'https://in-groks-mind.shaba.dev',
  },

  // SPAモードをサポートするための設定
  // これにより、クライアントサイドのルーティングが有効になる
  trailingSlash: false,
};

module.exports = nextConfig;