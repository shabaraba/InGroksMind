import { compress, decompress } from './compression';

/**
 * 長いURLを短い形式に圧縮する
 * @param url 元のURL（クエリパラメータ付き）
 * @returns 圧縮されたURL
 */
export const shortenUrl = (url: string): string => {
  // URLからクエリパラメータ部分を取得
  const urlObj = new URL(url);
  const baseUrl = urlObj.origin + urlObj.pathname;
  const params = urlObj.searchParams;
  
  // 必要なパラメータだけを取り出して圧縮する
  const dataToCompress = {
    a: params.get('answer') || '', // 回答
    l: params.get('lang') || '', // 言語
    qu: params.get('quizUserId') || '', // クイズユーザーID
    ru: params.get('replyUserId') || '', // 返信ユーザーID
    d: params.get('direct') || '' // 直接アクセスフラグ
  };
  
  // オブジェクトを文字列化して圧縮
  const compressed = compress(JSON.stringify(dataToCompress));
  
  // 圧縮した文字列をURLセーフな形式にエンコード
  const encodedData = encodeURIComponent(compressed);
  
  // 短縮形式のURLを返す
  return `${baseUrl}?c=${encodedData}`;
};

// 展開されたURLパラメータの型定義
interface ExpandedUrlParams {
  quizId?: string;
  styleId?: string;
  answer?: string;
  lang?: string;
  [key: string]: string | undefined;
}

/**
 * 圧縮されたURLを元の形式に展開する
 * @param url 圧縮されたURL
 * @returns 展開されたパラメータオブジェクト
 */
export const expandUrlParams = (compressedData: string): ExpandedUrlParams => {
  const result: ExpandedUrlParams = {};
  
  try {
    // 圧縮されたデータをデコードして展開
    const decodedData = decodeURIComponent(compressedData);
    const decompressed = decompress(decodedData);
    const data = JSON.parse(decompressed);
    
    // 元のURLパラメータに戻す
    if (data.a) result.answer = data.a;
    if (data.l) result.lang = data.l;
    if (data.qu) result.quizUserId = data.qu;
    if (data.ru) result.replyUserId = data.ru;
    if (data.d) result.direct = data.d;
  } catch (error) {
    console.error('Error expanding URL:', error);
  }
  
  return result;
};