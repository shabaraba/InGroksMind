# Gemini API セットアップガイド

このアプリケーションはGoogle Gemini APIを使用してユーザーの回答を評価します。以下の手順に従ってAPIキーを取得し、設定してください。

## 1. Google AI Studio APIキーの取得

1. [Google AI Studio](https://makersuite.google.com/app/apikey) にアクセスします。
2. Googleアカウントでログインします（まだログインしていない場合）。
3. 「Get API key」または「APIキーを取得」をクリックします。
4. 新しいAPIキーを作成するか、既存のキーを選択します。
5. APIキーをコピーして安全な場所に保存します。

## 2. Netlifyでの環境変数設定

1. [Netlify](https://app.netlify.com/)にログインします。
2. このプロジェクトのサイトに移動します。
3. 「Site settings」→「Environment variables」を選択します。
4. 「Add a variable」をクリックします。
5. 以下の環境変数を追加します：
   - キー: `GEMINI_API_KEY`
   - 値: 先ほど取得したGemini APIキー

## 3. ローカル開発時の環境変数設定

ローカル開発時は、`.env.local`ファイルを作成して環境変数を設定できます：

1. プロジェクトのルートディレクトリに`.env.local`ファイルを作成します：

```
GEMINI_API_KEY=あなたのAPIキーをここに入力
```

2. ファイルを保存します。

**重要**: `.env.local`ファイルはGitリポジトリにコミットしないでください。このファイルは`.gitignore`に含まれていることを確認してください。

## 4. Netlifyでのローカル開発環境設定

Netlify Functionsをローカルで動作させるためには：

1. Netlify CLIをインストールします：
```bash
npm install -g netlify-cli
```

2. ローカル開発サーバーを実行します：
```bash
netlify dev
```

これにより、アプリケーションとサーバーレス関数の両方が単一のローカル開発環境で実行されます。

## 5. 動作確認

セットアップが完了したら、アプリケーションでGrokになりきって回答し、実際にGemini APIによる評価が行われることを確認してください。結果が適切に表示されれば成功です。

## トラブルシューティング

- **APIキーエラー**: `API key not configured`というエラーが表示される場合は、環境変数が正しく設定されているか確認してください。
- **レート制限**: 無料利用枠には呼び出し制限があります。頻繁にAPI呼び出しを行うと制限に達する可能性があります。
- **レスポンスパース失敗**: `Failed to parse API response`エラーが表示される場合は、Gemini APIのレスポンス形式が変更された可能性があります。`netlify/functions/evaluate-answer.js`のパースロジックを確認してください。

---

追加情報やサポートが必要な場合は、Googleの[Gemini API ドキュメント](https://ai.google.dev/gemini-api/docs)を参照してください。