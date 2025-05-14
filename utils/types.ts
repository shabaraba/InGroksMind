import { ParsedUrlQuery } from 'querystring';

// 評価結果のデータ構造
export interface FeedbackData {
  accuracy_score: number;
  accuracy_comment: string;
  style_score: number;
  style_comment: string;
  total_score: number;
  overall_comment: string;
  gemini_answer?: GeminiAnswer | null; // Geminiの回答情報（オプショナル）、nullも許容
  gemini_reference_answer?: GeminiAnswer | null; // Geminiの参考回答情報（オプショナル）、nullも許容
}

// Geminiの回答データ
export interface GeminiAnswer {
  content: string; // 回答内容
  avatar_url?: string; // アバター画像URL（オプショナル）
  is_reference?: boolean; // 参考回答かどうかのフラグ
}

// APIからの評価リクエスト
export interface EvaluateRequestBody {
  quiz: {
    id: number;
    content_ja: string;
    content_en: string;
  };
  style: {
    id: number;
    name_ja: string;
    name_en: string;
    description_ja: string;
    description_en: string;
  };
  answer: string;
}

// 結果ページのパラメータデータ
export interface ResultPageData {
  quizId: number;
  styleId: number;
  answer: string;
  feedback: FeedbackData;
  timestamp: number;
  answerLanguage?: 'ja' | 'en'; // 回答時の言語設定
  quizUserId?: number; // クイズを投稿したユーザーID
  replyUserId?: number; // リプライを要求したユーザーID
}

// 結果ページのURLパラメータ
export interface ResultPageParams extends ParsedUrlQuery {
  id: string;
  [key: string]: string | string[]; // ParsedUrlQuery互換のインデックスシグネチャを追加
}

// OG画像生成に必要なデータ
export interface OgImageData {
  quizId: number;
  styleId: number;
  score: number;
  language: string;
}