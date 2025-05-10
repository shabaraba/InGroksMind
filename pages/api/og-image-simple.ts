import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

/**
 * シンプルなOG画像API - 静的なOG画像を返すだけの簡易版
 * Netlify Functionsやskia-canvasライブラリに依存しない実装
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // クエリパラメータを取得（スコアなどの情報だけログに記録用）
    const { quizId, styleId, score, lang } = req.query;
    console.log(`OG Image requested for Quiz: ${quizId}, Style: ${styleId}, Score: ${score}, Lang: ${lang || 'ja'}`);

    // スコアに応じて異なる静的イメージを返す（オプション）
    let imageName = 'og-image-static.png';
    
    // 静的画像のパス
    const imagePath = path.join(process.cwd(), 'public', imageName);
    
    // 画像が存在するか確認
    if (!fs.existsSync(imagePath)) {
      throw new Error(`Image not found: ${imagePath}`);
    }
    
    // 画像を読み込む
    const imageBuffer = fs.readFileSync(imagePath);
    
    // レスポンスヘッダーを設定
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'public, max-age=31536000'); // 1年間キャッシュ
    
    // 画像を返す
    res.status(200).send(imageBuffer);
  } catch (error) {
    console.error('Error serving OG image:', error);
    res.status(500).json({ error: 'Failed to serve image' });
  }
}