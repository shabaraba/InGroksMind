import React, { useContext, useEffect, useState } from 'react';
import { GetServerSideProps, NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { quizData } from '../../data/quizData';
import { styleVariations } from '../../data/styleVariations';
import { getTranslationForLocale } from '../../i18n/translations';
import { decodeResultId } from '../../utils/geminiService';
import { generateOgImageUrl, generateResultUrl, generateShareText } from '../../utils/imageUtils';
import { FeedbackData, ResultPageParams, GeminiAnswer } from '../../utils/types';
import { expandUrlParams } from '../../utils/urlShortener';
import { LanguageContext } from '../_app';
import { getRandomUser, getGrokUser, virtualUsers, VirtualUser } from '../../data/virtualUsers';
import Post from '../../components/Post';
import ReplyRequest from '../../components/ReplyRequest';
import LanguageSwitcher from '../../components/LanguageSwitcher';
import AboutModal from '../../components/AboutModal';
import PostInteractions from '../../components/PostInteractions';
import GeminiAnswerDisplay from '../../components/GeminiAnswerDisplay';
import * as ga from '../../utils/analytics';

// 結果ページのプロパティ
interface ResultPageProps {
  resultId: string;
  quizId: number;
  styleId: number;
  score: number;
  userAnswer: string;
  locale: string;
  ogImageUrl: string;
  resultUrl: string;
  shareText: string;
  isSharedView: boolean; // シェアから訪問したかどうかのフラグ
  initialGeminiAnswer?: GeminiAnswer; // Gemini回答の初期値
}

// Geminiのリプライコンポーネント
const GeminiFeedback: React.FC<{feedback: FeedbackData, t: any, isJapanese: boolean, resultId: string}> = ({ feedback, t, isJapanese, resultId }) => {
  // スコアに応じたカラークラスを取得
  const getScoreClass = (score: number, max: number = 50) => {
    const percentage = (score / max) * 100;
    if (percentage >= 80) return 'score-high';
    if (percentage >= 60) return 'score-medium';
    return 'score-low';
  };

  // Geminiのアバターと情報
  const geminiAvatar = "#EA4335"; // Google Redを使用
  const geminiName = "Gemini";
  const geminiUsername = "gemini";

  return (
    <div className="p-4 pl-12 border-b border-gray-700">
      <div className="flex items-start">
        <div
          className="mr-3 flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-white text-lg font-bold"
          style={{ backgroundColor: geminiAvatar }}
        >
          G
        </div>
        <div className="flex-grow">
          <div className="flex items-start mb-2">
            <div>
              <h3 className="font-bold text-white">{geminiName}</h3>
              <p className="text-gray-400 text-sm">@{geminiUsername} · {t.justNow}</p>
            </div>
          </div>

          <p className="text-gray-400 text-sm mb-2">
            {isJapanese ? '返信先:' : 'Replying to:'} <span className="text-twitter-blue">@grok</span>
          </p>

          <div className="text-white whitespace-pre-wrap mb-4">
            {t.evaluationTitle}
          </div>

          <div className="space-y-4">
            {/* 正確性スコア */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-white">{t.accuracy}</span>
                <span className={`score-badge ${getScoreClass(feedback.accuracy_score)}`}>
                  {t.points.replace('{score}', feedback.accuracy_score.toString())}
                </span>
              </div>
              <p className="text-gray-300 text-sm">{feedback.accuracy_comment}</p>
            </div>

            {/* 口調スコア */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-white">{t.styleReproduction}</span>
                <span className={`score-badge ${getScoreClass(feedback.style_score)}`}>
                  {t.points.replace('{score}', feedback.style_score.toString())}
                </span>
              </div>
              <p className="text-gray-300 text-sm">{feedback.style_comment}</p>
            </div>

            {/* 総合評価 */}
            <div className="pt-4 border-t border-gray-700">
              <div className="flex justify-between items-center mb-2">
                <span className="text-white font-bold">{t.totalScore}</span>
                <span className={`score-badge ${getScoreClass(feedback.total_score, 100)}`}>
                  {t.totalPoints.replace('{score}', feedback.total_score.toString())}
                </span>
              </div>
              <p className="text-gray-300">{feedback.overall_comment}</p>
            </div>

            {/* インタラクションボタン - 結果IDと投稿IDをシードとして使用 */}
            <PostInteractions seed={`gemini-${resultId}`} />
          </div>
        </div>
      </div>
    </div>
  );
};

// 結果ページコンポーネント
const ResultPage: NextPage<ResultPageProps> = ({
  resultId,
  quizId,
  styleId,
  score,
  userAnswer,
  locale,
  ogImageUrl,
  resultUrl,
  shareText,
  isSharedView,
  initialGeminiAnswer
}) => {
  const router = useRouter();
  const { isJapanese, setLanguage } = useContext(LanguageContext);
  const [t, setT] = useState(getTranslationForLocale(locale));
  const [isAboutOpen, setIsAboutOpen] = useState(false);

  // propsから受け取った言語設定を初期レンダリング時のみ適用
  // useEffect内で使用して再レンダリング時に上書きされないようにする
  const isFirstRender = React.useRef(true);
  useEffect(() => {
    // 初回レンダリング時のみ言語設定を適用
    if (isFirstRender.current) {
      isFirstRender.current = false;

      // locale（サーバーサイドから渡された値）が存在する場合、それを優先する
      if (locale === 'ja' || locale === 'en') {
        console.log('Setting initial language from props:', locale);
        setLanguage(locale);
      }
    }
  }, [locale, setLanguage]);

  // 言語が変更されたときに翻訳も更新
  useEffect(() => {
    setT(getTranslationForLocale(isJapanese ? 'ja' : 'en'));
  }, [isJapanese]);
  
  // クイズとスタイルの情報を取得
  const quiz = quizData.find(q => q.id === quizId) || quizData[0];
  const style = styleVariations.find(s => s.id === styleId) || styleVariations[0];
  
  // 言語に応じたコンテンツを取得（コンテキストの言語状態を優先）
  const [content, setContent] = useState('');
  const [styleName, setStyleName] = useState('');

  // 言語が変更されたときにコンテンツを更新
  useEffect(() => {
    setContent(isJapanese ? quiz.content_ja : quiz.content_en);
    setStyleName(isJapanese ? style.name_ja : style.name_en);
  }, [isJapanese, quiz, style]);
  
  // ページタイトル（言語変更時と表示モードで更新）
  const [pageTitle, setPageTitle] = useState('');

  useEffect(() => {
    if (isSharedView) {
      // シェアビュー用のタイトル
      setPageTitle(`${t.appTitle} - ${t.sharedResultView} (${score}/100)`);
    } else {
      // 通常の結果ページタイトル
      setPageTitle(`${t.appTitle} - ${t.resultTitle} (${score}/100)`);
    }
    // t全体を依存配列に入れれば十分。t.appTitleなどは個別に指定する必要はない
  }, [t, score, isSharedView]);
  
  // クエリパラメータからユーザーIDを取得
  const quizUserId = router.query.quizUserId ? parseInt(router.query.quizUserId as string, 10) : 0;
  const replyUserId = router.query.replyUserId ? parseInt(router.query.replyUserId as string, 10) : 0;

  // 文字列のハッシュ関数（ユーザー選択の一貫性のため）
  const hashString = (str: string): number => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
  };

  // ユーザーが指定されていない場合は、必ず別々のユーザーを選択する
  const selectDistinctUsers = () => {
    // ユーザーIDのペアを作成（必ず異なるIDのペア）
    const pairs = [
      [1, 2], // IDが1と2のユーザー
      [2, 3], // IDが2と3のユーザー
      [3, 4], // IDが3と4のユーザー
      [4, 5], // IDが4と5のユーザー
      [5, 1]  // IDが5と1のユーザー
    ];

    // resultIdを使って決定的に組み合わせを選択（常に同じページなら同じユーザー）
    const pairIndex = Math.abs(hashString(resultId)) % pairs.length;
    const selectedPair = pairs[pairIndex];

    // 選択したペアのIDに対応するユーザーを取得
    const user1 = { ...virtualUsers.find(user => user.id === selectedPair[0])! };
    const user2 = { ...virtualUsers.find(user => user.id === selectedPair[1])! };

    // 言語に合わせて名前を設定
    user1.name = isJapanese ? user1.name_ja : user1.name_en;
    user2.name = isJapanese ? user2.name_ja : user2.name_en;

    return [user1, user2];
  };

  // 指定されたIDのユーザーを取得、またはランダムに選択
  const getSpecificUser = (userId: number, defaultUser: VirtualUser): VirtualUser => {
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

  // 結果IDからユーザーIDを決定的に生成（リロードしても同じキャラクターになるように）
  const generateConsistentUserIds = () => {
    // resultIdとquizIdを使って決定的にユーザーIDを生成

    // ユーザーIDのペアを作成（必ず異なるIDのペア）
    const pairs = [
      [1, 2], // IDが1と2のユーザー
      [2, 3], // IDが2と3のユーザー
      [3, 4], // IDが3と4のユーザー
      [4, 5], // IDが4と5のユーザー
      [5, 1]  // IDが5と1のユーザー
    ];

    // resultIdを使って決定的に組み合わせを選択（常に同じページなら同じユーザー）
    const hash = hashString(resultId + quizId.toString());
    const pairIndex = hash % pairs.length;
    const selectedPair = pairs[pairIndex];

    // 選択したペアのIDを返す（必ず異なるユーザーIDになる）
    return selectedPair;
  };

  // ユーザーIDの取得（URLパラメータがあればそれを優先、なければ決定的に生成）
  const resolveUserIds = () => {
    if (quizUserId > 0 && replyUserId > 0 && quizUserId !== replyUserId) {
      // URLパラメータ経由で渡されたIDがあり、かつ重複していない場合
      return [quizUserId, replyUserId];
    } else {
      // それ以外の場合は決定的に生成されたペアを使用
      return generateConsistentUserIds();
    }
  };

  // 決定的なユーザーID
  const [fixedQuizUserId, fixedReplyUserId] = resolveUserIds();

  // キャラクターの初期化
  const initializeUsers = () => {
    // 固定のIDを使用して、常に同じキャラクターを取得
    return [
      getSpecificUser(fixedQuizUserId, getRandomUser(isJapanese)),
      getSpecificUser(fixedReplyUserId, getRandomUser(isJapanese))
    ];
  };

  // 初期ユーザー設定を取得
  const initialUsers = initializeUsers();

  // 仮想ユーザー（言語に応じて表示を変更）
  const [quizUser, setQuizUser] = useState(initialUsers[0]);
  const [replyUser, setReplyUser] = useState(initialUsers[1]);
  const [currentGrokUser, setCurrentGrokUser] = useState(getGrokUser(isJapanese));

  // 言語が変更されたときにユーザー名を更新
  useEffect(() => {
    // 各ユーザーの名前を現在の言語に合わせて更新
    const updateUserLanguage = (user: VirtualUser) => {
      if (!user) return user;

      const matchingUser = virtualUsers.find(u => u.id === user.id);
      if (matchingUser) {
        return {
          ...user,
          name: isJapanese ? matchingUser.name_ja : matchingUser.name_en
        };
      }
      return user;
    };

    // 現在のユーザーを保持しつつ、名前だけ言語に合わせて更新
    // quizUserとreplyUserの参照は変えずにコピーして名前だけ更新
    setQuizUser(prevUser => {
      if (!prevUser) return prevUser;
      const matchingUser = virtualUsers.find(u => u.id === prevUser.id);
      if (matchingUser) {
        return {
          ...prevUser,
          name: isJapanese ? matchingUser.name_ja : matchingUser.name_en
        };
      }
      return prevUser;
    });

    setReplyUser(prevUser => {
      if (!prevUser) return prevUser;
      const matchingUser = virtualUsers.find(u => u.id === prevUser.id);
      if (matchingUser) {
        return {
          ...prevUser,
          name: isJapanese ? matchingUser.name_ja : matchingUser.name_en
        };
      }
      return prevUser;
    });

    // GrokユーザーのLanguage設定の更新
    setCurrentGrokUser(getGrokUser(isJapanese));
    // quizUserとreplyUserは依存配列から除外し、isJapaneseのみを依存配列に含める
  }, [isJapanese]);
  
  // 評価結果データをuseMemoで構築（言語変更時に再計算される）
  const feedback = React.useMemo<FeedbackData>(() => {
    const accuracyScore = Math.floor(score / 2);
    const styleScore = score - accuracyScore;
    const locale = isJapanese ? 'ja' : 'en';
    const currentContent = isJapanese ? quiz.content_ja : quiz.content_en;
    const currentStyleName = isJapanese ? style.name_ja : style.name_en;
    
    // Gemini回答の言語に応じた更新
    let geminiAnswer = initialGeminiAnswer;
    if (initialGeminiAnswer) {
      // モックデータや説明文の場合は言語に応じて内容を更新
      if (initialGeminiAnswer.content.includes('※') || 
          initialGeminiAnswer.content.includes('model answer')) {
        geminiAnswer = {
          ...initialGeminiAnswer,
          content: isJapanese 
            ? `これはGeminiの模範解答です。${currentContent}について、${currentStyleName}の口調でお答えします。このお題についての正確な情報をご提供します。`
            : `This is a model answer from Gemini. I'll answer about ${currentContent} in the style of ${currentStyleName}. Let me provide you with accurate information about this topic.`
        };
      }
    }
    
    return {
      accuracy_score: accuracyScore,
      accuracy_comment: getAccuracyComment(accuracyScore, locale),
      style_score: styleScore,
      style_comment: getStyleComment(styleScore, currentStyleName, locale),
      total_score: score,
      overall_comment: getOverallComment(score, locale),
      gemini_answer: geminiAnswer // 言語に合わせて更新したGemini回答
    };
  }, [isJapanese, score, style, quiz, initialGeminiAnswer]);

  // 言語に応じたフィードバック生成関数（geminiService.tsから抜粋）
  const getAccuracyComment = (score: number, locale: string = 'ja'): string => {
    if (locale === 'ja') {
      if (score >= 40) {
        return "非常に正確な情報提供です。事実に基づいた回答が的確にできています。";
      } else if (score >= 30) {
        return "おおむね正確な情報ですが、一部に不正確または不足している部分があります。";
      } else if (score >= 20) {
        return "基本的な事実は含まれていますが、誤解を招く情報や誤りが複数見られます。";
      } else {
        return "情報の正確性に問題があります。事実確認が必要な部分が多いです。";
      }
    } else {
      // 英語のコメント
      if (score >= 40) {
        return "Highly accurate information. Your answer is precisely based on facts.";
      } else if (score >= 30) {
        return "Mostly accurate information, but there are some inaccuracies or missing parts.";
      } else if (score >= 20) {
        return "Basic facts are included, but there are several misleading or incorrect points.";
      } else {
        return "The information has accuracy issues. Many parts need fact-checking.";
      }
    }
  };

  const getStyleComment = (score: number, styleName: string, locale: string = 'ja'): string => {
    if (locale === 'ja') {
      if (score >= 40) {
        return `「${styleName}」の特徴を非常によく捉えています。口調、言い回し、表現方法が見事に再現されています。`;
      } else if (score >= 30) {
        return `「${styleName}」の基本的な特徴は表現できていますが、より特徴的な言い回しを増やすとさらに良くなります。`;
      } else if (score >= 20) {
        return `「${styleName}」の要素が部分的に見られますが、一貫性に欠ける点があります。`;
      } else {
        return `「${styleName}」の特徴をもっと理解し、それに合った表現を意識してみましょう。`;
      }
    } else {
      // 英語のコメント
      if (score >= 40) {
        return `You've captured the characteristics of "${styleName}" style very well. The tone, expressions, and phrasing are excellently reproduced.`;
      } else if (score >= 30) {
        return `You've expressed the basic features of "${styleName}" style, but it could be improved by adding more characteristic expressions.`;
      } else if (score >= 20) {
        return `Elements of "${styleName}" style are partially visible, but there's a lack of consistency.`;
      } else {
        return `Try to better understand the features of "${styleName}" style and focus on appropriate expressions.`;
      }
    }
  };

  const getOverallComment = (totalScore: number, locale: string = 'ja'): string => {
    if (locale === 'ja') {
      if (totalScore >= 90) {
        return "素晴らしい回答です！事実も正確で、指定された口調も完璧に再現されています。Grokのようなレスポンスができています！";
      } else if (totalScore >= 70) {
        return "良い回答です。事実確認と口調の両方でバランスの取れた回答になっています。";
      } else if (totalScore >= 50) {
        return "まずまずの回答です。事実の正確性か口調の再現度、どちらかを改善するとより良くなるでしょう。";
      } else {
        return "回答には改善の余地があります。事実確認をしっかり行い、指定された口調の特徴をよく理解すると良いでしょう。";
      }
    } else {
      // 英語のコメント
      if (totalScore >= 90) {
        return "Excellent answer! The facts are accurate and the requested style is perfectly reproduced. You've responded just like Grok would!";
      } else if (totalScore >= 70) {
        return "Good answer. You've achieved a good balance between factual accuracy and the specified tone.";
      } else if (totalScore >= 50) {
        return "Decent answer. Improvement in either factual accuracy or style reproduction would make it better.";
      } else {
        return "Your answer has room for improvement. Thorough fact-checking and better understanding of the specified style would help.";
      }
    }
  };
  
  // Xでシェアする
  const handleShare = () => {
    // Google Analyticsのイベント送信
    ga.trackShareResult(score, 'twitter');

    const twitterShareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
    window.open(twitterShareUrl, '_blank');
  };
  
  // URLをコピーする関数は不要になりました
  
  return (
    <div className="min-h-screen bg-twitter-dark">
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={`${content} - ${isSharedView ? t.sharedResultView : t.resultTitle}: ${score}/100`} />

        {/* OGP メタタグ */}
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={isSharedView
          ? `${content} - ${styleName} スタイルでの回答 (${score}/100)`
          : `${content} - ${styleName} (${score}/100)`} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={resultUrl} />
        <meta property="og:image" content={ogImageUrl} />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={`${content} - ${styleName} (${score}/100)`} />
        <meta name="twitter:image" content={ogImageUrl} />
      </Head>

      <header className="bg-black/80 backdrop-blur-md p-4 border-b border-gray-700 sticky top-0 z-10">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">
            <Link href="/" className="text-white hover:text-gray-200 transition-colors">
              {t.appTitle}
            </Link>
          </h1>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsAboutOpen(true)}
              className="text-gray-300 hover:text-white transition-colors"
            >
              {t.about}
            </button>
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      <main className="container mx-auto py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-6">
            {isSharedView ? t.sharedResultView : t.resultTitle}
          </h2>

          <div className="bg-twitter-darker rounded-lg border border-gray-700 overflow-hidden mb-8">
            {/* 元の投稿 - 結果IDとクイズIDを使って固定のシード値を設定 */}
            <Post
              user={quizUser}
              content={content}
              postId={`quiz-${resultId}-${quizId}`}
            />
            
            {/* Grokへのリプライリクエスト - 結果IDとスタイルIDで固定シード値を設定 */}
            <ReplyRequest
              user={replyUser}
              originalUser={quizUser}
              style={style}
              isJapanese={locale === 'ja'}
              customSeed={`reply-${resultId}-${styleId}`}
            />
            
            {/* Grokの回答 */}
            <div className="p-4 pl-12 border-b border-gray-700">
              <div className="flex items-start">
                <div
                  className="mr-3 flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-white text-lg font-bold"
                  style={{ backgroundColor: currentGrokUser.avatar }}
                >
                  {currentGrokUser.name?.charAt(0) || currentGrokUser.name_ja?.charAt(0) || currentGrokUser.name_en?.charAt(0) || currentGrokUser.username.charAt(0) || 'G'}
                </div>
                <div className="flex-grow">
                  <div className="flex items-start mb-2">
                    <div>
                      <h3 className="font-bold text-white">{currentGrokUser.name || currentGrokUser.name_ja || currentGrokUser.name_en || 'Grok'}</h3>
                      <p className="text-gray-400 text-sm">@{currentGrokUser.username} · {t.justNow}</p>
                    </div>
                  </div>
                  
                  <p className="text-gray-400 text-sm mb-2">
                    {isJapanese ? '返信先:' : 'Replying to:'} <span className="text-twitter-blue">@{replyUser.username}</span>
                  </p>
                  
                  <div className="text-white whitespace-pre-wrap">
                    {userAnswer}
                  </div>

                  {/* インタラクションボタン - 結果IDをシードとして使用 */}
                  <PostInteractions seed={`grok-${resultId}`} />

                </div>
              </div>
            </div>

            {/* Geminiの回答表示（もしgemini_answerが存在する場合） */}
            {feedback.gemini_answer && (
              <GeminiAnswerDisplay
                geminiAnswer={feedback.gemini_answer}
                resultId={resultId}
                locale={isJapanese ? 'ja' : 'en'}
                t={t}
              />
            )}
            {/* Gemini回答がない場合はデバッグメッセージを表示（開発用） */}
            {process.env.NODE_ENV === 'development' && !feedback.gemini_answer && (
              <div className="p-4 bg-red-100 text-red-800 border border-red-200 rounded-md mt-2 mb-2">
                <p>Debug: Gemini回答が取得できませんでした。</p>
              </div>
            )}

            {/* Geminiの評価（別ポストとして表示） */}
            <GeminiFeedback feedback={feedback} t={t} isJapanese={isJapanese} resultId={resultId} />
          </div>

          {/* シェアボタン */}
          <div className="flex flex-col md:flex-row justify-center gap-4 mt-8">
            {/* シェアされたビューでは「結果をシェア」ボタンを表示しない */}
            {!isSharedView && (
              <button
                onClick={handleShare}
                className="btn-primary flex items-center justify-center"
              >
                {t.shareOnX}
              </button>
            )}

            <button
              onClick={() => router.push('/?lang=' + (isJapanese ? 'ja' : 'en'))}
              className={isSharedView ? "btn-primary" : "btn-secondary"}
            >
              {isSharedView ? t.tryGrokYourself : t.newQuestion}
            </button>
          </div>

          {/* 結果ページの一時的な性質についての警告 */}
          {isSharedView && (
            <div className="mt-10 p-4 border border-amber-500/30 bg-amber-500/10 rounded-lg text-sm text-amber-500">
              <p>{t.resultDisclaimer}</p>
            </div>
          )}
        </div>
      </main>

      <footer className="bg-black py-6 mt-12">
        <div className="container mx-auto px-4 text-center text-gray-500">
          <p>{t.footer}</p>
          <p className="mt-2 text-sm">
            {t.footerDisclaimer}
          </p>
        </div>
      </footer>

      {/* About Modal */}
      <AboutModal
        isOpen={isAboutOpen}
        onClose={() => setIsAboutOpen(false)}
      />
    </div>
  );
};

// サーバーサイドのデータ取得
export const getServerSideProps: GetServerSideProps<ResultPageProps, ResultPageParams> = async (context) => {
  // IDを取得
  const { id } = context.params || {};
  if (!id) {
    return { notFound: true };
  }

  // 圧縮されたクエリパラメータがあるか確認
  const compressedData = context.query.c as string;
  let params = new URLSearchParams();

  if (compressedData) {
    // 圧縮データがある場合は展開
    params = expandUrlParams(compressedData);
    // クエリパラメータをcontextに戻す
    // for...ofの代わりにforEachを使用
    params.forEach((value, key) => {
      context.query[key] = value;
    });
  }

  // ユーザーの回答を取得
  const userAnswer = context.query.answer as string || "この質問に対する私の回答です...";

  // Gemini回答フラグの確認
  const hasGemini = context.query.has_gemini === '1';

  // Gemini回答データがあれば格納（将来的な実装のため）
  const geminiAnswerContent = context.query.gemini_answer as string;

  // デバッグ用コンソール出力
  console.log('Has Gemini flag:', hasGemini, 'Query params:', context.query);

  try {
    // IDからクイズID, スタイルID, スコアを抽出
    const resultData = decodeResultId(id);
    if (!resultData) {
      return { notFound: true };
    }

    const { quizId, styleId, score } = resultData;
    
    // クイズとスタイルが存在するか確認
    const quiz = quizData.find(q => q.id === quizId);
    const style = styleVariations.find(s => s.id === styleId);
    
    if (!quiz || !style) {
      return { notFound: true };
    }
    
    // ロケール取得 - URLパラメータを最優先
    // シェアURLに含まれた言語パラメータを最優先で使用
    const langParam = context.query.lang as string;
    const locale = langParam === 'ja' ? 'ja' : (langParam === 'en' ? 'en' : (context.locale || 'en'));
    
    // ホスト名取得
    const host = context.req.headers.host || 'localhost:3000';
    
    // OG画像URL生成
    const ogImageUrl = generateOgImageUrl(quizId, styleId, score, locale, host);
    
    // 結果ページURL生成（パラメータを含める）
    const resultUrl = generateResultUrl(
      id,
      host,
      userAnswer,
      locale,
      context.query.quizUserId as string,
      context.query.replyUserId as string
    );
    
    // シェアテキスト生成
    const shareText = generateShareText(quiz, style, score, locale, resultUrl);
    
    // シェアからの訪問かどうかを判定
    // リファラーヘッダーを使用して判定（自分のドメイン以外からの訪問はシェアとみなす）
    // もしくは、direct=1パラメータがない場合（シェアURLには付与しない）はシェア訪問とみなす
    const referer = context.req.headers.referer || '';
    const host_parts = host.split(':')[0]; // ポート番号を除去
    const isDirect = context.query.direct === '1';
    const isFromSameOrigin = referer.includes(host_parts);

    // 1. 直接アクセスフラグがある場合はシェアビューではない
    // 2. リファラーが同じドメインからの場合もシェアビューではない
    // 3. 上記以外（外部サイトからの訪問や直接URL入力）はシェアビューとみなす
    const isSharedView = !isDirect && !isFromSameOrigin;

    // 結果ページ初期化時にGemini回答を設定するためのモックデータ
    let initialGeminiAnswer = undefined;

    // hasGeminiフラグがtrueの場合、モックのGemini回答を生成
    if (hasGemini) {
      const quiz = quizData.find(q => q.id === quizId);
      const style = styleVariations.find(s => s.id === styleId);

      if (quiz && style) {
        initialGeminiAnswer = {
          content: locale === 'ja'
            ? `これはGeminiの模範解答です。${quiz.content_ja}について、${style.name_ja}の口調でお答えします。このお題についての正確な情報をご提供します。`
            : `This is a model answer from Gemini. I'll answer about ${quiz.content_en} in the style of ${style.name_en}. Let me provide you with accurate information about this topic.`,
          avatar_url: "https://lh3.googleusercontent.com/a/ACg8ocL6It7Up3pLC6Zexk19oNK4UQTd_iIz5eXXHxWjZrBxH_cN=s48-c"
        };
      }
    }

    return {
      props: {
        resultId: id,
        quizId,
        styleId,
        score,
        userAnswer,
        locale,
        ogImageUrl,
        resultUrl,
        shareText,
        isSharedView,
        preferredLanguage: locale, // ここでlanguageプロパティとして追加
        initialGeminiAnswer // Gemini回答の初期値を追加
      }
    };
  } catch (error) {
    console.error('Error in getServerSideProps:', error);
    return { notFound: true };
  }
};

export default ResultPage;