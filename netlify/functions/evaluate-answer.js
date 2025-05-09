// Gemini APIを呼び出してユーザーの回答を評価するサーバーレス関数
const axios = require('axios');

// Gemini APIのエンドポイント
const GEMINI_API_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent';

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
    const prompt = \`
以下の雑学お題に対するユーザー回答を評価してください:

お題: \${quiz.content}
指定された口調: \${style.name}
指定口調の説明: \${style.description}
ユーザー回答: \${answer}

以下の2点について評価し、1〜50点で採点してください:
1. 回答の正確性 (実際の事実と照らし合わせて)
2. 指定された口調の再現度

回答形式:
{
  "accuracy_score": 数値,
  "accuracy_comment": "コメント",
  "style_score": 数値,
  "style_comment": "コメント",
  "total_score": 数値,
  "overall_comment": "総評"
}

注意: 
- accuracy_scoreとstyle_scoreはそれぞれ最大50点、合計で100点満点です
- JSONフォーマットで回答してください
- 各scoreは整数値にしてください
\`;

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