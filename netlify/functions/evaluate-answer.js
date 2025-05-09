// Gemini APIを呼び出してユーザーの回答を評価するサーバーレス関数
const axios = require('axios');

// Gemini APIのエンドポイント
const GEMINI_API_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

exports.handler = async function(event, context) {
  // CORSヘッダー
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  // プリフライトリクエスト対応
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  // POSTリクエスト以外は拒否
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  try {
    // リクエストボディを解析
    const requestBody = JSON.parse(event.body);
    const { quiz, style, answer } = requestBody;

    if (!quiz || !style || !answer) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing required fields' })
      };
    }

    // Gemini APIキーを環境変数から取得
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'API key not configured' })
      };
    }

    // Gemini APIへのリクエスト内容
    // 言語に応じたコンテンツとスタイル名を使用
    const isJapanese = quiz.content_ja && (quiz.content_ja.length > 0);
    const content = isJapanese ? quiz.content_ja : quiz.content_en;
    const styleName = isJapanese ? style.name_ja : style.name_en;
    const styleDesc = isJapanese ? style.description_ja : style.description_en;

    // ES5互換の文字列連結を使用
    const prompt =
    "以下の雑学お題に対するユーザー回答を評価してください:\n\n" +
    "お題: " + content + "\n" +
    "指定された口調: " + styleName + "\n" +
    "指定口調の説明: " + styleDesc + "\n" +
    "ユーザー回答: " + answer + "\n\n" +
    "以下の2点について評価し、1〜50点で採点してください:\n" +
    "1. 回答の正確性 (実際の事実と照らし合わせて)\n" +
    "2. 指定された口調の再現度\n\n" +
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
    "- 各scoreは整数値にしてください";

    // Gemini APIリクエスト
    const response = await axios.post(
      GEMINI_API_ENDPOINT + "?key=" + apiKey,
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
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Failed to parse API response' })
      };
    }

    const jsonResponse = JSON.parse(jsonMatch[0]);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(jsonResponse)
    };
  } catch (error) {
    console.error('Error:', error);

    // APIのレートリミットエラー（429）を特別に処理
    if (error.response && error.response.status === 429) {
      return {
        statusCode: 429,
        headers,
        body: JSON.stringify({
          error: 'Rate Limit Exceeded',
          message: 'APIの呼び出し制限に達しました。しばらく時間をおいてから再度お試しください。',
          accuracy_score: 25,
          accuracy_comment: "※APIの制限により正確な評価ができませんでした。モックデータを表示しています。",
          style_score: 25,
          style_comment: "※APIの制限により正確な評価ができませんでした。モックデータを表示しています。",
          total_score: 50,
          overall_comment: "※注：現在APIの呼び出し制限に達しているため、正確な評価ができませんでした。これはデモ表示です。"
        })
      };
    }

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Internal Server Error',
        message: error.message
      })
    };
  }
};
