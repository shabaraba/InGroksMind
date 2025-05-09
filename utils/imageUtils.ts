// サーバーサイドでの画像生成のためのユーティリティ関数

import { QuizItem } from '../data/quizData';
import { StyleVariation } from '../data/styleVariations';
import { getTranslationForLocale } from '../i18n/translations';
import { shortenUrl } from './urlShortener';

// OG画像のURLを生成する
export const generateOgImageUrl = (
  quizId: number,
  styleId: number,
  score: number,
  locale: string = 'en',
  host: string = 'localhost:3000'
): string => {
  const protocol = host.includes('localhost') ? 'http' : 'https';
  const langParam = locale === 'ja' ? 'ja' : 'en';
  const title = encodeURIComponent(locale === 'ja' ? 'Grokの気持ち' : "In Grok's Mind");
  
  // APIルートを使用（静的およびAPIルートの両方を指定）
  try {
    return `${protocol}://${host}/api/og-image/${quizId}-${styleId}-${score}-${langParam}`;
  } catch (error) {
    // 何らかのエラーが発生した場合は静的APIエンドポイントを使用
    return `${protocol}://${host}/api/og-image-static`;
  }
};

// 結果ページのURLを生成する
export const generateResultUrl = (
  resultId: string,
  host: string = 'localhost:3000',
  userAnswer?: string,
  locale?: string,
  quizUserId?: string,
  replyUserId?: string
): string => {
  const protocol = host.includes('localhost') ? 'http' : 'https';
  const baseUrl = `${protocol}://${host}/result/${resultId}`;

  // パラメータを追加（存在する場合のみ）
  const params = new URLSearchParams();

  if (userAnswer) {
    params.append('answer', userAnswer);
  }

  if (locale) {
    params.append('lang', locale);
  }

  if (quizUserId) {
    params.append('quizUserId', quizUserId);
  }

  if (replyUserId) {
    params.append('replyUserId', replyUserId);
  }

  // 長いURLを生成
  const fullUrl = params.toString() ? `${baseUrl}?${params.toString()}` : baseUrl;

  // 短縮URLを生成して返す
  try {
    return shortenUrl(fullUrl);
  } catch (error) {
    console.error('Error shortening URL:', error);
    return fullUrl; // エラー時は元のURLを返す
  }
};

// シェアテキストを生成する
export const generateShareText = (
  quiz: QuizItem,
  style: StyleVariation,
  score: number, 
  locale: string = 'en',
  url?: string
): string => {
  const t = getTranslationForLocale(locale);
  const content = locale === 'ja' ? quiz.content_ja : quiz.content_en;
  const styleName = locale === 'ja' ? style.name_ja : style.name_en;
  
  // URLがある場合はURLつきのテキスト、ない場合はコンパクトなテキスト
  if (url) {
    return t.shareTextWithUrl
      .replace('{totalScore}', score.toString())
      .replace('{url}', url);
  } else {
    return t.shareTextCompact
      .replace('{totalScore}', score.toString());
  }
};