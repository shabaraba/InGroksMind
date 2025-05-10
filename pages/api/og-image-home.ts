import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

/**
 * トップページ用静的OG画像API
 * このAPIはcanvasライブラリに依存せず、静的な画像を返します
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // パブリックディレクトリ内の静的画像へのパス
    const imagePath = path.join(process.cwd(), 'public', 'og-image-home.png');

    // 画像が存在するか確認
    const fileExists = fs.existsSync(imagePath);
    if (!fileExists) {
      throw new Error('Home OG image not found');
    }

    // 画像を読み込む
    const imageBuffer = fs.readFileSync(imagePath);

    // レスポンスヘッダーを設定
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'public, max-age=31536000'); // 1年間キャッシュ
    
    // 画像を返す
    res.status(200).send(imageBuffer);
  } catch (error) {
    console.error('Error serving home OG image:', error);
    res.status(500).json({ error: 'Failed to serve image' });
  }
}