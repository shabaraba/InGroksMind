// シンプルなOG画像ユーティリティ（Netlify Functionsではなく、Next.jsのAPIルートを使用）

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

  try {
    // 結果に基づく動的OG画像を生成するためのAPI URLを生成
    // キャッシュを防ぐためにタイムスタンプパラメータを追加
    const timestamp = new Date().getTime();
    return `${protocol}://${host}/api/og-image/${quizId}-${styleId}-${score}-${language}?t=${timestamp}`;
  } catch (error) {
    console.error('Error generating OG image URL:', error);
    // エラーが発生した場合はフォールバック用のデフォルトOG画像APIエンドポイントを使用
    return `${protocol}://${host}/api/og-image/default?lang=${language}`;
  }
};