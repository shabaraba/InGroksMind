// シンプルなOG画像ユーティリティ（Netlify Functionsに依存しない実装）

import { QuizItem } from '../data/quizData';
import { StyleVariation } from '../data/styleVariations';

// OG画像のURLを生成する
export const generateOgImageUrl = (
  quizId: number,
  styleId: number,
  score: number,
  locale: string = 'ja',
  host: string = 'localhost:3000'
): string => {
  const protocol = host.includes('localhost') ? 'http' : 'https';
  const language = locale === 'ja' ? 'ja' : 'en';

  return `/api/og?quizId=${quizId}&styleId=${styleId}&score=${score}&locale=${language}`;
};