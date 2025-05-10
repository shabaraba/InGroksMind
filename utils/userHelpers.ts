import { VirtualUser, virtualUsers, getRandomUser, getGrokUser } from "../data/virtualUsers";

// 文字列からハッシュ値を生成する関数
export const hashString = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
};

// ユーザーIDのペアを作成（必ず異なるIDのペア）
const USER_PAIRS = [
  [1, 2], // IDが1と2のユーザー
  [2, 3], // IDが2と3のユーザー
  [3, 4], // IDが3と4のユーザー
  [4, 5], // IDが4と5のユーザー
  [5, 1]  // IDが5と1のユーザー
];

// resultIdを使って決定的に2人のユーザーを選択
export const selectDistinctUsers = (resultId: string, isJapanese: boolean): [VirtualUser, VirtualUser] => {
  const pairIndex = Math.abs(hashString(resultId)) % USER_PAIRS.length;
  const selectedPair = USER_PAIRS[pairIndex];

  // 選択したペアのIDに対応するユーザーを取得
  const user1 = { ...virtualUsers.find(user => user.id === selectedPair[0])! };
  const user2 = { ...virtualUsers.find(user => user.id === selectedPair[1])! };

  // 言語に合わせて名前を設定
  user1.name = isJapanese ? user1.name_ja : user1.name_en;
  user2.name = isJapanese ? user2.name_ja : user2.name_en;

  return [user1, user2];
};

// resultIdとquizIdを使って決定的にユーザーIDのペアを生成
export const generateConsistentUserIds = (resultId: string, quizId: number): [number, number] => {
  const hash = hashString(resultId + quizId.toString());
  const pairIndex = hash % USER_PAIRS.length;
  const selectedPair = USER_PAIRS[pairIndex];
  return [selectedPair[0], selectedPair[1]]; // 明示的なタプル配列を返す
};

// 指定されたIDのユーザーを取得、またはランダムに選択
export const getSpecificUser = (userId: number, defaultUser: VirtualUser, isJapanese: boolean): VirtualUser => {
  if (userId > 0) {
    const foundUser = virtualUsers.find(u => u.id === userId);
    if (foundUser) {
      const user = { ...foundUser };
      user.name = isJapanese ? user.name_ja : user.name_en;
      return user;
    }
  }
  return defaultUser;
};

// URLパラメータまたは決定的IDから2人のユーザーIDを解決
export const resolveUserIds = (
  resultId: string,
  quizId: number,
  quizUserId?: number,
  replyUserId?: number
): [number, number] => {
  if (quizUserId && replyUserId && quizUserId > 0 && replyUserId > 0 && quizUserId !== replyUserId) {
    // URLパラメータ経由で渡されたIDがあり、かつ重複していない場合
    return [quizUserId, replyUserId];
  } else {
    // それ以外の場合は決定的に生成されたペアを使用
    return generateConsistentUserIds(resultId, quizId);
  }
};

// ユーザーの初期化
export const initializeUsers = (
  resultId: string,
  quizId: number,
  isJapanese: boolean,
  urlQuizUserId?: number,
  urlReplyUserId?: number
): [VirtualUser, VirtualUser] => {
  const [fixedQuizUserId, fixedReplyUserId] = resolveUserIds(resultId, quizId, urlQuizUserId, urlReplyUserId);
  
  return [
    getSpecificUser(fixedQuizUserId, getRandomUser(isJapanese), isJapanese),
    getSpecificUser(fixedReplyUserId, getRandomUser(isJapanese), isJapanese)
  ];
};