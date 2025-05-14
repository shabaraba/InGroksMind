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
    avatar: "#4ade80", // 緑色
  },
  {
    id: 2,
    name_ja: "ファクトチェッカー",
    name_en: "Fact Checker",
    username: "fact_checker",
    avatar: "#60a5fa", // 青色
  },
  {
    id: 3,
    name_ja: "歴史オタク",
    name_en: "History Buff",
    username: "history_buff",
    avatar: "#f97316", // オレンジ色
  },
  {
    id: 4,
    name_ja: "雑学マニア",
    name_en: "Trivia Master",
    username: "trivia_master",
    avatar: "#8b5cf6", // 紫色
  },
  {
    id: 5,
    name_ja: "リサーチャー",
    name_en: "Deep Researcher",
    username: "deep_researcher",
    avatar: "#ec4899", // ピンク色
  },
  {
    id: 6,
    name_ja: "理系オタク",
    name_en: "Science Nerd",
    username: "lab_rat42",
    avatar: "#ef4444", // 赤色
  },
  {
    id: 7,
    name_ja: "ガジェット狂",
    name_en: "Gadget Junkie",
    username: "tech_addict",
    avatar: "#10b981", // ターコイズ色
  },
  {
    id: 8,
    name_ja: "本の虫",
    name_en: "Bookworm",
    username: "page_turner",
    avatar: "#f59e0b", // 琥珀色
  },
  {
    id: 9,
    name_ja: "夜更かし思想家",
    name_en: "Midnight Philosopher",
    username: "deep_thoughts_at_2am",
    avatar: "#3b82f6", // 青色
  },
  {
    id: 10,
    name_ja: "数字マニア",
    name_en: "Number Cruncher",
    username: "stats_geek",
    avatar: "#6366f1", // インディゴ色
  },
  {
    id: 11,
    name_ja: "ツッコミ王",
    name_en: "Professional Skeptic",
    username: "but_actually",
    avatar: "#a855f7", // 紫色
  },
  {
    id: 12,
    name_ja: "美術館スナイパー",
    name_en: "Museum Lurker",
    username: "secretly_touches_paintings",
    avatar: "#ec4899", // ピンク色
  },
  {
    id: 13,
    name_ja: "異文化ハンター",
    name_en: "Culture Vulture",
    username: "travels_for_food",
    avatar: "#14b8a6", // ティール色
  },
  {
    id: 14,
    name_ja: "財布の紐固め屋",
    name_en: "Penny Pincher",
    username: "stonks_only_go_up",
    avatar: "#f97316", // オレンジ色
  },
  {
    id: 15,
    name_ja: "エコ戦士",
    name_en: "Tree Hugger",
    username: "recycles_aggressively",
    avatar: "#84cc16", // ライム色
  },
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
  name: "Grok",
};

// isJapaneseに基づいてGrokユーザーの名前を設定
export const getGrokUser = (isJapanese: boolean = true): VirtualUser => {
  const user = { ...grokUser };
  user.name = isJapanese ? user.name_ja : user.name_en;
  return user;
};

