import React, { useContext, useEffect, useState, useRef } from 'react';
import { GetStaticProps, GetStaticPaths, NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { quizData } from '../../data/quizData';
import { styleVariations } from '../../data/styleVariations';
import { getTranslationForLocale } from '../../i18n/translations';
import { decodeResultId } from '../../utils/geminiService';
import { generateResultUrl, generateShareText } from '../../utils/imageUtils';
import { generateOgImageUrl, getStaticOgImageUrl } from '../../utils/simpleImageUtils';
import { FeedbackData, ResultPageParams, GeminiAnswer } from '../../utils/types';
import { expandUrlParams } from '../../utils/urlShortener';
import { LanguageContext } from '../_app';
import { getGrokUser } from '../../data/virtualUsers';
import { initializeUsers } from '../../utils/userHelpers';
import { getGeminiAnswerServer, evaluateAnswerServer } from '../../utils/geminiServerService';
import Post from '../../components/Post';
import ReplyRequest from '../../components/ReplyRequest';
import LanguageSwitcher from '../../components/LanguageSwitcher';
import AboutModal from '../../components/AboutModal';
import PostInteractions from '../../components/PostInteractions';
import GeminiAnswerDisplay from '../../components/GeminiAnswerDisplay';
import GeminiFeedback from '../../components/GeminiFeedback';
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
  feedbackData: FeedbackData; // サーバーサイドで生成したフィードバックデータ
}

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
  feedbackData
}) => {
  const router = useRouter();
  const { isJapanese, setLanguage } = useContext(LanguageContext);
  const [t, setT] = useState(getTranslationForLocale(locale));
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [clientSideSharedView, setClientSideSharedView] = useState(isSharedView);

  // URLからのクエリパラメータと静的生成との橋渡し
  const quizUserId = router.query.quizUserId ? parseInt(router.query.quizUserId as string, 10) : 0;
  const replyUserId = router.query.replyUserId ? parseInt(router.query.replyUserId as string, 10) : 0;

  // クライアントサイドでのシェア状態判定
  useEffect(() => {
    if (router.isReady) {
      const isDirect = router.query.direct === '1';
      // URLパラメータから判断
      if (router.query.shared === '1' && !isDirect) {
        setClientSideSharedView(true);
      }
    }
  }, [router.isReady, router.query]);

  // クイズとスタイルの情報を取得
  const quiz = quizData.find(q => q.id === quizId) || quizData[0];
  const style = styleVariations.find(s => s.id === styleId) || styleVariations[0];

  // 初期レンダリング時に言語設定を適用
  useEffect(() => {
    if (locale === 'ja' || locale === 'en') {
      setLanguage(locale);
    }
  }, [locale, setLanguage]);

  // ページ読み込み後、少し遅れてGrok回答の少し上にスクロール（シェアからの訪問時はスクロールしない）
  useEffect(() => {
    // シェアURLからの訪問の場合はスクロールしない
    if (!isSharedView && grokAnswerRef.current) {
      const timer = setTimeout(() => {
        // Grok回答の位置を取得
        const grokElement = grokAnswerRef.current;
        if (!grokElement) return;

        const rect = grokElement.getBoundingClientRect();

        // 一つ前のポストの下部が少し見えるよう、上方向に少しオフセット
        const scrollPosition = window.scrollY + rect.top - 80;

        // スムーズにスクロール
        window.scrollTo({
          top: scrollPosition,
          behavior: 'smooth'
        });
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [isSharedView]);

  // 言語が変更されたときに翻訳も更新
  useEffect(() => {
    setT(getTranslationForLocale(isJapanese ? 'ja' : 'en'));
  }, [isJapanese]);
  
  // 言語に応じたコンテンツを取得
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
      setPageTitle(`${t.appTitle} - ${t.sharedResultView} (${score}/100)`);
    } else {
      setPageTitle(`${t.appTitle} - ${t.resultTitle} (${score}/100)`);
    }
  }, [t, score, isSharedView]);
  
  // ユーザー情報の初期化
  const initialUsers = initializeUsers(resultId, quizId, isJapanese, quizUserId, replyUserId);
  const [quizUser, setQuizUser] = useState(initialUsers[0]);
  const [replyUser, setReplyUser] = useState(initialUsers[1]);
  const [currentGrokUser, setCurrentGrokUser] = useState(getGrokUser(isJapanese));
  // シェアURL(isSharedView=true)からの訪問時は参考ポストを最初から表示
  const [showReferencePost, setShowReferencePost] = useState(isSharedView);
  const [showShowMoreButton, setShowShowMoreButton] = useState(false);
  const grokAnswerRef = useRef<HTMLDivElement>(null);

  // 言語が変更されたときにユーザー名を更新
  useEffect(() => {
    // 言語に合わせてユーザー情報を更新
    const updatedUsers = initializeUsers(resultId, quizId, isJapanese, quizUserId, replyUserId);
    setQuizUser(updatedUsers[0]);
    setReplyUser(updatedUsers[1]);
    setCurrentGrokUser(getGrokUser(isJapanese));
  }, [isJapanese, resultId, quizId, quizUserId, replyUserId]);

  // 評価結果表示後、3秒後に「1件のポストを表示」ボタンを表示（シェア訪問時は表示しない）
  useEffect(() => {
    // シェアからの訪問でない場合のみ、ボタン表示のタイマーを設定
    if (feedbackData.gemini_answer && !isSharedView) {
      const timer = setTimeout(() => {
        setShowShowMoreButton(true);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [feedbackData.gemini_answer, isSharedView]);
  
  // Xでシェアする
  const handleShare = () => {
    ga.trackShareResult(score, 'twitter');
    const twitterShareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
    window.open(twitterShareUrl, '_blank');
  };
  
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
            {clientSideSharedView ? t.sharedResultView : t.resultTitle}
          </h2>

          <div className="bg-twitter-darker rounded-lg border border-gray-700 overflow-hidden mb-8">
            {/* 元の投稿 */}
            <Post
              user={quizUser}
              content={content}
              postId={`quiz-${resultId}-${quizId}`}
            />
            
            {/* Grokへのリプライリクエスト */}
            <ReplyRequest
              user={replyUser}
              originalUser={quizUser}
              style={style}
              isJapanese={locale === 'ja'}
              customSeed={`reply-${resultId}-${styleId}`}
            />
            
            {/* Grokの回答 */}
            <div className="p-4 pl-12 border-b border-gray-700" ref={grokAnswerRef}>
              <div className="flex items-start">
                <div
                  className="mr-3 flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-white text-lg font-bold"
                  style={{ backgroundColor: currentGrokUser.avatar }}
                >
                  {currentGrokUser.name?.charAt(0) || 'G'}
                </div>
                <div className="flex-grow">
                  <div className="flex items-start mb-2">
                    <div>
                      <h3 className="font-bold text-white">{currentGrokUser.name || 'Grok'}</h3>
                      <p className="text-gray-400 text-sm">@{currentGrokUser.username} · {t.justNow}</p>
                    </div>
                  </div>

                  <p className="text-gray-400 text-sm mb-2">
                    {isJapanese ? '返信先:' : 'Replying to:'} <span className="text-twitter-blue">@{replyUser.username}</span>
                  </p>

                  <div className="text-white whitespace-pre-wrap">
                    {userAnswer}
                  </div>

                  <PostInteractions seed={`grok-${resultId}`} />
                </div>
              </div>
            </div>

            {/* Geminiの評価 */}
            <GeminiFeedback feedback={feedbackData} t={t} isJapanese={isJapanese} resultId={resultId} />

            {/* 「1件のポストを表示」ボタン */}
            {feedbackData.gemini_answer && showShowMoreButton && !showReferencePost && (
              <button
                onClick={() => setShowReferencePost(true)}
                className="w-full py-2 text-twitter-blue hover:bg-gray-800/50 transition-colors border-t border-b border-gray-700 font-medium text-sm"
              >
                {isJapanese ? '1件のポストを表示' : 'Show 1 post'}
              </button>
            )}

            {/* Geminiの回答表示 */}
            {feedbackData.gemini_answer && showReferencePost && (
              <GeminiAnswerDisplay
                geminiAnswer={feedbackData.gemini_answer}
                resultId={resultId}
                locale={isJapanese ? 'ja' : 'en'}
                t={t}
              />
            )}

            {/* 静的生成時の注意メッセージ（本番環境でも表示） */}
            {!feedbackData.gemini_answer && (
              <div className="p-4 bg-blue-100 text-blue-800 border border-blue-200 rounded-md mt-2 mb-2">
                <p>{isJapanese
                  ? "注: 静的サイトではGemini APIが利用できません。実際のAPIレスポンスを表示するには、クラウド環境で実行する必要があります。"
                  : "Note: Gemini API is not available in static site exports. To see actual API responses, the app needs to be run in a cloud environment."}
                </p>
              </div>
            )}
          </div>

          {/* シェアボタン */}
          <div className="flex flex-col md:flex-row justify-center gap-4 mt-8">
            {!clientSideSharedView && (
              <button
                onClick={handleShare}
                className="btn-primary flex items-center justify-center"
              >
                {t.shareOnX}
              </button>
            )}

            <button
              onClick={() => router.push('/?lang=' + (isJapanese ? 'ja' : 'en'))}
              className={clientSideSharedView ? "btn-primary" : "btn-secondary"}
            >
              {clientSideSharedView ? t.tryGrokYourself : t.newQuestion}
            </button>
          </div>

          {/* 結果ページの警告 */}
          {clientSideSharedView && (
            <div className="mt-10 p-4 border border-amber-500/30 bg-amber-500/10 rounded-lg text-sm text-amber-500">
              <p>{t.resultDisclaimer}</p>
            </div>
          )}
        </div>
      </main>

      <footer className="bg-black py-6 mt-12">
        <div className="container mx-auto px-4 text-center text-gray-500">
          <p>{t.footer}</p>
          <p className="mt-2 text-sm">{t.footerDisclaimer}</p>
        </div>
      </footer>

      <AboutModal
        isOpen={isAboutOpen}
        onClose={() => setIsAboutOpen(false)}
      />
    </div>
  );
};

// 静的ページ生成のためのパス取得
export const getStaticPaths: GetStaticPaths = async () => {
  // 動的なパスは事前に生成せず、アクセス時に生成（falllback: true）
  return {
    paths: [],
    fallback: 'blocking'
  };
};

// 静的ページ生成のためのデータ取得
export const getStaticProps: GetStaticProps<ResultPageProps, ResultPageParams> = async (context) => {
  // IDを取得
  const { id } = context.params || {};
  if (!id) {
    // 存在しないIDの場合はホームにリダイレクト
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }

  // 静的生成時はクエリパラメータが利用できないため、
  // クライアントサイドでURLパラメータを処理することを前提とする
  const locale = 'ja';  // デフォルト言語
  const langQuery = '';

  // ユーザーの回答（静的ビルド時はデフォルト値）
  const userAnswer = "この質問に対する私の回答です...";

  try {
    // エラーフラグ - 問題が発生したかを追跡
    let hasErrors = false;

    // IDからクイズID, スタイルID, スコアを抽出
    const resultData = decodeResultId(id);
    if (!resultData) {
      // 無効なIDの場合はホームにリダイレクト
      return {
        redirect: {
          destination: `/${langQuery}`,
          permanent: false,
        },
      };
    }

    const { quizId, styleId, score } = resultData;
    
    // クイズとスタイルの存在確認
    const quiz = quizData.find(q => q.id === quizId);
    const style = styleVariations.find(s => s.id === styleId);
    if (!quiz || !style) {
      // 存在しないクイズまたはスタイルの場合はホームにリダイレクト
      return {
        redirect: {
          destination: `/${langQuery}`,
          permanent: false,
        },
      };
    }

    // 静的生成のためにハードコードされたホスト名を使用
    const host = 'in-groks-mind.shaba.dev';
    
    // 単純なAPIエンドポイントを使用してOG画像URLを生成
    // Netlify Functionsや依存関係が必要なライブラリを使わないシンプルな実装

    // サーバーサイドでGemini回答を取得
    let geminiAnswer = null;
    try {
      geminiAnswer = await getGeminiAnswerServer(quiz, style, locale);
    } catch (apiError) {
      console.error('Error calling Gemini API:', apiError);
      hasErrors = true; // エラーフラグを設定

      // エラー時のフォールバック回答
      geminiAnswer = {
        content: locale === 'ja'
          ? `申し訳ありません。現在、APIサービスに一時的な問題が発生しています。${quiz.content_ja}についての回答は後ほどお試しください。`
          : `Sorry, there is a temporary issue with the API service. Please try again later for an answer about ${quiz.content_en}.`,
        avatar_url: "https://lh3.googleusercontent.com/a/ACg8ocL6It7Up3pLC6Zexk19oNK4UQTd_iIz5eXXHxWjZrBxH_cN=s48-c"
      };
    }

    // サーバーサイドで回答評価
    let feedbackData;
    try {
      if (userAnswer && !hasErrors) {
        feedbackData = await evaluateAnswerServer(quiz, style, userAnswer, geminiAnswer, locale);
      } else {
        // 評価結果のみ渡す（フィードバック部分だけを含める）
        // エラーが発生した場合や回答がない場合はここに入る
        const accuracyScore = Math.floor(score / 2);
        const styleScore = score - accuracyScore;

        feedbackData = {
          accuracy_score: accuracyScore,
          accuracy_comment: hasErrors
            ? (locale === 'ja' ? "システムエラーのため正確な評価ができません。" : "Cannot provide accurate evaluation due to system error.")
            : (accuracyScore >= 40
                ? (locale === 'ja' ? "非常に正確な情報提供です。" : "Highly accurate information.")
                : (locale === 'ja' ? "情報の正確性は平均的です。" : "Information accuracy is average.")),
          style_score: styleScore,
          style_comment: hasErrors
            ? (locale === 'ja' ? "システムエラーのため口調の評価ができません。" : "Cannot evaluate tone due to system error.")
            : (styleScore >= 40
                ? (locale === 'ja' ? `「${style.name_ja}」の特徴をよく捉えています。` : `You've captured the characteristics of "${style.name_en}" style well.`)
                : (locale === 'ja' ? `「${style.name_ja}」の特徴をある程度再現しています。` : `You've somewhat reproduced the "${style.name_en}" style.`)),
          total_score: score,
          overall_comment: hasErrors
            ? (locale === 'ja' ? "申し訳ありませんが、現在技術的な問題が発生しています。" : "Sorry, we're experiencing technical issues at the moment.")
            : (score >= 80
                ? (locale === 'ja' ? "素晴らしい回答です！" : "Excellent answer!")
                : (locale === 'ja' ? "良い回答です。" : "Good answer.")),
          gemini_answer: geminiAnswer
        };
      }
    } catch (evalError) {
      console.error('Error in answer evaluation:', evalError);
      hasErrors = true;

      // 評価エラー時のフォールバック
      const accuracyScore = Math.floor(score / 2);
      const styleScore = score - accuracyScore;

      feedbackData = {
        accuracy_score: accuracyScore,
        accuracy_comment: locale === 'ja' ? "評価サービスに問題が発生しています。" : "There is an issue with the evaluation service.",
        style_score: styleScore,
        style_comment: locale === 'ja' ? "口調評価は現在利用できません。" : "Style evaluation is currently unavailable.",
        total_score: score,
        overall_comment: locale === 'ja' ? "システム障害のため正確な評価ができません。" : "Accurate evaluation is not possible due to system issues.",
        gemini_answer: geminiAnswer
      };
    }

    // 実際のスコアをOG画像のURL生成に使用
    const actualScore = feedbackData.total_score;

    // OG画像URLの生成 - すべてのページで統一されたOG画像を使用
    // どの環境でも常に同じ静的OG画像を使用
    const ogImageUrl = getStaticOgImageUrl(locale, host);
    console.log('Using static OG image for all pages');

    // 結果ページURL生成 (静的生成時はクエリパラメータなし)
    const resultUrl = generateResultUrl(
      id, host, userAnswer, locale
    );

    // シェアテキスト生成
    const shareText = generateShareText(quiz, style, score, locale, resultUrl);

    // 静的生成ではリファラーやクエリパラメータが取得できないため、デフォルト値を設定
    // クライアントサイドでURLパラメータから判断する前提
    const isSharedView = false;

    // 静的生成時のリファラーやクエリパラメータのモック
    // 後続処理でのエラーを防止するためのダミー値
    const isDirect = false;

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
        feedbackData
      }
    };
  } catch (error) {
    console.error('Error in getStaticProps:', error);
    // エラー発生時もホームにリダイレクト
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }
};

export default ResultPage;