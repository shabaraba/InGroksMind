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

    // スコアに応じて異なるスコアを画像に描画
    // 静的画像にスコアを重ねて表示するファイルベースのアプローチ
    // 注意: この実装ではCanvas APIは使用せず、単純な画像を返すのみ
    let imageName = 'og-image-static.png';

    // 本番環境ではここにテキスト描画を追加してスコアを表示することが可能
    // 具体的には、静的画像に Node Canvas などの轻量ライブラリでテキストを描画して返せる
    
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