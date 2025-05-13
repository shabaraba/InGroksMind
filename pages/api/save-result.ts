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
    
    // Redis設定が存在するか確認
    const hasRedisConfig = 
      process.env.UPSTASH_REDIS_REST_URL && 
      process.env.UPSTASH_REDIS_REST_TOKEN;
    
    // KVストアにデータを保存（開発環境ではモック成功）
    const success = await saveResultToKV(shareId, resultData);
    
    // ホスト名を取得
    const host = req.headers.host || 'localhost:3000';
    
    // シェアURLを生成
    const shareUrl = generateShareUrl(shareId, host);
    
    // 開発環境のRedis未設定の場合の対応
    if (!hasRedisConfig && process.env.NODE_ENV === 'development') {
      console.log(`[Development Mode] Would save data with ID: ${shareId}`);
      console.log('Redis is not configured. Generated mock share URL:', shareUrl);
      
      // 開発環境では成功レスポンスを返す（警告付き）
      return res.status(200).json({
        success: true,
        shareId,
        shareUrl,
        warning: 'Running in development mode without Redis. Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN for production use.'
      });
    }
    
    // 保存が失敗した場合
    if (!success) {
      console.error('Failed to save result data to Redis');
      return res.status(500).json({ 
        error: 'Failed to save result data'
      });
    }
    
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