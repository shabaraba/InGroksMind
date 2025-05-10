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
import { getGrokUser } from '../../data/virtualUsers';
import { initializeUsers } from '../../utils/userHelpers';
import { createFeedbackData } from '../../utils/feedbackHelpers';
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
  initialGeminiAnswer?: GeminiAnswer; // Gemini回答の初期値
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
  initialGeminiAnswer
}) => {
  const router = useRouter();
  const { isJapanese, setLanguage } = useContext(LanguageContext);
  const [t, setT] = useState(getTranslationForLocale(locale));
  const [isAboutOpen, setIsAboutOpen] = useState(false);

  // URLからのクエリパラメータ
  const quizUserId = router.query.quizUserId ? parseInt(router.query.quizUserId as string, 10) : 0;
  const replyUserId = router.query.replyUserId ? parseInt(router.query.replyUserId as string, 10) : 0;

  // クイズとスタイルの情報を取得
  const quiz = quizData.find(q => q.id === quizId) || quizData[0];
  const style = styleVariations.find(s => s.id === styleId) || styleVariations[0];

  // 初期レンダリング時に言語設定を適用
  useEffect(() => {
    if (locale === 'ja' || locale === 'en') {
      setLanguage(locale);
    }
  }, [locale, setLanguage]);

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

  // 言語が変更されたときにユーザー名を更新
  useEffect(() => {
    // 言語に合わせてユーザー情報を更新
    const updatedUsers = initializeUsers(resultId, quizId, isJapanese, quizUserId, replyUserId);
    setQuizUser(updatedUsers[0]);
    setReplyUser(updatedUsers[1]);
    setCurrentGrokUser(getGrokUser(isJapanese));
  }, [isJapanese, resultId, quizId, quizUserId, replyUserId]);
  
  // 評価結果データを生成（useMemoで言語変更時に再計算）
  const feedback = React.useMemo<FeedbackData>(() => {
    return createFeedbackData(score, isJapanese, quiz, style, initialGeminiAnswer);
  }, [isJapanese, score, style, quiz, initialGeminiAnswer]);
  
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
            {isSharedView ? t.sharedResultView : t.resultTitle}
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
            <div className="p-4 pl-12 border-b border-gray-700">
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

            {/* Geminiの回答表示 */}
            {feedback.gemini_answer && (
              <GeminiAnswerDisplay
                geminiAnswer={feedback.gemini_answer}
                resultId={resultId}
                locale={isJapanese ? 'ja' : 'en'}
                t={t}
              />
            )}

            {/* デバッグメッセージ（開発用のみ） */}
            {process.env.NODE_ENV === 'development' && !feedback.gemini_answer && (
              <div className="p-4 bg-red-100 text-red-800 border border-red-200 rounded-md mt-2 mb-2">
                <p>Debug: Gemini回答が取得できませんでした。</p>
              </div>
            )}

            {/* Geminiの評価 */}
            <GeminiFeedback feedback={feedback} t={t} isJapanese={isJapanese} resultId={resultId} />
          </div>

          {/* シェアボタン */}
          <div className="flex flex-col md:flex-row justify-center gap-4 mt-8">
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

          {/* 結果ページの警告 */}
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

// サーバーサイドのデータ取得
export const getServerSideProps: GetServerSideProps<ResultPageProps, ResultPageParams> = async (context) => {
  // 言語パラメータ取得（リダイレクト用）
  const langParam = context.query.lang as string;
  const locale = langParam === 'ja' ? 'ja' : (langParam === 'en' ? 'en' : (context.locale || 'en'));
  const langQuery = locale ? `?lang=${locale}` : '';

  // IDを取得
  const { id } = context.params || {};
  if (!id) {
    // 存在しないIDの場合はホームにリダイレクト
    return {
      redirect: {
        destination: `/${langQuery}`,
        permanent: false,
      },
    };
  }

  // 圧縮されたクエリパラメータがあれば展開
  const compressedData = context.query.c as string;
  if (compressedData) {
    const params = expandUrlParams(compressedData);
    params.forEach((value, key) => { context.query[key] = value; });
  }

  // ユーザーの回答とGemini回答フラグを取得
  const userAnswer = context.query.answer as string || "この質問に対する私の回答です...";
  const hasGemini = context.query.has_gemini === '1';

  try {
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
    };

    // ホスト名取得
    const host = context.req.headers.host || 'localhost:3000';
    
    // OG画像URL生成
    const ogImageUrl = generateOgImageUrl(quizId, styleId, score, locale, host);
    
    // 結果ページURL生成
    const resultUrl = generateResultUrl(
      id, host, userAnswer, locale,
      context.query.quizUserId as string,
      context.query.replyUserId as string
    );
    
    // シェアテキスト生成
    const shareText = generateShareText(quiz, style, score, locale, resultUrl);
    
    // シェアからの訪問判定
    const referer = context.req.headers.referer || '';
    const host_parts = host.split(':')[0];
    const isDirect = context.query.direct === '1';
    const isFromSameOrigin = referer.includes(host_parts);
    const isSharedView = !isDirect && !isFromSameOrigin;

    // Gemini回答データ生成
    let initialGeminiAnswer = undefined;
    if (hasGemini && quiz && style) {
      initialGeminiAnswer = {
        content: locale === 'ja'
          ? `これはGeminiの模範解答です。${quiz.content_ja}について、${style.name_ja}の口調でお答えします。このお題についての正確な情報をご提供します。`
          : `This is a model answer from Gemini. I'll answer about ${quiz.content_en} in the style of ${style.name_en}. Let me provide you with accurate information about this topic.`,
        avatar_url: "https://lh3.googleusercontent.com/a/ACg8ocL6It7Up3pLC6Zexk19oNK4UQTd_iIz5eXXHxWjZrBxH_cN=s48-c"
      };
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
        preferredLanguage: locale,
        initialGeminiAnswer
      }
    };
  } catch (error) {
    console.error('Error in getServerSideProps:', error);
    // エラー発生時もホームにリダイレクト
    return {
      redirect: {
        destination: `/${langQuery}`,
        permanent: false,
      },
    };
  }
};

export default ResultPage;