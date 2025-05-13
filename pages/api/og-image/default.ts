import { NextApiRequest, NextApiResponse } from 'next';
import { Canvas } from 'skia-canvas';

/**
 * デフォルトOG画像生成API
 * URL: /api/og-image/default
 * フォールバック用のデフォルト画像を提供
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // GETリクエスト以外は拒否
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    // 言語パラメータを取得（デフォルトは英語）
    const { lang } = req.query;
    const isJapanese = lang === 'ja';
    const title = isJapanese ? 'Grokの気持ち' : "In Grok's Mind";
    const subtitle = isJapanese ? 'Grokになりきって答えてみよう！' : "Answer as if you were Grok!";

    // SkiaCanvas を使用してキャンバスを作成
    const width = 1200;
    const height = 630;
    const canvas = new Canvas(width, height);
    const ctx = canvas.getContext('2d');

    // 背景色
    ctx.fillStyle = '#15202b'; // Twitterダークモード風の背景色
    ctx.fillRect(0, 0, width, height);

    // タイトル描画
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 64px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(title, width / 2, height / 2 - 40);

    // サブタイトル
    ctx.font = '36px sans-serif';
    ctx.fillText(subtitle, width / 2, height / 2 + 40);

    // フッター（Twitterスタイル）
    ctx.fillStyle = '#1d9bf0'; // Twitter Blue
    ctx.font = '24px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('#BeGrok', width - 50, height - 50);
    ctx.fillText(isJapanese ? '#Grokの気持ち' : '#InGrokMind', width - 50, height - 20);

    // 左下にクレジット
    ctx.textAlign = 'left';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('© from-garage 2025', 50, height - 20);

    // 生成時刻（キャッシュ対策）
    const now = new Date().toISOString();
    ctx.font = '14px sans-serif';
    ctx.fillText(`Generated: ${now}`, 50, height - 50);

    // PNGとして返す
    const buffer = await canvas.toBuffer('png');
    
    // レスポンスヘッダーを設定
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'public, max-age=31536000'); // 1年間キャッシュ
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    // 画像を返す
    res.status(200).send(buffer);
  } catch (error) {
    console.error('Error generating default OG image:', error);
    // エラー時は500エラーを返す
    res.status(500).json({ error: 'Failed to generate image' });
  }
}
