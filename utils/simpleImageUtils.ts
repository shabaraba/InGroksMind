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
  
  try {
    // 左右分割レイアウト・スコア表示付きOG画像エンドポイントを使用
    // キャッシュを無効化するためのタイムスタンプパラメータを追加
    const timestamp = new Date().getTime();
    return `${protocol}://${host}/api/og-image-split?quizId=${quizId}&styleId=${styleId}&score=${score}&lang=${language}&t=${timestamp}`;
  } catch (error) {
    // エラーが発生した場合は最もシンプルな静的APIエンドポイントを使用
    return `${protocol}://${host}/api/og-image-static`;
  }
};