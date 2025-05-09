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
    shareText: "「Grokの気持ち」で遊んでみました！\n\nお題: {content}\n指定口調: {style}\n\n私の回答が評価されました:\n正確性: {accuracyScore}/50点\n口調: {styleScore}/50点\n総合: {totalScore}/100点\n\n#Grokの気持ち #InGroksMind",
    shareTextCompact: "「Grokの気持ち」で遊んでみました！\n総合スコア: {totalScore}/100点\n#Grokの気持ち #InGroksMind",
    shareTextWithUrl: "「Grokの気持ち」で遊んでみました！\n総合スコア: {totalScore}/100点\n{url}\n#Grokの気持ち #InGroksMind",
    shareUrlNote: "※シェアURLが自動的にコピーされます",
    generatingShareLink: "シェアリンク生成中...",
    generatingImage: "画像生成中...",

    // シェアページ
    loading: "読み込み中...",
    shareError: "エラーが発生しました",
    shareNotFound: "指定されたシェアが見つかりませんでした",
    returnToHomepage: "トップページに戻る",
    sharedResult: "シェア結果",
    sharedResultAlt: "Grokの気持ちの結果",
    tryYourself: "自分も試してみる",
    shareOnX: "結果をXでシェア",
    shareTextFromPage: "「Grokの気持ち」の面白い結果を見つけました！\n#Grokの気持ち #InGroksMind",
    dummyAnswer: "この質問に対する私の回答は...\n\n実際のGrokならこのように答えるでしょう。正確な情報を提供しながらも、指定された口調で回答するよう心がけています。",
    
    // 結果ページ
    resultTitle: "あなたの回答結果",
    resultDescription: "あなたが「{style}」口調で回答した結果です",
    resultScoreTitle: "総合評価",
    resultShare: "この結果をシェアする",
    resultNew: "新しい問題に挑戦する",
    tryGrokYourself: "あなたもGrokになってみる",
    sharedResultView: "シェアされた回答結果",
    
    // ボタン類
    newQuestion: "新しい問題に挑戦する",
    about: "概要",
    twitterLoginButton: "Xでログイン",
    twitterLoginNotImplemented: "Xログイン機能は現在開発中です。Twitter Developer Accountの設定が必要です。",
    save: "保存",
    cancel: "キャンセル",

    // ユーザー名入力
    usernameInputTitle: "ユーザー名を入力",
    usernameInputDescription: "回答時に表示されるユーザー名を入力してください。入力しなくても回答できます。",
    usernameInputLabel: "ユーザー名",
    usernameInputPlaceholder: "username（例: grok_fan）",
    usernameInputSubmit: "設定",

    // アバウトモーダル
    aboutTitle: "Grokの気持ちについて",
    aboutDescription: "「Grokの気持ち」は、あなたがGrok AIになりきって質問に回答するジョークアプリです。実際のGrok AIと同じような口調でどれだけ回答できるか挑戦してみましょう！",
    aboutHowToPlay: "遊び方",
    aboutStep1: "X（旧Twitter）風のタイムラインに表示された質問を確認します。",
    aboutStep2: "指定された口調（シャイ、攻撃的、冷静など）でGrokになりきって回答します。",
    aboutStep3: "回答後、Gemini AIが正確性と口調の再現度を評価します。",
    aboutStep4: "結果をXでシェアして、友達と比較しましょう！",
    aboutTechnology: "使用技術",
    aboutLinks: "リンク",
    aboutGithub: "GitHub",
    aboutBlog: "ブログ",
    aboutX: "X",
    aboutDisclaimer: "このアプリはGrok AIとの公式提携はありません。教育・エンターテイメント目的で作成されました。",
    resultDisclaimer: "※シェアされた結果ページは一時的なものです。アプリの更新やデプロイにより、過去の結果ページにアクセスできなくなる場合があります。重要な結果はスクリーンショットなどで保存することをお勧めします。",
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
    shareText: "I played \"In Grok's Mind\"!\n\nTopic: {content}\nRequested Style: {style}\n\nMy answer was evaluated:\nAccuracy: {accuracyScore}/50 pts\nStyle: {styleScore}/50 pts\nTotal: {totalScore}/100 pts\n\n#InGroksMind #Grokの気持ち",
    shareTextCompact: "I played \"In Grok's Mind\"!\nTotal Score: {totalScore}/100 pts\n#InGroksMind #Grokの気持ち",
    shareTextWithUrl: "I played \"In Grok's Mind\"!\nTotal Score: {totalScore}/100 pts\n{url}\n#InGroksMind #Grokの気持ち",
    shareUrlNote: "※Share URL will be copied automatically",
    generatingShareLink: "Generating share link...",
    generatingImage: "Generating image...",

    // Share page
    loading: "Loading...",
    shareError: "An error occurred",
    shareNotFound: "The requested share was not found",
    returnToHomepage: "Return to homepage",
    sharedResult: "Shared Result",
    sharedResultAlt: "In Grok's Mind result",
    tryYourself: "Try it yourself",
    shareOnX: "Share on X",
    shareTextFromPage: "I found this interesting result from \"In Grok's Mind\"!\n#InGroksMind #Grokの気持ち",
    dummyAnswer: "My answer to this question is...\n\nThis is how the real Grok would answer. I'm trying to provide accurate information while maintaining the specified tone.",
    
    // Result page
    resultTitle: "Your Answer Result",
    resultDescription: "Here's your answer result in \"{style}\" style",
    resultScoreTitle: "Total Score",
    resultShare: "Share this result",
    resultNew: "Try a new question",
    tryGrokYourself: "Try Being Grok Yourself",
    sharedResultView: "Shared Answer Result",
    
    // Buttons
    newQuestion: "Try Another Question",
    about: "About",
    twitterLoginButton: "Login with X",
    twitterLoginNotImplemented: "X login feature is currently under development. Twitter Developer Account setup is required.",
    save: "Save",
    cancel: "Cancel",

    // Username Input
    usernameInputTitle: "Enter Username",
    usernameInputDescription: "Enter a username that will be displayed when you answer. You can answer without entering a username.",
    usernameInputLabel: "Username",
    usernameInputPlaceholder: "username (e.g. grok_fan)",
    usernameInputSubmit: "Set",

    // About Modal
    aboutTitle: "About In Grok's Mind",
    aboutDescription: "\"In Grok's Mind\" is a joke application where you roleplay as Grok AI to answer questions. Challenge yourself to respond in the same style as the real Grok AI!",
    aboutHowToPlay: "How to Play",
    aboutStep1: "Check out the question posted in the X (formerly Twitter) style timeline.",
    aboutStep2: "Respond as if you were Grok AI in the specified tone (shy, aggressive, calm, etc.).",
    aboutStep3: "After submitting, Gemini AI will evaluate your accuracy and style reproduction.",
    aboutStep4: "Share your results on X and compare with friends!",
    aboutTechnology: "Technologies Used",
    aboutLinks: "Links",
    aboutGithub: "GitHub",
    aboutBlog: "Blog",
    aboutX: "X",
    aboutDisclaimer: "This app is not officially affiliated with Grok AI. Created for educational and entertainment purposes.",
    resultDisclaimer: "※Shared result pages are temporary. They may become inaccessible after app updates or redeployments. We recommend saving important results as screenshots.",
  }
};

// クライアントサイド用
export const getTranslation = (): Translation => {
  // サーバーサイドレンダリング時
  if (typeof window === 'undefined') {
    return translations['en']; // デフォルトは英語
  }

  // クライアントサイドでは言語パラメータをチェック
  const urlParams = new URLSearchParams(window.location.search);
  const langParam = urlParams.get('lang');

  if (langParam === 'ja') {
    return translations['ja'];
  } else if (langParam === 'en') {
    return translations['en'];
  }

  // パラメータがない場合はブラウザの言語設定を使用
  try {
    // ブラウザの言語設定を取得
    const userLang = (navigator.language || navigator.userLanguage || '').split('-')[0].toLowerCase(); // 'ja-JP' → 'ja'
    // localStorage に保存されている言語設定を確認
    const savedLang = localStorage.getItem('preferredLanguage');

    // ローカルストレージに保存されている言語を優先
    if (savedLang === 'ja' || savedLang === 'en') {
      return translations[savedLang];
    }

    // ブラウザの言語設定を使用
    return translations[userLang === 'ja' ? 'ja' : 'en'];
  } catch (error) {
    console.error('Error detecting language:', error);
    // エラーが発生した場合はデフォルト言語（日本語）を返す
    return translations['ja'];
  }
};

// サーバーサイドでも実行可能な言語取得関数
export const getTranslationForLocale = (locale: string): Translation => {
  return translations[locale === 'ja' ? 'ja' : 'en'];
};

export default getTranslation;