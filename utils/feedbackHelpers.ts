import { FeedbackData, GeminiAnswer } from "./types";

// 正確性コメントを取得する関数
export const getAccuracyComment = (score: number, locale: string = 'ja'): string => {
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

// 口調コメントを取得する関数
export const getStyleComment = (score: number, styleName: string, locale: string = 'ja'): string => {
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

// 総合評価コメントを取得する関数
export const getOverallComment = (totalScore: number, locale: string = 'ja'): string => {
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

// フィードバックデータを生成する関数
export const createFeedbackData = (
  score: number, 
  isJapanese: boolean,
  quiz: any,
  style: any,
  initialGeminiAnswer?: GeminiAnswer
): FeedbackData => {
  const accuracyScore = Math.floor(score / 2);
  const styleScore = score - accuracyScore;
  const locale = isJapanese ? 'ja' : 'en';
  const currentContent = isJapanese ? quiz.content_ja : quiz.content_en;
  const currentStyleName = isJapanese ? style.name_ja : style.name_en;
  
  // Gemini回答の言語に応じた更新
  let geminiAnswer = initialGeminiAnswer;
  if (initialGeminiAnswer) {
    // モックデータや説明文の場合は言語に応じて内容を更新
    if (initialGeminiAnswer.content.includes('※') || 
        initialGeminiAnswer.content.includes('model answer')) {
      geminiAnswer = {
        ...initialGeminiAnswer,
        content: isJapanese 
          ? `これはGeminiの模範解答です。${currentContent}について、${currentStyleName}の口調でお答えします。このお題についての正確な情報をご提供します。`
          : `This is a model answer from Gemini. I'll answer about ${currentContent} in the style of ${currentStyleName}. Let me provide you with accurate information about this topic.`
      };
    }
  }
  
  return {
    accuracy_score: accuracyScore,
    accuracy_comment: getAccuracyComment(accuracyScore, locale),
    style_score: styleScore,
    style_comment: getStyleComment(styleScore, currentStyleName, locale),
    total_score: score,
    overall_comment: getOverallComment(score, locale),
    gemini_answer: geminiAnswer
  };
};