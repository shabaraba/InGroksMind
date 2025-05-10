import { QuizItem } from '../data/quizData';
import { StyleVariation } from '../data/styleVariations';
import axios from 'axios';
import { GeminiAnswer, FeedbackData } from './types';

/**
 * サーバーサイドでGemini APIを使用して回答を生成する
 */
export const getGeminiAnswerServer = async (
  quiz: QuizItem,
  style: StyleVariation,
  locale: string = 'ja'
): Promise<GeminiAnswer | null> => {
  try {
    // APIキーを環境変数から取得
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.log("API key not configured, returning mock data");
      return getMockGeminiAnswer(quiz, style, locale, true);
    }

    // 言語に応じたコンテンツとスタイル
    const content = locale === 'ja' ? quiz.content_ja : quiz.content_en;
    const styleName = locale === 'ja' ? style.name_ja : style.name_en;
    const styleDesc = locale === 'ja' ? style.description_ja : style.description_en;

    // プロンプトテキスト (言語によって切り替え)
    let prompt;
    if (locale === 'ja') {
      prompt = "以下の投稿にたいしてファクトチェックしてください:\n\n" +
        "投稿: " + content + "\n" +
        "指定された口調: " + styleName + "\n" +
        "指定口調の説明: " + styleDesc + "\n\n" +
        "注意: \n" +
        "- 回答は指定された口調で行ってください\n" +
        "- 事実に基づいた正確な情報を提供してください\n" +
        "- 回答は200〜300文字程度にしてください\n" +
        "- 必ず日本語で回答してください";
    } else {
      prompt = "Please fact-check the following post:\n\n" +
        "Post: " + content + "\n" +
        "Specified tone: " + styleName + "\n" +
        "Tone description: " + styleDesc + "\n\n" +
        "Note: \n" +
        "- Answer in the specified tone\n" +
        "- Provide accurate information based on facts\n" +
        "- Keep your answer around 200-300 characters\n" +
        "- Answer in English";
    }

    // Gemini APIのエンドポイント
    const GEMINI_API_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

    // Gemini APIリクエスト
    const response = await axios.post(
      `${GEMINI_API_ENDPOINT}?key=${apiKey}`,
      {
        contents: [
          {
            parts: [
              { text: prompt }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        }
      }
    );

    // レスポンスからテキストを抽出
    const textResponse = response.data.candidates[0].content.parts[0].text;
    
    // アバター画像URL
    const avatarUrl = "https://lh3.googleusercontent.com/a/ACg8ocL6It7Up3pLC6Zexk19oNK4UQTd_iIz5eXXHxWjZrBxH_cN=s48-c";
    
    return {
      content: textResponse.trim(),
      avatar_url: avatarUrl
    };
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    // エラー時はモックデータを返す
    return getMockGeminiAnswer(quiz, style, locale, false);
  }
};

/**
 * サーバーサイドでGemini APIを使用して回答を評価する
 */
export const evaluateAnswerServer = async (
  quiz: QuizItem,
  style: StyleVariation,
  userAnswer: string,
  geminiAnswer: GeminiAnswer | null,
  locale: string = 'ja'
): Promise<FeedbackData> => {
  try {
    // APIキーを環境変数から取得
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.log("API key not configured, returning mock evaluation");
      return getMockEvaluation(locale, geminiAnswer);
    }

    // 言語に応じたコンテンツとスタイル
    const content = locale === 'ja' ? quiz.content_ja : quiz.content_en;
    const styleName = locale === 'ja' ? style.name_ja : style.name_en;
    const styleDesc = locale === 'ja' ? style.description_ja : style.description_en;

    // プロンプトテキスト作成 (言語によって切り替え)
    let prompt;

    if (locale === 'ja') {
      prompt = "以下の雑学お題に対するユーザー回答を厳格に評価してください:\n\n" +
        "お題: " + content + "\n" +
        "指定された口調: " + styleName + "\n" +
        "指定口調の説明: " + styleDesc + "\n" +
        "ユーザー回答: " + userAnswer + "\n\n";
    } else {
      prompt = "Please strictly evaluate the user's answer to the following trivia topic:\n\n" +
        "Topic: " + content + "\n" +
        "Specified tone: " + styleName + "\n" +
        "Tone description: " + styleDesc + "\n" +
        "User answer: " + userAnswer + "\n\n";
    }

    // Geminiの回答がある場合は比較対象として追加
    if (geminiAnswer) {
      if (locale === 'ja') {
        prompt += "参考（Geminiの回答）: " + geminiAnswer.content + "\n\n" +
        "以下の2点について評価し、0〜50点で採点してください:\n" +
        "1. 回答の正確性 (実際の事実と照らし合わせて、Geminiの回答も参考にする)\n" +
        "2. 指定された口調の再現度\n\n";
      } else {
        prompt += "Reference (Gemini's answer): " + geminiAnswer.content + "\n\n" +
        "Please evaluate and score the following two points from 0 to 50:\n" +
        "1. Accuracy of the answer (compared to actual facts, also referencing Gemini's answer)\n" +
        "2. Reproduction of the specified tone\n\n";
      }
    } else {
      if (locale === 'ja') {
        prompt += "以下の2点について評価し、0〜50点で採点してください:\n" +
        "1. 回答の正確性 (実際の事実と照らし合わせて)\n" +
        "2. 指定された口調の再現度\n\n";
      } else {
        prompt += "Please evaluate and score the following two points from 0 to 50:\n" +
        "1. Accuracy of the answer (compared to actual facts)\n" +
        "2. Reproduction of the specified tone\n\n";
      }
    }

    prompt +=
      "採点基準:\n" +
      "正確性 (accuracy_score):\n" +
      "- 0点: 完全に誤った情報を含む、または質問と無関係な回答\n" +
      "- 1-10点: 重大な事実誤認があり、ほとんど正確な情報が含まれていない\n" +
      "- 11-20点: 複数の明確な誤りがあるが、いくつかの正確な情報も含まれている\n" +
      "- 21-30点: 部分的に正確だが、重要な情報の欠落や誤解を招く表現がある\n" +
      "- 31-40点: 概ね正確だが、細部に不正確さがある\n" +
      "- 41-50点: 完全に事実に基づいた正確な情報を含む\n\n" +
      "口調 (style_score):\n" +
      "- 0点: 指定された口調の特徴がまったく見られない、または全く異なる口調\n" +
      "- 1-10点: 指定された口調の特徴がほとんど見られず、不適切な表現が多い\n" +
      "- 11-20点: 指定された口調を意識しているが、一貫性がなく不自然\n" +
      "- 21-30点: 部分的に口調を再現できているが、不自然な箇所が目立つ\n" +
      "- 31-40点: 概ね口調を再現できているが、完全ではない\n" +
      "- 41-50点: 指定された口調を完璧に再現している\n\n" +
      "重要: 厳格に評価し、基準を厳密に適用してください。満点や高得点は本当に優れた回答のみに与えてください。文章として不完全、不自然、または事実に反する内容があれば、それに応じて大幅に減点してください。\n\n" +
      "回答形式:\n" +
      "{\n" +
      "  \"accuracy_score\": 数値,\n" +
      "  \"accuracy_comment\": \"コメント\",\n" +
      "  \"style_score\": 数値,\n" +
      "  \"style_comment\": \"コメント\",\n" +
      "  \"total_score\": 数値,\n" +
      "  \"overall_comment\": \"総評\"\n" +
      "}\n\n" +
      "注意: \n" +
      "- accuracy_scoreとstyle_scoreはそれぞれ最大50点、合計で100点満点です\n" +
      "- JSONフォーマットで回答してください\n" +
      "- 各scoreは整数値にしてください\n" +
      "- 甘い評価は避け、実際の品質に応じた厳格な評価を行ってください";

    // Gemini APIのエンドポイント
    const GEMINI_API_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

    // Gemini APIリクエスト
    const response = await axios.post(
      `${GEMINI_API_ENDPOINT}?key=${apiKey}`,
      {
        contents: [
          {
            parts: [
              { text: prompt }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.2,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        }
      }
    );

    // レスポンスからJSONを抽出
    const textResponse = response.data.candidates[0].content.parts[0].text;
    const jsonMatch = textResponse.match(/({[\s\S]*})/);
    
    if (!jsonMatch) {
      console.error('Failed to parse API response');
      return getMockEvaluation(locale, geminiAnswer);
    }

    const jsonResponse = JSON.parse(jsonMatch[0]);
    
    // Gemini回答を結果に含める
    if (geminiAnswer) {
      jsonResponse.gemini_answer = geminiAnswer;
    }
    
    return jsonResponse as FeedbackData;
  } catch (error) {
    console.error('Error evaluating answer with Gemini API:', error);
    // エラー時はモックデータを返す
    return getMockEvaluation(locale, geminiAnswer);
  }
};

/**
 * モックのGemini回答を生成する
 */
const getMockGeminiAnswer = (
  quiz: QuizItem,
  style: StyleVariation,
  locale: string,
  isApiDisabled: boolean
): GeminiAnswer => {
  const content = locale === 'ja' ? quiz.content_ja : quiz.content_en;
  const styleName = locale === 'ja' ? style.name_ja : style.name_en;
  
  return {
    content: locale === 'ja'
      ? `${isApiDisabled ? '（APIキーが設定されていないため）' : '（API呼び出しエラーのため）'}これはGeminiの模範解答です。${content}について、${styleName}の口調でお答えします。このお題についての正確な情報をご提供します。実際の情報に基づいて回答すると、このようになるでしょう。`
      : `This is a model answer from Gemini. I'll answer about ${content} in the style of ${styleName}. Let me provide you with accurate information about this topic. Based on factual information, the answer would look like this. ${isApiDisabled ? '(API key is not configured)' : '(API call error occurred)'}`,
    avatar_url: "https://lh3.googleusercontent.com/a/ACg8ocL6It7Up3pLC6Zexk19oNK4UQTd_iIz5eXXHxWjZrBxH_cN=s48-c"
  };
};

/**
 * モックの評価データを生成する
 */
const getMockEvaluation = (
  locale: string,
  geminiAnswer: GeminiAnswer | null
): FeedbackData => {
  // 0-40のランダムなスコアを生成
  const accuracyScore = Math.floor(Math.random() * 41);
  const styleScore = Math.floor(Math.random() * 41);
  const totalScore = accuracyScore + styleScore;
  
  const isJapanese = locale === 'ja';
  const errorMsg = isJapanese 
    ? "※Gemini APIでエラーが発生したため、モックデータを表示しています。" 
    : "※An error occurred with Gemini API, showing mock data.";
  const overallError = isJapanese 
    ? "※注：現在APIの呼び出しに問題があるため、正確な評価ができませんでした。これはデモ表示です。" 
    : "※Note: Currently API calls are having issues, so we couldn't evaluate accurately. This is a demo display.";

  // 評価データを生成
  const result: FeedbackData = {
    accuracy_score: accuracyScore,
    accuracy_comment: errorMsg,
    style_score: styleScore,
    style_comment: errorMsg,
    total_score: totalScore,
    overall_comment: overallError
  };
  
  // Gemini回答を結果に含める
  if (geminiAnswer) {
    result.gemini_answer = geminiAnswer;
  }
  
  return result;
};
