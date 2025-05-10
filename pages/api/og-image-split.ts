import { NextApiRequest, NextApiResponse } from 'next';
import { createCanvas, loadImage } from 'canvas';
import fs from 'fs';
import path from 'path';
import { quizData } from '../../data/quizData';
import { styleVariations } from '../../data/styleVariations';

/**
 * 左右分割レイアウトのOG画像API
 * 左側に「Grokの気持ち」とテキスト、右側にスコア表示
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
    
    // 背景色（宇宙風グラデーション）
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
    
    // 画面の外枠
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 4;
    ctx.strokeRect(20, 20, width - 40, height - 40);
    
    // 画面を左右に分ける分割線
    const splitX = width * 0.55;  // 55:45の割合で左右分割
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(splitX, 80);
    ctx.lineTo(splitX, height - 80);
    ctx.stroke();
    
    // 左側：タイトルとサブタイトルのみ（留白が多いシンプルデザイン）

    // マイルドな光彩効果などを加えるための圆形の光の蔵み
    const leftGlowX = splitX * 0.5;
    const leftGlowY = height * 0.5;
    const leftGlow = ctx.createRadialGradient(
      leftGlowX, leftGlowY, 50,
      leftGlowX, leftGlowY, 400
    );
    leftGlow.addColorStop(0, 'rgba(29, 155, 240, 0.1)');
    leftGlow.addColorStop(0.7, 'rgba(29, 155, 240, 0.03)');
    leftGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = leftGlow;
    ctx.beginPath();
    ctx.arc(leftGlowX, leftGlowY, 300, 0, Math.PI * 2);
    ctx.fill();

    // タイトル - 中央揃え
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 80px sans-serif';
    ctx.textAlign = 'center';
    ctx.shadowColor = 'rgba(29, 155, 240, 0.8)';
    ctx.shadowBlur = 10;

    // タイトルを左側エリアの中央に配置
    const leftCenterX = splitX / 2;
    ctx.fillText(isJapanese ? 'Grokの気持ち' : "In Grok's Mind", leftCenterX, height * 0.35);

    // サブタイトル - 中央揃え
    ctx.font = 'bold 40px sans-serif';
    ctx.fillStyle = '#1d9bf0'; // Twitter Blue
    ctx.shadowColor = 'rgba(255, 255, 255, 0.5)';
    ctx.shadowBlur = 5;
    ctx.fillText(isJapanese ? 'あなたのGrokなりきり度' : 'Your Grok Score', leftCenterX, height * 0.45);

    // 影をリセット
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;

    // 装飾的な光の線
    ctx.strokeStyle = 'rgba(29, 155, 240, 0.4)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(60, height * 0.55);
    ctx.lineTo(splitX - 60, height * 0.55);
    ctx.stroke();
    
    // 右側：スコア表示
    // スコア表示用の色とテキストを設定
    let scoreColor, scoreText;
    if (score >= 80) {
      scoreColor = '#4ade80'; // 緑
      scoreText = isJapanese ? 'マスター' : 'MASTER';
    } else if (score >= 60) {
      scoreColor = '#facc15'; // 黄色
      scoreText = isJapanese ? '上級者' : 'EXPERT';
    } else {
      scoreColor = '#f87171'; // 赤
      scoreText = isJapanese ? '初心者' : 'BEGINNER';
    }
    
    // スコア表示の中心座標
    const centerX = splitX + (width - splitX) / 2;
    const centerY = height / 2;
    
    // 光る背景グラデーション
    const gradientRadius = Math.min((width - splitX) * 0.4, height * 0.35);
    const scoreGradient = ctx.createRadialGradient(
      centerX, centerY, gradientRadius * 0.2,
      centerX, centerY, gradientRadius * 1.2
    );
    
    // hexColorをRGBA形式に変換するヘルパー関数
    const hexToRgb = (hex: string) => {
      const r = parseInt(hex.substring(1, 3), 16);
      const g = parseInt(hex.substring(3, 5), 16);
      const b = parseInt(hex.substring(5, 7), 16);
      return [r, g, b];
    };
    
    const rgbColor = hexToRgb(scoreColor);
    scoreGradient.addColorStop(0, `rgba(${rgbColor[0]}, ${rgbColor[1]}, ${rgbColor[2]}, 0.3)`);
    scoreGradient.addColorStop(0.7, `rgba(${rgbColor[0]}, ${rgbColor[1]}, ${rgbColor[2]}, 0.1)`);
    scoreGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    
    ctx.fillStyle = scoreGradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY, gradientRadius, 0, Math.PI * 2);
    ctx.fill();
    
    // スコア値（大きく表示）
    ctx.shadowColor = `rgba(${rgbColor[0]}, ${rgbColor[1]}, ${rgbColor[2]}, 0.8)`;
    ctx.shadowBlur = 30;
    ctx.fillStyle = scoreColor;
    ctx.font = 'bold 180px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${score}`, centerX, centerY);
    
    // 満点表示
    ctx.font = 'bold 48px sans-serif';
    ctx.fillText('/100', centerX, centerY + 60);
    
    // 評価ラベル
    ctx.font = 'bold 64px sans-serif';
    ctx.fillText(scoreText, centerX, centerY + 140);
    
    // 小さな光の粒子（スコアの周りに散らばる装飾）
    for (let i = 0; i < 30; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * gradientRadius;
      const particleX = centerX + Math.cos(angle) * distance;
      const particleY = centerY + Math.sin(angle) * distance;
      const size = Math.random() * 2 + 0.5;
      
      ctx.fillStyle = scoreColor;
      ctx.globalAlpha = Math.random() * 0.5 + 0.1;
      ctx.beginPath();
      ctx.arc(particleX, particleY, size, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // 透明度を元に戻す
    ctx.globalAlpha = 1.0;
    
    // 影をリセット
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    
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
    console.error('Error generating split-layout OG image:', error);
    
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