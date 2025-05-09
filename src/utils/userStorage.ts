/**
 * ユーザー名をローカルストレージに保存・取得するためのユーティリティ
 */

// ストレージキー
const USERNAME_KEY = 'begrok_username';

/**
 * ユーザー名を保存
 */
export const saveUsername = (username: string): void => {
  localStorage.setItem(USERNAME_KEY, username);
};

/**
 * ユーザー名を取得
 */
export const getUsername = (): string | null => {
  return localStorage.getItem(USERNAME_KEY);
};

/**
 * ユーザー名をランダムに生成
 */
export const generateRandomUsername = (): string => {
  const prefixes = ['grok', 'ai', 'x', 'truth', 'fact', 'quiz'];
  const suffixes = ['fan', 'lover', 'user', 'checker', 'master', 'guru'];
  const randomNum = Math.floor(Math.random() * 1000);
  
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
  
  return `${prefix}_${suffix}${randomNum}`;
};

/**
 * ユーザー名からランダムなカラーを生成
 */
export const getUserColor = (username: string): string => {
  const colors = [
    'bg-indigo-600', 'bg-green-600', 'bg-pink-600', 'bg-yellow-600', 
    'bg-blue-600', 'bg-red-600', 'bg-purple-600', 'bg-teal-600'
  ];
  
  // ユーザー名から一貫したインデックスを生成
  const hash = username.split('').reduce((acc, char) => {
    return acc + char.charCodeAt(0);
  }, 0);
  
  return colors[hash % colors.length];
};

/**
 * ユーザー名から表示用の頭文字を生成
 */
export const getUserInitial = (username: string): string => {
  if (!username || username.length === 0) return 'U';
  return username.charAt(0).toUpperCase();
};