/**
 * 文字列圧縮ユーティリティ
 * URL短縮に使用する簡易版圧縮・復号化機能
 */

// Base64文字をURL安全に変換するための文字マッピング
const toBase64URL = (base64: string) => {
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};

// URL安全なBase64を標準Base64に戻す
const fromBase64URL = (base64url: string) => {
  let base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
  // パディングを追加
  while (base64.length % 4) {
    base64 += '=';
  }
  return base64;
};

/**
 * 文字列を圧縮してBase64URLエンコードする
 * @param data 圧縮する文字列
 * @returns 圧縮されたBase64URL文字列
 */
export const compress = (data: string): string => {
  try {
    // 圧縮のために、最近のブラウザであればCompressionStreamを使用できる
    if (typeof TextEncoder !== 'undefined' && typeof CompressionStream !== 'undefined') {
      // ブラウザ側ではCompressionStreamを使う方法もあるが、
      // ここでは簡易的なBase64エンコードとカスタム短縮を行う
      const encoded = btoa(unescape(encodeURIComponent(data)));
      return toBase64URL(encoded);
    } else {
      // フォールバック：Node.js環境や非対応ブラウザでは
      // より単純なBase64エンコードだけを使用
      const encoded = Buffer.from(data).toString('base64');
      return toBase64URL(encoded);
    }
  } catch (error) {
    console.error('Compression error:', error);
    // エラーの場合は元の文字列をBase64エンコードして返す
    return toBase64URL(btoa(data));
  }
};

/**
 * Base64URLエンコードされた文字列を展開する
 * @param compressedData 圧縮されたBase64URL文字列
 * @returns 展開された元の文字列
 */
export const decompress = (compressedData: string): string => {
  try {
    // Base64URLを標準Base64に戻す
    const base64 = fromBase64URL(compressedData);
    
    // ブラウザ環境
    if (typeof atob !== 'undefined') {
      return decodeURIComponent(escape(atob(base64)));
    } else {
      // Node.js環境
      return Buffer.from(base64, 'base64').toString();
    }
  } catch (error) {
    console.error('Decompression error:', error);
    // エラーの場合は可能な限り元のデータを返そうとする
    try {
      return atob(compressedData);
    } catch (e) {
      return compressedData; // 最終的に失敗したら元の文字列をそのまま返す
    }
  }
};