export interface VirtualUser {
  id: number;
  name_ja: string;
  name_en: string;
  username: string;
  avatar: string; // ユーザーアバター（カラーコードや画像URL）
  name?: string; // 現在の言語に基づいて動的に設定される
}

// 仮想ユーザーのデータ
export const virtualUsers: VirtualUser[] = [
  {
    id: 1,
    name_ja: "知識人",
    name_en: "Knowledge Maven",
    username: "knowledge_lover",
    avatar: "#4ade80" // 緑色
  },
  {
    id: 2,
    name_ja: "ファクトチェッカー",
    name_en: "Fact Checker",
    username: "fact_checker",
    avatar: "#60a5fa" // 青色
  },
  {
    id: 3,
    name_ja: "歴史オタク",
    name_en: "History Buff",
    username: "history_buff",
    avatar: "#f97316" // オレンジ色
  },
  {
    id: 4,
    name_ja: "雑学マニア",
    name_en: "Trivia Master",
    username: "trivia_master",
    avatar: "#8b5cf6" // 紫色
  },
  {
    id: 5,
    name_ja: "リサーチャー",
    name_en: "Deep Researcher",
    username: "deep_researcher",
    avatar: "#ec4899" // ピンク色
  }
];

// ランダムな仮想ユーザーを取得（言語に基づく）
export const getRandomUser = (isJapanese: boolean = true): VirtualUser => {
  const randomIndex = Math.floor(Math.random() * virtualUsers.length);
  const user = { ...virtualUsers[randomIndex] };
  user.name = isJapanese ? user.name_ja : user.name_en;
  return user;
};

// Grokユーザー
export const grokUser: VirtualUser = {
  id: 0,
  name_ja: "Grok",
  name_en: "Grok",
  username: "grok",
  avatar: "#1d9bf0", // Twitter Blue
  name: "Grok"
};

// isJapaneseに基づいてGrokユーザーの名前を設定
export const getGrokUser = (isJapanese: boolean = true): VirtualUser => {
  const user = { ...grokUser };
  user.name = isJapanese ? user.name_ja : user.name_en;
  return user;
};