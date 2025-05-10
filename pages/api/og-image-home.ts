import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

/**
 * トップページ用動的OG画像API
 * Netlifyでのビルドエラーを回避するため、静的な画像を返すように変更
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // クエリパラメータを取得（ロギング用）
    console.log('OG Image Home Request:', req.query);
    
    // 事前に生成された静的OG画像へのパス
    const staticImagePath = path.join(process.cwd(), 'public', 'og-image-home-new.png');
    
    // 画像が存在するか確認
    const fileExists = fs.existsSync(staticImagePath);
    if (!fileExists) {
      throw new Error('Static OG image not found');
    }
    
    // 画像を読み込む
    const imageBuffer = fs.readFileSync(staticImagePath);
    
    // レスポンスヘッダーを設定
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'public, max-age=31536000'); // 1年間キャッシュ
    
    // 画像を返す
    res.status(200).send(imageBuffer);
  } catch (error) {
    console.error('Error serving OG image:', error);
    
    // エラー時はフォールバック画像を返す
    try {
      const fallbackImagePath = path.join(process.cwd(), 'public', 'og-image-static.png');
      const imageBuffer = fs.readFileSync(fallbackImagePath);
      
      res.setHeader('Content-Type', 'image/png');
      res.setHeader('Cache-Control', 'public, max-age=86400'); // 1日間キャッシュ（エラー時は短く）
      res.status(200).send(imageBuffer);
    } catch (fallbackError) {
      res.status(500).json({ error: 'Failed to generate image' });
    }
  }
}