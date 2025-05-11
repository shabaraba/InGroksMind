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
  
  // OG画像URLの生成を静的なファイルに変更（キャッシュを防ぐためにクエリパラメータを追加）
  // ここでは動的な生成を試みず、直接静的ファイルを返す
  return `${protocol}://${host}/og-image-home-new.png?v=2`;

  // 以下のようなエラーハンドリングはもはや不要
  // これによりコードが単純化され、ソーシャルメディアのクローラーにとって理解しやすくなる
  try {
    // OG画像に関する問題を解決するため、動的APIではなく静的画像ファイルを使用
    // キャッシュを無効化するためのタイムスタンプパラメータを追加
    const timestamp = new Date().getTime();
    return `${protocol}://${host}/og-image-home-new.png?t=${timestamp}`;
  } catch (error) {
    // エラーが発生した場合は最もシンプルな静的画像ファイルを使用
    return `${protocol}://${host}/og-image-static.png`;
  }
};