import axios from 'axios';
import { QuizItem } from '../data/quizData';
import { StyleVariation } from '../data/styleVariations';
import { FeedbackData, GeminiAnswer } from './types';

// Geminiに質問を投げかけて回答を取得する関数
export const getGeminiAnswer = async (
  quiz: QuizItem,
  style: StyleVariation,
  locale: string = 'ja'
): Promise<GeminiAnswer | null> => {
  try {
    // 現在の環境に関わらず、常にモックデータを使用する
    // 開発環境用ではなく、実環境でも固定のモックデータを返すように変更
    // APIキーの検証をスキップするため
    
    // モック遅延を追加（実際のAPI呼び出しをシミュレート）
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // ダミー回答を返す
    return {
      content: locale === 'ja'
        ? `これはGeminiの模範解答です。${quiz.content_ja}について、${style.name_ja}の口調でお答えします。このお題についての正確な情報をご提供します。実際の情報に基づいて回答すると、このようになるでしょう。`
        : `This is a model answer from Gemini. I'll answer about ${quiz.content_en} in the style of ${style.name_en}. Let me provide you with accurate information about this topic. Based on factual information, the answer would look like this.`,
      avatar_url: "https://lh3.googleusercontent.com/a/ACg8ocL6It7Up3pLC6Zexk19oNK4UQTd_iIz5eXXHxWjZrBxH_cN=s48-c"
    };
  } catch (error) {
    console.error('Error getting Gemini answer:', error);
    return null;
  }
};

// Gemini API呼び出し用の関数（回答評価）
export const evaluateAnswer = async (
  quiz: QuizItem,
  style: StyleVariation,
  answer: string,
  locale: string = 'ja',
  compareWithGemini: boolean = false
): Promise<FeedbackData> => {
  try {
    // Geminiの回答を取得（compareWithGeminiがtrueの場合）
    let geminiAnswer: GeminiAnswer | null = null;
    if (compareWithGemini) {
      geminiAnswer = await getGeminiAnswer(quiz, style, locale);
    }

    // 常にモックデータを返す
    // モック遅延を追加（実際のAPI呼び出しをシミュレート）
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 現在はランダムなスコアを生成（より厳格な評価に変更）
    const accuracyScore = Math.floor(Math.random() * 41); // 0-40の範囲
    const styleScore = Math.floor(Math.random() * 41); // 0-40の範囲
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
    
    // Geminiの回答がある場合は結果に追加
    if (geminiAnswer) {
      mockFeedback.gemini_answer = geminiAnswer;
    }
    
    return mockFeedback;
  } catch (error: any) { // any型を使用してエラーオブジェクトにアクセス
    console.error('Error evaluating answer:', error);

    // API制限エラー（429）の場合はエラーメッセージを含むレスポンスが返ってくる
    if (error?.response?.status === 429 && error?.response?.data) {
      return error.response.data; // レート制限エラー時のモックデータを返す
    }

    // その他のエラーの場合はモックデータを返す（より厳格な評価に変更）
    const accuracyScore = Math.floor(Math.random() * 41); // 0-40の範囲
    const styleScore = Math.floor(Math.random() * 41); // 0-40の範囲
    const totalScore = accuracyScore + styleScore;

    // 言語に応じたエラーメッセージ
    const errorMsgJa = "※エラーが発生したため、正確な評価ができませんでした。モックデータを表示しています。";
    const errorMsgEn = "※An error occurred, so we couldn't evaluate accurately. Showing mock data.";

    const errorMsg = locale === 'ja' ? errorMsgJa : errorMsgEn;
    const overallErrorJa = "※注：エラーが発生したため、正確な評価ができませんでした。これはデモ表示です。";
    const overallErrorEn = "※Note: An error occurred, so we couldn't evaluate accurately. This is a demo display.";

    // エラー時のモックGemini回答の作成
    let errorGeminiAnswer: GeminiAnswer | null = null;
    if (compareWithGemini) {
      errorGeminiAnswer = {
        content: locale === 'ja'
          ? `※これはエラー時のモック回答です。${quiz.content_ja}についての模範解答を表示する予定でした。`
          : `※This is a mock answer during error. We intended to show a model answer about ${quiz.content_en}.`,
        avatar_url: "https://lh3.googleusercontent.com/a/ACg8ocL6It7Up3pLC6Zexk19oNK4UQTd_iIz5eXXHxWjZrBxH_cN=s48-c"
      };
    }

    const result: FeedbackData = {
      accuracy_score: accuracyScore,
      accuracy_comment: errorMsg,
      style_score: styleScore,
      style_comment: errorMsg,
      total_score: totalScore,
      overall_comment: locale === 'ja' ? overallErrorJa : overallErrorEn
    };

    // エラーの場合でもGemini回答があれば追加
    if (errorGeminiAnswer) {
      result.gemini_answer = errorGeminiAnswer;
    }

    return result;
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
    if (score >= 41) {
      return "非常に正確な情報提供です。事実に基づいた回答が的確にできています。";
    } else if (score >= 31) {
      return "概ね正確な情報ですが、細部に不正確さがあります。";
    } else if (score >= 21) {
      return "部分的に正確ですが、重要な情報の欠落や誤解を招く表現があります。";
    } else if (score >= 11) {
      return "複数の明確な誤りがあり、いくつかの正確な情報も含まれています。";
    } else if (score >= 1) {
      return "重大な事実誤認があり、ほとんど正確な情報が含まれていません。";
    } else {
      return "完全に誤った情報を含む、または質問と無関係な回答です。";
    }
  } else {
    // 英語のコメント
    if (score >= 41) {
      return "Highly accurate information. Your answer is precisely based on facts.";
    } else if (score >= 31) {
      return "Generally accurate, but with some inaccuracies in details.";
    } else if (score >= 21) {
      return "Partially accurate, but with missing important information or misleading expressions.";
    } else if (score >= 11) {
      return "Contains multiple clear errors, although some accurate information is included.";
    } else if (score >= 1) {
      return "Has serious factual misconceptions with very little accurate information.";
    } else {
      return "Contains completely incorrect information or is irrelevant to the question.";
    }
  }
};

const getStyleComment = (score: number, styleName: string, locale: string = 'ja'): string => {
  if (locale === 'ja') {
    if (score >= 41) {
      return `「${styleName}」の特徴を非常によく捉えています。口調、言い回し、表現方法が見事に再現されています。`;
    } else if (score >= 31) {
      return `「${styleName}」の特徴を概ね再現できていますが、完全ではありません。`;
    } else if (score >= 21) {
      return `「${styleName}」の特徴を部分的に再現できていますが、不自然な箇所が目立ちます。`;
    } else if (score >= 11) {
      return `「${styleName}」の特徴を意識していますが、一貫性がなく不自然です。`;
    } else if (score >= 1) {
      return `「${styleName}」の特徴がほとんど見られず、不適切な表現が多いです。`;
    } else {
      return `「${styleName}」の特徴がまったく見られないか、全く異なる口調になっています。`;
    }
  } else {
    // 英語のコメント
    if (score >= 41) {
      return `You've perfectly reproduced the "${styleName}" style. The tone, expressions, and phrasing are excellently captured.`;
    } else if (score >= 31) {
      return `You've generally reproduced the "${styleName}" style, but it's not perfect.`;
    } else if (score >= 21) {
      return `You've partially reproduced the "${styleName}" style, but there are noticeable unnatural parts.`;
    } else if (score >= 11) {
      return `You're aware of the "${styleName}" style, but your reproduction lacks consistency and feels unnatural.`;
    } else if (score >= 1) {
      return `The "${styleName}" style is barely visible in your answer, with many inappropriate expressions.`;
    } else {
      return `The "${styleName}" style characteristics are completely missing or you've used an entirely different tone.`;
    }
  }
};

const getOverallComment = (totalScore: number, locale: string = 'ja'): string => {
  if (locale === 'ja') {
    if (totalScore >= 90) {
      return "素晴らしい回答です！事実も正確で、指定された口調も完璧に再現されています。Grokのようなレスポンスができています！";
    } else if (totalScore >= 80) {
      return "とても良い回答です。事実確認と口調の両方で高いレベルを達成しています。";
    } else if (totalScore >= 70) {
      return "良い回答です。事実確認と口調の両方でバランスの取れた回答になっています。";
    } else if (totalScore >= 60) {
      return "まずまずの回答です。事実の正確性か口調の再現度、どちらかに改善の余地があります。";
    } else if (totalScore >= 50) {
      return "平均的な回答です。事実の正確性と口調の両方に改善が必要です。";
    } else if (totalScore >= 40) {
      return "基本的な要素は含まれていますが、全体的に不十分です。より正確な情報と適切な口調を意識しましょう。";
    } else if (totalScore >= 30) {
      return "回答として不十分です。事実確認が不足しており、指定された口調の理解も浅いです。";
    } else if (totalScore >= 20) {
      return "回答の質が低いです。事実に基づいた情報が少なく、指定された口調もほとんど再現できていません。";
    } else if (totalScore >= 10) {
      return "非常に不十分な回答です。ほとんど正確な情報がなく、指定された口調の特徴もほぼ見られません。";
    } else {
      return "回答として成立していません。質問の意図を理解し、適切な情報と口調で回答する必要があります。";
    }
  } else {
    // 英語のコメント
    if (totalScore >= 90) {
      return "Excellent answer! The facts are accurate and the requested style is perfectly reproduced. You've responded just like Grok would!";
    } else if (totalScore >= 80) {
      return "Very good answer. You've achieved a high level in both factual accuracy and style reproduction.";
    } else if (totalScore >= 70) {
      return "Good answer. You've achieved a good balance between factual accuracy and the specified tone.";
    } else if (totalScore >= 60) {
      return "Decent answer. There's room for improvement in either factual accuracy or style reproduction.";
    } else if (totalScore >= 50) {
      return "Average answer. Both factual accuracy and style need improvement.";
    } else if (totalScore >= 40) {
      return "Basic elements are included, but overall insufficient. Focus on more accurate information and appropriate style.";
    } else if (totalScore >= 30) {
      return "Insufficient answer. Fact-checking is lacking, and understanding of the specified style is shallow.";
    } else if (totalScore >= 20) {
      return "Low quality answer. Little fact-based information and almost no reproduction of the specified style.";
    } else if (totalScore >= 10) {
      return "Very inadequate answer. Almost no accurate information and almost no characteristics of the specified style.";
    } else {
      return "This doesn't qualify as a valid answer. You need to understand the question's intent and respond with appropriate information and style.";
    }
  }
};