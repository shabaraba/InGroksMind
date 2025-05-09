export interface VirtualUser {
  id: number;
  name_ja: string;
  name_en: string;
  username: string;
  avatarInitial: string;
  avatarColor: string;
}

export const virtualUsers: VirtualUser[] = [
  {
    id: 1,
    name_ja: "ザキヤマ",
    name_en: "Zakiyama",
    username: "zakiyama_ai",
    avatarInitial: "Z",
    avatarColor: "bg-indigo-600"
  },
  {
    id: 2,
    name_ja: "テック博士",
    name_en: "Dr. Tech",
    username: "tech_hakase",
    avatarInitial: "T",
    avatarColor: "bg-green-600"
  },
  {
    id: 3,
    name_ja: "ミソラ",
    name_en: "Misora",
    username: "misora_facts",
    avatarInitial: "M",
    avatarColor: "bg-pink-600"
  },
  {
    id: 4,
    name_ja: "ハカセ・ボット",
    name_en: "ProfBot",
    username: "hakase_bot",
    avatarInitial: "P",
    avatarColor: "bg-yellow-600"
  },
  {
    id: 5,
    name_ja: "トリビアン",
    name_en: "Trivian",
    username: "trivia_master",
    avatarInitial: "T",
    avatarColor: "bg-blue-600"
  },
  {
    id: 6,
    name_ja: "歴ヒストリア",
    name_en: "Historian",
    username: "historia_jpn",
    avatarInitial: "H",
    avatarColor: "bg-red-600"
  },
  {
    id: 7,
    name_ja: "クイズ星人",
    name_en: "QuizAlien",
    username: "quiz_seijin",
    avatarInitial: "Q",
    avatarColor: "bg-purple-600"
  },
  {
    id: 8,
    name_ja: "雑学王",
    name_en: "TriviaKing",
    username: "zatugaku_king",
    avatarInitial: "T",
    avatarColor: "bg-teal-600"
  }
];

export default virtualUsers;