import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import { FeedbackData, EvaluateRequestBody } from '../../utils/types';

/**
 * 回答評価API
 * URL: /api/evaluate-answer
 * POST: クイズ、スタイル、回答を受け取り、Gemini APIで評価結果を返す
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<FeedbackData | {error: string, message?: string}>
) {
  // CORSヘッダーを設定
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // CORS プリフライトリクエスト対応
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // POSTリクエスト以外は拒否
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    // リクエストボディを解析
    const { quiz, style, answer, gemini_answer }: EvaluateRequestBody & { gemini_answer?: string } = req.body;

    if (!quiz || !style || !answer) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Gemini APIキーを環境変数から取得
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'API key not configured' });
    }

    // Gemini APIへのリクエスト内容
    // 言語に応じたコンテンツとスタイル名を使用
    const userLocale = req.headers['accept-language'] || 'en';
    const isJapanese = userLocale.includes('ja');
    const content = isJapanese ? quiz.content_ja : quiz.content_en;
    const styleName = isJapanese ? style.name_ja : style.name_en;
    const styleDesc = isJapanese ? style.description_ja : style.description_en;

    // プロンプトテキスト
    let prompt = "以下の雑学お題に対するユーザー回答を厳格に評価してください:\n\n" +
      "お題: " + content + "\n" +
      "指定された口調: " + styleName + "\n" +
      "指定口調の説明: " + styleDesc + "\n" +
      "ユーザー回答: " + answer + "\n\n";

    // Geminiの回答がある場合は比較対象として追加
    if (gemini_answer) {
      prompt += "参考（Geminiの回答）: " + gemini_answer + "\n\n" +
      "以下の2点について評価し、0〜50点で採点してください:\n" +
      "1. 回答の正確性 (実際の事実と照らし合わせて、Geminiの回答も参考にする)\n" +
      "2. 指定された口調の再現度\n\n";
    } else {
      prompt += "以下の2点について評価し、0〜50点で採点してください:\n" +
      "1. 回答の正確性 (実際の事実と照らし合わせて)\n" +
      "2. 指定された口調の再現度\n\n";
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
      return res.status(500).json({ error: 'Failed to parse API response' });
    }

    const jsonResponse = JSON.parse(jsonMatch[0]);
    return res.status(200).json(jsonResponse);
  } catch (error: any) {
    console.error('Error:', error);

    // APIのレートリミットエラー（429）を特別に処理
    if (error.response && error.response.status === 429) {
      return res.status(429).json({
        error: 'Rate Limit Exceeded',
        message: 'APIの呼び出し制限に達しました。しばらく時間をおいてから再度お試しください。',
        accuracy_score: 25,
        accuracy_comment: "※APIの制限により正確な評価ができませんでした。モックデータを表示しています。",
        style_score: 25,
        style_comment: "※APIの制限により正確な評価ができませんでした。モックデータを表示しています。",
        total_score: 50,
        overall_comment: "※注：現在APIの呼び出し制限に達しているため、正確な評価ができませんでした。これはデモ表示です。"
      });
    }

    return res.status(500).json({
      error: 'Internal Server Error',
      message: error.message
    });
  }
}