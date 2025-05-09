import axios from 'axios';
import { QuizItem } from '../data/quizData';
import { StyleVariation } from '../data/styleVariations';
import { FeedbackData } from '../components/FeedbackDisplay';

// 実際のNetlify関数を呼び出す
export const evaluateAnswer = async (
  quiz: QuizItem,
  style: StyleVariation,
  answer: string
): Promise<FeedbackData> => {
  try {
    // 本番環境、または環境変数REACT_APP_USE_GEMINI_APIが設定されているとき、
    // Netlify関数を呼び出す
    if (process.env.NODE_ENV === 'production' || process.env.REACT_APP_USE_GEMINI_API === 'true') {
      // ローカル開発環境ではNetlify Dev URLを使用
      const apiUrl = process.env.NODE_ENV === 'development'
        ? 'http://localhost:8888/.netlify/functions/evaluate-answer'
        : '/.netlify/functions/evaluate-answer';

      const response = await axios.post(apiUrl, {
        quiz,
        style,
        answer
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
        accuracy_comment: getAccuracyComment(accuracyScore),
        style_score: styleScore,
        style_comment: getStyleComment(styleScore, navigator.language.startsWith('ja') ? style.name_ja : style.name_en),
        total_score: totalScore,
        overall_comment: getOverallComment(totalScore)
      };
      
      return mockFeedback;
    }
  } catch (error) {
    console.error('Error evaluating answer:', error);
    throw error;
  }
};

// スコアに応じたフィードバックコメントを生成
const getAccuracyComment = (score: number): string => {
  if (score >= 40) {
    return "非常に正確な情報提供です。事実に基づいた回答が的確にできています。";
  } else if (score >= 30) {
    return "おおむね正確な情報ですが、一部に不正確または不足している部分があります。";
  } else if (score >= 20) {
    return "基本的な事実は含まれていますが、誤解を招く情報や誤りが複数見られます。";
  } else {
    return "情報の正確性に問題があります。事実確認が必要な部分が多いです。";
  }
};

const getStyleComment = (score: number, styleName: string): string => {
  if (score >= 40) {
    return `「${styleName}」の特徴を非常によく捉えています。口調、言い回し、表現方法が見事に再現されています。`;
  } else if (score >= 30) {
    return `「${styleName}」の基本的な特徴は表現できていますが、より特徴的な言い回しを増やすとさらに良くなります。`;
  } else if (score >= 20) {
    return `「${styleName}」の要素が部分的に見られますが、一貫性に欠ける点があります。`;
  } else {
    return `「${styleName}」の特徴をもっと理解し、それに合った表現を意識してみましょう。`;
  }
};

const getOverallComment = (totalScore: number): string => {
  if (totalScore >= 90) {
    return "素晴らしい回答です！事実も正確で、指定された口調も完璧に再現されています。Grokのようなレスポンスができています！";
  } else if (totalScore >= 70) {
    return "良い回答です。事実確認と口調の両方でバランスの取れた回答になっています。";
  } else if (totalScore >= 50) {
    return "まずまずの回答です。事実の正確性か口調の再現度、どちらかを改善するとより良くなるでしょう。";
  } else {
    return "回答には改善の余地があります。事実確認をしっかり行い、指定された口調の特徴をよく理解すると良いでしょう。";
  }
};