import { Handler } from '@netlify/functions';
import path from 'path';
import fs from 'fs';

// Netlify Functionsのバイナリ依存関係エラー対応用のフォールバック関数
// skia-canvasライブラリが動作しない環境でも静的画像を返す
const handler: Handler = async (event, context) => {
  try {
    // GETリクエスト以外は拒否
    if (event.httpMethod !== 'GET') {
      return {
        statusCode: 405,
        body: JSON.stringify({ error: 'Method Not Allowed' }),
      };
    }

    // クエリパラメータを取得（使用しませんが記録用）
    const { quizId, styleId, score, lang } = event.queryStringParameters || {};
    
    // 静的OG画像のパス（プロジェクトルートからの相対パス）
    // 注意: Netlify Functionsでは.netlifyフォルダ内ではなく、デプロイされたビルドディレクトリから相対パスになります
    const staticImagePath = path.join('public', 'og-image-fallback.png');
    
    // 画像ファイルの読み込み
    // 注意: fs.readFileは相対パスが実行環境によって異なるため、エラーハンドリングが重要
    let imageBuffer;
    try {
      // Netlify環境では通常ここで失敗する
      imageBuffer = fs.readFileSync(staticImagePath);
    } catch (fileError) {
      // 別のパスを試す
      try {
        // ビルド時に含めた静的アセットへのパス
        imageBuffer = fs.readFileSync(path.join('.next', 'static', 'og-image-static.png'));
      } catch (secondError) {
        // 最後の手段 - ハードコードされたBase64画像を返す
        return {
          statusCode: 200,
          headers: {
            'Content-Type': 'image/png',
            'Cache-Control': 'public, max-age=31536000', // 1年間キャッシュ
          },
          // 小さなシンプルなPNG画像のBase64エンコード
          body: 'iVBORw0KGgoAAAANSUhEUgAAAtAAAAEgCAYAAACcCGTcAAAMVklEQVR4nO3XMQ0AIRAEwcMJMIAFLGABC3xfAkkQk5mpgm127QMAAECmu2sAAADgTYYGAAAggKEBAAAIYGgAAAACGBoAAIAAhgYAACCAoQEAAAhgaAAAAAIYGgAAgACGBgAAIIChAQAACGBoAAAAAhgaAACAAAEbdwsm97UrMgAAAABJRU5ErkJggg==',
          isBase64Encoded: true,
        };
      }
    }

    // 正常に画像が読み込めた場合のレスポンス
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=31536000', // 1年間キャッシュ
      },
      body: imageBuffer.toString('base64'),
      isBase64Encoded: true,
    };
  } catch (error) {
    console.error('Error serving fallback OG image:', error);
    
    // エラー時も最低限の画像を返す
    return {
      statusCode: 200, // エラーでも200を返して最低限の画像を提供
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=86400', // 1日キャッシュ（エラー時は短く）
      },
      // 1x1の透明PNG画像
      body: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
      isBase64Encoded: true,
    };
  }
};

export { handler };