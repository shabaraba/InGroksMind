import { NextApiRequest, NextApiResponse } from 'next';
import { generateShareId, saveResultToKV, generateShareUrl } from '../../utils/kvStorage';
import { ResultPageData } from '../../utils/types';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // POSTリクエストのみ許可
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // リクエストボディから必要なデータを取得
    const resultData: ResultPageData = req.body;
    
    // 必須フィールドの確認
    if (!resultData.quizId || !resultData.styleId || !resultData.answer) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // 一意のシェアIDを生成
    const shareId = generateShareId();
    
    // KVストアにデータを保存
    const success = await saveResultToKV(shareId, resultData);
    
    if (!success) {
      return res.status(500).json({ error: 'Failed to save result data' });
    }
    
    // ホスト名を取得
    const host = req.headers.host || 'localhost:3000';
    
    // シェアURLを生成
    const shareUrl = generateShareUrl(shareId, host);
    
    // 成功レスポンスを返す
    return res.status(200).json({
      success: true,
      shareId,
      shareUrl
    });
  } catch (error) {
    console.error('Error saving result:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}