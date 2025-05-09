/**
 * 名前またはユーザー名からGravatarのURLを生成します
 * Gravatarは、ユーザーのメールアドレスのMD5ハッシュ値に基づいてアバターを提供するサービスです
 * メールアドレスが無い場合でも、ユーザー名のハッシュから一貫したアバターを生成できます
 */
export const getGravatarUrl = (identifier: string, size = 200): string => {
  // MD5ハッシュを生成するシンプルな関数
  // 本来はライブラリを使うべきですが、依存関係を増やさないために簡易実装
  const hash = simpleHash(identifier.trim().toLowerCase());
  
  // Gravatarの「Retro」スタイルを使用して、8ビットスタイルのアバターを生成
  return `https://www.gravatar.com/avatar/${hash}?s=${size}&d=retro`;
};

/**
 * 文字列からランダムな色を生成します
 * ユーザー名から一貫した色を生成するために使用
 */
export const getUserColor = (username: string): string => {
  const colors = [
    'bg-indigo-600', 'bg-green-600', 'bg-pink-600', 'bg-yellow-600', 
    'bg-blue-600', 'bg-red-600', 'bg-purple-600', 'bg-teal-600'
  ];
  
  // ユーザー名から一貫したインデックスを生成
  const index = Math.abs(simpleHash(username).split('').reduce((acc, char) => {
    return acc + char.charCodeAt(0);
  }, 0) % colors.length);
  
  return colors[index];
};

/**
 * ユーザー名からアバターの頭文字を取得します
 */
export const getInitial = (displayName: string): string => {
  return displayName.trim().charAt(0).toUpperCase();
};

/**
 * シンプルなハッシュ関数
 * 暗号的に安全ではありませんが、アバター生成の目的には十分です
 */
const simpleHash = (str: string): string => {
  let hash = 0;
  
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // 32bitの整数に変換
  }
  
  // 16進数の文字列に変換
  let hashHex = (hash >>> 0).toString(16);
  
  // 少なくとも32文字になるように0で埋める
  while (hashHex.length < 32) {
    hashHex = '0' + hashHex;
  }
  
  return hashHex;
};

/**
 * GitHubのアバターURLを生成します
 * GitHubはユーザー名からアバターを取得できる公開APIを提供しています
 */
export const getGitHubAvatarUrl = (username: string, size = 200): string => {
  return `https://github.com/${username}.png?size=${size}`;
};