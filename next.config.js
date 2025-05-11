/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Netlify環境ではexport outputを使用
  output: process.env.NETLIFY === 'true' ? 'export' : 'standalone',

  // Netlify環境ではstaticHtmlのエラーを無視
  onDemandEntries: {
    // ページがメモリに保持される期間
    maxInactiveAge: 60 * 60 * 1000,
    // 同時に保持されるページの数
    pagesBufferLength: 5,
  },

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
    // Netlify環境では静的画像のみ使用
    unoptimized: process.env.NETLIFY === 'true',
  },

  // 環境変数
  env: {
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
    NETLIFY: process.env.NETLIFY,
  },

  // SPAモードをサポートするための設定
  // これにより、クライアントサイドのルーティングが有効になる
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