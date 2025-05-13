import { Redis } from '@upstash/redis';
import { ResultPageData } from './types';

// 環境変数のチェック
const hasRedisConfig = 
  process.env.KV_REST_API_URL && 
  process.env.KV_REST_API_TOKEN;

// Upstash Redisクライアントの初期化（環境変数が設定されている場合のみ）
const redis = hasRedisConfig 
  ? new Redis({
      url: process.env.KV_REST_API_URL || '',
      token: process.env.KV_REST_API_TOKEN || '',
    })
  : null;

/**
 * 結果データをRedisに保存する
 * @param shareId シェアID
 * @param data 保存するデータ
 * @param expirationSeconds 有効期限（秒）- デフォルトは7日間
 * @returns 保存が成功したかどうか
 */
export const saveResultToKV = async (
  shareId: string,
  data: ResultPageData,
  expirationSeconds: number = 60 * 60 * 24 * 7 // 7日間
): Promise<boolean> => {
  // Redisが設定されていない場合は、ローカルストレージの代わりにデバッグモードで処理
  if (!redis) {
    console.log(`[Development Mode] Would save data for shareId: ${shareId}`);
    console.log('Redis is not configured. Set KV_REST_API_URL and KV_REST_API_TOKEN environment variables.');
    
    // 開発環境では成功を返す
    if (process.env.NODE_ENV === 'development') {
      return true;
    }
    return false;
  }
  
  try {
    // データを文字列に変換して保存（直接オブジェクトは保存できない）
    const dataString = JSON.stringify(data);
    await redis.set(`result:${shareId}`, dataString, { ex: expirationSeconds });
    return true;
  } catch (error) {
    console.error('Error saving result to Upstash Redis:', error);
    return false;
  }
};

/**
 * Redisから結果データを取得する
 * @param shareId シェアID
 * @returns 結果データまたはnull
 */
export const getResultFromKV = async (shareId: string): Promise<ResultPageData | null> => {
  // Redisが設定されていない場合
  if (!redis) {
    console.log(`[Development Mode] Would retrieve data for shareId: ${shareId}`);
    console.log('Redis is not configured. Set KV_REST_API_URL and KV_REST_API_TOKEN environment variables.');
    return null;
  }
  
  try {
    const data = await redis.get(`result:${shareId}`);
    if (!data) return null;
    
    // データが文字列であることを確認
    if (typeof data === 'string') {
      return JSON.parse(data);
    } else if (typeof data === 'object') {
      // すでにオブジェクトの場合はそのまま返す（Upstashの挙動に対応）
      return data;
    } else {
      console.error(`Unexpected data type from Redis: ${typeof data}`);
      return null;
    }
  } catch (error) {
    console.error('Error retrieving result from Upstash Redis:', error);
    return null;
  }
};

/**
 * シェアIDを生成する
 * @returns ランダムなシェアID
 */
export const generateShareId = (): string => {
  // 16文字のランダムなIDを生成（英数字のみ）
  return Math.random().toString(36).substring(2, 10) + 
         Math.random().toString(36).substring(2, 10);
};

/**
 * シェアURLを生成する
 * @param shareId シェアID
 * @param host ホスト名（デフォルトはlocalhost:3000）
 * @returns シェアURL
 */
export const generateShareUrl = (
  shareId: string,
  host: string = 'localhost:3000'
): string => {
  const protocol = host.includes('localhost') ? 'http' : 'https';
  return `${protocol}://${host}/share/${shareId}`;
};
