import axios from 'axios';
import { QuizItem } from '../data/quizData';
import { StyleVariation } from '../data/styleVariations';
import { FeedbackData } from './types';

// Gemini API呼び出し用の関数
export const evaluateAnswer = async (
  quiz: QuizItem,
  style: StyleVariation,
  answer: string,
  locale: string = 'ja'
): Promise<FeedbackData> => {
  try {
    // 環境変数の設定がある場合、本番環境または開発環境でGemini APIを使用
    if (process.env.NEXT_PUBLIC_USE_GEMINI_API === 'true') {
      // APIのURLを構築（Next.jsの環境に合わせて）
      const apiUrl = `/api/evaluate-answer`;

      const response = await axios.post(apiUrl, {
        quiz,
        style,
        answer,
        locale
      });
      
      return response.data;
    } else {
      // 開発環境ではモックデータを返す
      // モック遅延を追加（実際のAPI呼び出しをシミュレート）
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // 現在はランダムなスコアを生成
      const accuracyScore = Math.floor(Math.random() * 31) + 20; // 20-50の範囲
      const styleScore = Math.floor(Math.random() * 31) + 20; // 20-50の範囲
      const totalScore = accuracyScore + styleScore;
      
      // ダミーフィードバック
      const mockFeedback: FeedbackData = {
        accuracy_score: accuracyScore,
        accuracy_comment: getAccuracyComment(accuracyScore, locale),
        style_score: styleScore,
        style_comment: getStyleComment(styleScore, locale === 'ja' ? style.name_ja : style.name_en, locale),
        total_score: totalScore,
        overall_comment: getOverallComment(totalScore, locale)
      };
      
      return mockFeedback;
    }
  } catch (error: any) { // any型を使用してエラーオブジェクトにアクセス
    console.error('Error evaluating answer:', error);

    // API制限エラー（429）の場合はエラーメッセージを含むレスポンスが返ってくる
    if (error?.response?.status === 429 && error?.response?.data) {
      return error.response.data; // レート制限エラー時のモックデータを返す
    }

    // その他のエラーの場合はモックデータを返す
    const accuracyScore = Math.floor(Math.random() * 31) + 20; // 20-50の範囲
    const styleScore = Math.floor(Math.random() * 31) + 20; // 20-50の範囲
    const totalScore = accuracyScore + styleScore;

    // 言語に応じたエラーメッセージ
    const errorMsgJa = "※エラーが発生したため、正確な評価ができませんでした。モックデータを表示しています。";
    const errorMsgEn = "※An error occurred, so we couldn't evaluate accurately. Showing mock data.";

    const errorMsg = locale === 'ja' ? errorMsgJa : errorMsgEn;
    const overallErrorJa = "※注：エラーが発生したため、正確な評価ができませんでした。これはデモ表示です。";
    const overallErrorEn = "※Note: An error occurred, so we couldn't evaluate accurately. This is a demo display.";

    return {
      accuracy_score: accuracyScore,
      accuracy_comment: errorMsg,
      style_score: styleScore,
      style_comment: errorMsg,
      total_score: totalScore,
      overall_comment: locale === 'ja' ? overallErrorJa : overallErrorEn
    };
  }
};

// クライアントサイドでの結果ID生成
export const generateResultId = (
  quizId: number,
  styleId: number,
  score: number,
  timestamp: number = Date.now()
): string => {
  // 簡易的な実装 - 実際のプロジェクトではより堅牢な方法を検討
  return `${quizId}-${styleId}-${score}-${timestamp.toString(36)}`;
};

// サーバーサイドでIDをデコード
export const decodeResultId = (id: string): {
  quizId: number;
  styleId: number;
  score: number;
  timestamp: number;
} | null => {
  try {
    const parts = id.split('-');
    if (parts.length < 4) return null;
    
    return {
      quizId: parseInt(parts[0], 10),
      styleId: parseInt(parts[1], 10),
      score: parseInt(parts[2], 10),
      timestamp: parseInt(parts[3], 36)
    };
  } catch (e) {
    console.error('Failed to decode result ID:', e);
    return null;
  }
};

// スコアに応じたフィードバックコメントを生成
const getAccuracyComment = (score: number, locale: string = 'ja'): string => {
  if (locale === 'ja') {
    if (score >= 40) {
      return "非常に正確な情報提供です。事実に基づいた回答が的確にできています。";
    } else if (score >= 30) {
      return "おおむね正確な情報ですが、一部に不正確または不足している部分があります。";
    } else if (score >= 20) {
      return "基本的な事実は含まれていますが、誤解を招く情報や誤りが複数見られます。";
    } else {
      return "情報の正確性に問題があります。事実確認が必要な部分が多いです。";
    }
  } else {
    // 英語のコメント
    if (score >= 40) {
      return "Highly accurate information. Your answer is precisely based on facts.";
    } else if (score >= 30) {
      return "Mostly accurate information, but there are some inaccuracies or missing parts.";
    } else if (score >= 20) {
      return "Basic facts are included, but there are several misleading or incorrect points.";
    } else {
      return "The information has accuracy issues. Many parts need fact-checking.";
    }
  }
};

const getStyleComment = (score: number, styleName: string, locale: string = 'ja'): string => {
  if (locale === 'ja') {
    if (score >= 40) {
      return `「${styleName}」の特徴を非常によく捉えています。口調、言い回し、表現方法が見事に再現されています。`;
    } else if (score >= 30) {
      return `「${styleName}」の基本的な特徴は表現できていますが、より特徴的な言い回しを増やすとさらに良くなります。`;
    } else if (score >= 20) {
      return `「${styleName}」の要素が部分的に見られますが、一貫性に欠ける点があります。`;
    } else {
      return `「${styleName}」の特徴をもっと理解し、それに合った表現を意識してみましょう。`;
    }
  } else {
    // 英語のコメント
    if (score >= 40) {
      return `You've captured the characteristics of "${styleName}" style very well. The tone, expressions, and phrasing are excellently reproduced.`;
    } else if (score >= 30) {
      return `You've expressed the basic features of "${styleName}" style, but it could be improved by adding more characteristic expressions.`;
    } else if (score >= 20) {
      return `Elements of "${styleName}" style are partially visible, but there's a lack of consistency.`;
    } else {
      return `Try to better understand the features of "${styleName}" style and focus on appropriate expressions.`;
    }
  }
};

const getOverallComment = (totalScore: number, locale: string = 'ja'): string => {
  if (locale === 'ja') {
    if (totalScore >= 90) {
      return "素晴らしい回答です！事実も正確で、指定された口調も完璧に再現されています。Grokのようなレスポンスができています！";
    } else if (totalScore >= 70) {
      return "良い回答です。事実確認と口調の両方でバランスの取れた回答になっています。";
    } else if (totalScore >= 50) {
      return "まずまずの回答です。事実の正確性か口調の再現度、どちらかを改善するとより良くなるでしょう。";
    } else {
      return "回答には改善の余地があります。事実確認をしっかり行い、指定された口調の特徴をよく理解すると良いでしょう。";
    }
  } else {
    // 英語のコメント
    if (totalScore >= 90) {
      return "Excellent answer! The facts are accurate and the requested style is perfectly reproduced. You've responded just like Grok would!";
    } else if (totalScore >= 70) {
      return "Good answer. You've achieved a good balance between factual accuracy and the specified tone.";
    } else if (totalScore >= 50) {
      return "Decent answer. Improvement in either factual accuracy or style reproduction would make it better.";
    } else {
      return "Your answer has room for improvement. Thorough fact-checking and better understanding of the specified style would help.";
    }
  }
};