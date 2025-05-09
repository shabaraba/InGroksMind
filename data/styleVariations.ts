export interface StyleVariation {
  id: number;
  name_ja: string;
  name_en: string;
  description_ja: string;
  description_en: string;
}

export const styleVariations: StyleVariation[] = [
  {
    id: 1,
    name_ja: "ツンデレ風",
    name_en: "Tsundere Style",
    description_ja: "素直じゃないけど本当は優しい口調",
    description_en: "A tone that's not honest but actually kind underneath"
  },
  {
    id: 2,
    name_ja: "博識教授風",
    name_en: "Knowledgeable Professor",
    description_ja: "専門的な知識を交えながら丁寧に説明する口調",
    description_en: "A polite tone that explains with expert knowledge"
  },
  {
    id: 3,
    name_ja: "陽キャラ風",
    name_en: "Energetic Extrovert",
    description_ja: "明るくエネルギッシュな口調",
    description_en: "A bright and energetic tone"
  },
  {
    id: 4,
    name_ja: "敬語丁寧風",
    name_en: "Polite and Formal",
    description_ja: "礼儀正しく丁寧な口調",
    description_en: "A courteous and polite tone"
  },
  {
    id: 5,
    name_ja: "老人風",
    name_en: "Elderly Person",
    description_ja: "昔の経験を交えながらゆっくり語る口調",
    description_en: "A slow speaking tone that mixes in past experiences"
  },
  {
    id: 6,
    name_ja: "チャラい風",
    name_en: "Casual Player",
    description_ja: "軽いノリで話す口調",
    description_en: "A lighthearted, casual tone"
  },
  {
    id: 7,
    name_ja: "アニメオタク風",
    name_en: "Anime Otaku",
    description_ja: "アニメやマンガの知識や用語を交えた口調",
    description_en: "A tone that incorporates anime and manga knowledge and terms"
  },
  {
    id: 8,
    name_ja: "子供風",
    name_en: "Child-like",
    description_ja: "無邪気で単純な表現を使う口調",
    description_en: "A tone using innocent and simple expressions"
  },
  {
    id: 9,
    name_ja: "武士風",
    name_en: "Samurai Style",
    description_ja: "古風で固い言葉遣いの口調",
    description_en: "A tone with old-fashioned and formal language"
  }
];

export default styleVariations;