import { NextApiRequest, NextApiResponse } from 'next';
import { createCanvas, loadImage } from 'canvas';
import fs from 'fs';
import path from 'path';
import { quizData } from '../../data/quizData';
import { styleVariations } from '../../data/styleVariations';

/**
 * 動的OG画像API - スコアを表示するシンプルなバージョン
 * skia-canvasの代わりにnode-canvasを使用し、Netlify Functionsに依存しない
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // クエリパラメータを取得
    const { quizId: quizIdParam, styleId: styleIdParam, score: scoreParam, lang } = req.query;
    
    // パラメータのパース
    const quizId = parseInt(quizIdParam as string, 10) || 1;
    const styleId = parseInt(styleIdParam as string, 10) || 1;
    const score = parseInt(scoreParam as string, 10) || 70;
    const locale = (lang as string) === 'en' ? 'en' : 'ja';
    const isJapanese = locale === 'ja';

    // クイズとスタイルを取得
    const quiz = quizData.find(q => q.id === quizId) || quizData[0];
    const style = styleVariations.find(s => s.id === styleId) || styleVariations[0];
    
    // クイズ内容
    const quizContent = isJapanese ? quiz.content_ja : quiz.content_en;
    const styleName = isJapanese ? style.name_ja : style.name_en;
    
    // 画像サイズ
    const width = 1200;
    const height = 630;
    
    // Canvas作成
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');
    
    // 背景色
    const bgGradient = ctx.createLinearGradient(0, 0, width, height);
    bgGradient.addColorStop(0, '#0B0B1A');  // 暗い宇宙の色
    bgGradient.addColorStop(0.5, '#151B30'); // 少し明るい宇宙の色
    bgGradient.addColorStop(1, '#0C0E1A');  // 暗い青紫色
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);
    
    // 簡易的な星の背景
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    for (let i = 0; i < 100; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const size = Math.random() * 2 + 0.5;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // 枠線
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 4;
    ctx.strokeRect(20, 20, width - 40, height - 40);
    
    // タイトル
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 60px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(isJapanese ? 'Grokの気持ち' : "In Grok's Mind", width / 2, 100);
    
    // クイズ内容（短縮版）
    ctx.font = '24px sans-serif';
    ctx.fillStyle = '#e2e8f0';
    ctx.textAlign = 'center';
    const shortQuizContent = quizContent.length > 70 
      ? quizContent.substring(0, 70) + '...' 
      : quizContent;
    ctx.fillText(shortQuizContent, width / 2, 170);
    
    // スタイル
    ctx.fillStyle = '#ff9ff3'; // 明るいピンク
    ctx.font = 'bold 28px sans-serif';
    ctx.fillText(styleName, width / 2, 220);
    
    // スコア表示用の色を設定
    let scoreColor;
    if (score >= 80) {
      scoreColor = '#4ade80'; // 緑
    } else if (score >= 60) {
      scoreColor = '#facc15'; // 黄色
    } else {
      scoreColor = '#f87171'; // 赤
    }
    
    // スコアを大きく表示するための背景円
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.beginPath();
    ctx.arc(width / 2, height / 2, 140, 0, Math.PI * 2);
    ctx.fill();
    
    // スコア表示の外枠（輝く円）
    ctx.strokeStyle = scoreColor;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(width / 2, height / 2, 140, 0, Math.PI * 2);
    ctx.stroke();
    
    // スコアを表示
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 40px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(isJapanese ? '総合評価' : 'Total Score', width / 2, height / 2 - 40);
    
    // スコア値
    ctx.fillStyle = scoreColor;
    ctx.font = 'bold 120px sans-serif';
    ctx.fillText(`${score}`, width / 2, height / 2 + 40);
    
    // 満点を表示
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 36px sans-serif';
    ctx.fillText('/100', width / 2, height / 2 + 80);
    
    // フッターのハッシュタグ
    ctx.fillStyle = '#1d9bf0'; // Twitter Blue
    ctx.font = 'bold 28px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(isJapanese ? '#Grokの気持ち #InGroksMind' : '#InGroksMind #Grokの気持ち', width / 2, height - 40);
    
    // PNGとして出力
    const buffer = canvas.toBuffer('image/png');
    
    // レスポンスヘッダーを設定
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'public, max-age=31536000'); // 1年間キャッシュ
    
    // 画像を返す
    res.status(200).send(buffer);
  } catch (error) {
    console.error('Error generating dynamic OG image:', error);
    
    // エラー時は静的画像を返す
    try {
      const staticImagePath = path.join(process.cwd(), 'public', 'og-image-static.png');
      const imageBuffer = fs.readFileSync(staticImagePath);
      
      res.setHeader('Content-Type', 'image/png');
      res.setHeader('Cache-Control', 'public, max-age=86400'); // 1日間キャッシュ（エラー時は短く）
      res.status(200).send(imageBuffer);
    } catch (fallbackError) {
      res.status(500).json({ error: 'Failed to generate image' });
    }
  }
}