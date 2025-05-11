// シンプルなOG画像ユーティリティ（すべてのページで統一されたOG画像を使用）

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

  // すべてのページでホームページと同じOG画像を使用
  return `${protocol}://${host}/og-image-home.png`;
};

// 静的フォールバックOG画像のURLを生成する
export const getStaticOgImageUrl = (
  locale: string = 'ja',
  host: string = 'localhost:3000'
): string => {
  const protocol = host.includes('localhost') ? 'http' : 'https';

  // ホームページと同じOG画像を使用
  return `${protocol}://${host}/og-image-home.png`;
};