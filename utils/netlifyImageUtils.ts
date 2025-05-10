// Netlify Functions用のOG画像ユーティリティ

import { QuizItem } from '../data/quizData';
import { StyleVariation } from '../data/styleVariations';

// OG画像のURLを生成する（Netlify Functions用）
export const generateNetlifyOgImageUrl = (
  quizId: number,
  styleId: number,
  score: number,
  locale: string = 'ja',
  host: string = 'localhost:3000'
): string => {
  const protocol = host.includes('localhost') ? 'http' : 'https';
  const language = locale === 'ja' ? 'ja' : 'en';
  
  try {
    // ローカル開発環境ではNetlify Functionを使用
    if (host.includes('localhost')) {
      return `${protocol}://${host}/.netlify/functions/og-image?quizId=${quizId}&styleId=${styleId}&score=${score}&lang=${language}`;
    }

    // 本番環境ではフォールバック関数を使用 (GLIBC互換性エラー対策)
    return `${protocol}://${host}/.netlify/functions/og-image-fallback?quizId=${quizId}&styleId=${styleId}&score=${score}&lang=${language}`;
  } catch (error) {
    // エラーが発生した場合は静的APIエンドポイントを使用
    return `${protocol}://${host}/api/og-image-static`;
  }
};