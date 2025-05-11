# BeGrok Next.js版

このプロジェクトは、BeGrokアプリケーションをNext.jsで再実装したものです。データベースを使わずに、サーバーサイドレンダリング（SSR）と動的OGP画像生成機能を備えています。

## 主な機能

- サーバーサイドレンダリング (SSR) を活用したSEO対応
- API Routesを使った動的OGP画像生成（アクセスごとに生成）
- データベースを使わないクエリパラメータベースの状態管理
- Twitter/X風UIでのクイズ表示と回答機能
- 多言語対応（日本語・英語）
- 自動配信するOG画像によるSNS共有の拡散性向上

## インストール方法

```bash
# 依存関係のインストール
npm install

# 開発サーバー起動
npm run dev

# 本番用ビルド
npm run build

# ビルド後のプレビュー
npm run start
```

## 環境変数

プロジェクトのルートに `.env.local` ファイルを作成し、以下の環境変数を設定してください：

```
# Gemini API Key (Google AI Studio から取得)
GEMINI_API_KEY=your_gemini_api_key_here

# 本番環境でAPI使用の設定
NEXT_PUBLIC_USE_GEMINI_API=true
```

## 構造

```
/pages
  - index.tsx (ホームページ)
  - result/[id].tsx (結果ページ - SSR対応)
  - api/
    - og-image/[id].ts (動的OGP画像生成API)
    - evaluate-answer.ts (回答評価API)

/components
  - インターフェース用コンポーネント

/data
  - quizData.ts (クイズデータ)
  - styleVariations.ts (スタイルバリエーション)

/i18n
  - translations.ts (多言語翻訳)

/utils
  - geminiService.ts (Gemini API連携)
  - imageUtils.ts (画像生成ユーティリティ)
  - types.ts (型定義)
```

## Netlifyへのデプロイ

このプロジェクトは、Netlifyへのデプロイに最適化されています。以下の手順でデプロイしてください：

1. Netlify CLIをインストール：`npm install -g netlify-cli`
2. ログイン：`netlify login`
3. プロジェクトの初期化：`netlify init`
4. 環境変数の設定：Netlifyダッシュボードで以下の環境変数を設定
   - `GEMINI_API_KEY`：Gemini APIキー
   - `NEXT_PUBLIC_USE_GEMINI_API`：`true`
5. デプロイ：`netlify deploy --prod`

## OGP画像の動的生成の仕組み

1. ユーザーが回答提出時にスコアを含む一意のID（`quizId-styleId-score-timestamp`形式）を生成
2. 結果ページ（`/result/[id]`）でそのIDを解析し、Server-Side Rendering中にOG画像URLを生成
3. `/api/og-image/[id]`エンドポイントが、IDに基づいてNode Canvas APIで動的にOG画像を生成・返却
4. SNSでシェアされたとき、常に新しいOG画像が生成される

### Canvas実装について

当初は`skia-canvas`ライブラリを使用していましたが、Netlifyデプロイ環境でGLIBC_2.28依存関係の問題が発生したため、`node-canvas`ライブラリに移行しました。これにより以下の変更が行われました：

- `skia-canvas`の代わりに`node-canvas`パッケージを使用
- `new Canvas()`の代わりに`createCanvas()`メソッドを使用
- `canvas.toBuffer('png')`の代わりに`canvas.toBuffer('image/png')`を使用（MIME型の指定が必要）
- `netlify.toml`から特別なCanvas依存関係の環境変数を削除

## レスポンシブ対応

このアプリケーションは、以下のブレイクポイントでレスポンシブ対応しています：

- モバイル：600px未満
- タブレット：600px以上、1024px未満
- デスクトップ：1024px以上

## ライセンス

このプロジェクトは、MITライセンスの下でオープンソースとして公開されています。