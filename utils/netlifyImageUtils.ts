// Netlify Functions用のOG画像ユーティリティ

import { QuizItem } from '../data/quizData';
import { StyleVariation } from '../data/styleVariations';

// OG画像のURLを生成する（Netlify Functions用）
export const generateNetlifyOgImageUrl = (
  quizId: number,
  styleId: number,
  score: number,
  locale: string = 'en',
  host: string = 'localhost:3000'
): string => {
  const protocol = host.includes('localhost') ? 'http' : 'https';
  const language = locale === 'ja' ? 'ja' : 'en';
  
  try {
    // Netlify Function から OG 画像を取得するURL
    return `${protocol}://${host}/.netlify/functions/og-image?quizId=${quizId}&styleId=${styleId}&score=${score}&lang=${language}`;
  } catch (error) {
    // エラーが発生した場合は静的APIエンドポイントを使用
    return `${protocol}://${host}/api/og-image-static`;
  }
};