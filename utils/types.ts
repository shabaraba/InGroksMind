// 評価結果のデータ構造
export interface FeedbackData {
  accuracy_score: number;
  accuracy_comment: string;
  style_score: number;
  style_comment: string;
  total_score: number;
  overall_comment: string;
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
}

// 結果ページのURLパラメータ
export interface ResultPageParams {
  id: string;
}

// OG画像生成に必要なデータ
export interface OgImageData {
  quizId: number;
  styleId: number;
  score: number;
  language: string;
}