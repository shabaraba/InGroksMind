interface Translation {
  [key: string]: string;
}

interface Translations {
  [locale: string]: Translation;
}

export const translations: Translations = {
  ja: {
    // アプリ全般
    appTitle: "Grokの気持ち",
    appDescription: "Grokになりきって、お題の真偽を判定しよう！指定された口調で回答するとGeminiがスコアを評価します。",
    appSubtitle: "X風タイムライン",
    footer: "© from-garage 2025 All Rights Reserved.",
    footerDisclaimer: "このアプリはGrok AIとの公式提携はありません。教育・エンターテイメント目的で作成されました。",
    
    // 投稿・リプライ
    today: "今日",
    justNow: "たった今",
    userName: "ユーザー",
    factCheckRequest: "ファクトチェックお願い。{style}で回答して",
    yourAnswer: "あなたのGrok回答",
    
    // フォーム
    placeholderAnswer: "Grokになりきって回答してみよう...",
    buttonSubmit: "Grokとして回答する",
    buttonEvaluating: "評価中...",
    
    // 評価表示
    evaluationTitle: "Geminiの評価",
    accuracy: "正確性",
    styleReproduction: "口調の再現度",
    totalScore: "総合評価",
    points: "{score}/50点",
    totalPoints: "{score}/100点",
    
    // シェア
    shareButton: "結果をXでシェアする",
    shareText: "「Grokの気持ち」で遊んでみました！\n\nお題: {content}\n指定口調: {style}\n\n私の回答が評価されました:\n正確性: {accuracyScore}/50点\n口調: {styleScore}/50点\n総合: {totalScore}/100点\n\n#BeGrok #Grokの気持ち",
    shareTextCompact: "「Grokの気持ち」で遊んでみました！\n総合スコア: {totalScore}/100点\n#BeGrok #Grokの気持ち",
    imageDownloadNote: "※結果画像が自動的にダウンロードされます",
    generatingImage: "画像生成中...",
    
    // ボタン類
    newQuestion: "新しい問題に挑戦する",
    about: "概要",

    // アバウトモーダル
    aboutTitle: "Grokの気持ちについて",
    aboutDescription: "「Grokの気持ち」は、あなたがGrok AIになりきって質問に回答するジョークアプリです。実際のGrok AIと同じような口調でどれだけ回答できるか挑戦してみましょう！",
    aboutHowToPlay: "遊び方",
    aboutStep1: "X（旧Twitter）風のタイムラインに表示された質問を確認します。",
    aboutStep2: "指定された口調（シャイ、攻撃的、冷静など）でGrokになりきって回答します。",
    aboutStep3: "回答後、Gemini AIが正確性と口調の再現度を評価します。",
    aboutStep4: "結果をXでシェアして、友達と比較しましょう！",
    aboutTechnology: "使用技術",
    aboutDisclaimer: "このアプリはGrok AIとの公式提携はありません。教育・エンターテイメント目的で作成されました。",
  },

  en: {
    // App general
    appTitle: "In Grok's Mind",
    appDescription: "Think like Grok and judge the truthfulness of topics! Gemini AI will evaluate your answer based on accuracy and specified tone.",
    appSubtitle: "X-style Timeline",
    footer: "© from-garage 2025 All Rights Reserved.",
    footerDisclaimer: "This app is not officially affiliated with Grok AI. Created for educational and entertainment purposes.",
    
    // Posts & replies
    today: "Today",
    justNow: "Just now",
    userName: "User",
    factCheckRequest: "Fact check please. Answer in {style} style",
    yourAnswer: "Your Grok Answer",
    
    // Form
    placeholderAnswer: "Answer as if you were Grok...",
    buttonSubmit: "Answer as Grok",
    buttonEvaluating: "Evaluating...",
    
    // Evaluation display
    evaluationTitle: "Gemini's Evaluation",
    accuracy: "Accuracy",
    styleReproduction: "Style Reproduction",
    totalScore: "Total Score",
    points: "{score}/50 pts",
    totalPoints: "{score}/100 pts",
    
    // Share
    shareButton: "Share Results on X",
    shareText: "I played \"In Grok's Mind\"!\n\nTopic: {content}\nRequested Style: {style}\n\nMy answer was evaluated:\nAccuracy: {accuracyScore}/50 pts\nStyle: {styleScore}/50 pts\nTotal: {totalScore}/100 pts\n\n#BeGrok #InGroksMind",
    shareTextCompact: "I played \"In Grok's Mind\"!\nTotal Score: {totalScore}/100 pts\n#BeGrok #InGroksMind",
    imageDownloadNote: "※Result image will be automatically downloaded",
    generatingImage: "Generating image...",
    
    // Buttons
    newQuestion: "Try Another Question",
    about: "About",

    // About Modal
    aboutTitle: "About In Grok's Mind",
    aboutDescription: "\"In Grok's Mind\" is a joke application where you roleplay as Grok AI to answer questions. Challenge yourself to respond in the same style as the real Grok AI!",
    aboutHowToPlay: "How to Play",
    aboutStep1: "Check out the question posted in the X (formerly Twitter) style timeline.",
    aboutStep2: "Respond as if you were Grok AI in the specified tone (shy, aggressive, calm, etc.).",
    aboutStep3: "After submitting, Gemini AI will evaluate your accuracy and style reproduction.",
    aboutStep4: "Share your results on X and compare with friends!",
    aboutTechnology: "Technologies Used",
    aboutDisclaimer: "This app is not officially affiliated with Grok AI. Created for educational and entertainment purposes.",
  }
};

// ブラウザの言語設定に基づいて適切な翻訳を選択する
export const getTranslation = (): Translation => {
  const userLang = navigator.language.split('-')[0]; // 'ja-JP' → 'ja'
  return translations[userLang === 'ja' ? 'ja' : 'en'];
};

export default getTranslation;