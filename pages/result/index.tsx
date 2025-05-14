import React, { useContext, useEffect, useState, useRef } from 'react';
import { GetServerSideProps, NextPage } from 'next';
import { NextSeo } from 'next-seo';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { quizData } from '../../data/quizData';
import { styleVariations } from '../../data/styleVariations';
import { getTranslationForLocale } from '../../i18n/translations';
import { generateShareText } from '../../utils/shareUtils';
import { generateOgImageUrl } from '../../utils/simpleImageUtils';
import { FeedbackData, GeminiAnswer } from '../../utils/types';
import { expandUrlParams } from '../../utils/urlShortener';
import { LanguageContext } from '../_app';
import { getGrokUser } from '../../data/virtualUsers';
import { initializeUsers } from '../../utils/userHelpers';
import { getGeminiAnswerServer, getGeminiReferenceAnswerServer, evaluateAnswerServer } from '../../utils/geminiServerService';
import Post from '../../components/Post';
import ReplyRequest from '../../components/ReplyRequest';
import LanguageSwitcher from '../../components/LanguageSwitcher';
import AboutModal from '../../components/AboutModal';
import GeminiAnswerDisplay from '../../components/GeminiAnswerDisplay';
import GeminiFeedback from '../../components/GeminiFeedback';
import * as ga from '../../utils/analytics';

interface ResultPageProps {
  quizId: number;
  styleId: number;
  score: number;
  userAnswer: string;
  locale: string;
  ogImageUrl: string;
  resultUrl: string;
  shareText: string;
  isSharedView: boolean;
  feedbackData: FeedbackData;
}

const ResultPage: NextPage<ResultPageProps> = ({
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

  // ユーザーアバターと投稿内容
  const seedBase = `${quizId}-${styleId}`;
  const initialUsers = initializeUsers(seedBase, quizId, isJapanese);
  const [quizUser, setQuizUser] = useState(initialUsers[0]);
  const [replyUser, setReplyUser] = useState(initialUsers[1]);
  const [currentGrokUser, setCurrentGrokUser] = useState(getGrokUser(isJapanese));
  const [showReferencePost, setShowReferencePost] = useState(false);
  const [showShowMoreButton, setShowShowMoreButton] = useState(false);

  // 表示するコンテンツの準備
  const content = isJapanese ? quiz.content_ja : quiz.content_en;
  const styleName = isJapanese ? style.name_ja : style.name_en;
  const pageTitle = `${t.resultTitle}: ${score}/100 - ${content}`;

  // 言語切り替え時の処理
  useEffect(() => {
    setT(getTranslationForLocale(isJapanese ? 'ja' : 'en'));
    
    // 言語に合わせてユーザー情報を更新
    const updatedUsers = initializeUsers(seedBase, quizId, isJapanese);
    setQuizUser(updatedUsers[0]);
    setReplyUser(updatedUsers[1]);
    setCurrentGrokUser(getGrokUser(isJapanese));
  }, [isJapanese, seedBase, quizId]);

  // ドキュメント参照用のref
  const grokAnswerRef = useRef<HTMLDivElement>(null);

  // シェアされた結果ページ表示時に、遅延ロードで参考回答を表示
  useEffect(() => {
    if (feedbackData.gemini_answer && isSharedView) {
      const timer = setTimeout(() => {
        setShowReferencePost(true);
        setShowShowMoreButton(true);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [feedbackData.gemini_answer, isSharedView]);
  
  // シェアボタン押下時にKVに結果を保存してからシェアする
  const handleShare = async () => {
    ga.trackShareResult(score, 'twitter');
    
    try {
      // シェア用のデータを準備（このタイミングでだけ保存する）
      const resultData = {
        quizId,
        styleId,
        answer: userAnswer,
        feedback: feedbackData,
        timestamp: Date.now(),
        answerLanguage: isJapanese ? 'ja' : 'en' // 回答時の言語設定を保存
      };
      
      try {
        // データをKVに保存（すでに保存されている場合は再利用）
        const response = await fetch('/api/save-result', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(resultData),
        });
        
        const data = await response.json();
        
        if (data.id) {
          // シェアテキストを生成
          const tweetText = isJapanese
            ? `InGrokMindで「${content}」について「${styleName}」スタイルで回答してみました！スコア: ${score}/100 ${t.checkMyAnswer} ${process.env.NEXT_PUBLIC_SITE_URL}/share/${data.id}`
            : `I answered about "${content}" in "${styleName}" style on InGrokMind! Score: ${score}/100 ${t.checkMyAnswer} ${process.env.NEXT_PUBLIC_SITE_URL}/share/${data.id}`;
          
          // Twitterシェアのリンクを生成して開く
          const twitterShareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;
          window.open(twitterShareUrl, '_blank');
        } else {
          throw new Error('Invalid response from save-result API');
        }
        
      } catch (apiError) {
        console.error('API error:', apiError);
        // APIエラーの場合は従来のシェア方法を使用（URLなし）
        const fallbackShareText = generateShareText(quiz, style, score, isJapanese ? 'ja' : 'en');
        const twitterShareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(fallbackShareText)}`;
        window.open(twitterShareUrl, '_blank');
      }
    } catch (error) {
      console.error('Error in share handling:', error);
      
      // エラーが発生した場合はユーザーに通知し、従来のシェア方法を使用
      alert(isJapanese ? 'シェアの準備中にエラーが発生しました。もう一度お試しください。' : 'An error occurred while preparing to share. Please try again.');
      const finalFallbackShareText = generateShareText(quiz, style, score, isJapanese ? 'ja' : 'en');
      const twitterShareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(finalFallbackShareText)}`;
      window.open(twitterShareUrl, '_blank');
    }
  };
  
  return (
    <div className="min-h-screen bg-twitter-dark">
      <NextSeo
        title={pageTitle}
        description={`${content} - ${isSharedView ? t.sharedResultView : t.resultTitle}: ${score}/100`}
        openGraph={{
          title: pageTitle,
          description: isSharedView
            ? `${content} - ${styleName} スタイルでの回答 (${score}/100)`
            : `${content} - ${styleName} (${score}/100)`,
          url: 'https://in-grok-mind.shaba.dev/result',
          images: [
            {
              url: 'https://in-grok-mind.shaba.dev/og-image-home-new.png',
              width: 1200,
              height: 630,
              alt: `InGrokMind - ${content}`,
            }
          ]
        }}
      />

      <header className="bg-black/80 backdrop-blur-md p-4 border-b border-gray-700 sticky top-0 z-10">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">
            <Link href="/" className="text-white hover:text-gray-200 transition-colors">
              {t.appTitle}
            </Link>
          </h1>
          <div className="flex items-center space-x-4">
            <LanguageSwitcher />
            <button
              className="text-white hover:text-blue-300 transition-colors"
              onClick={() => setIsAboutOpen(true)}
            >
              {t.about}
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto p-4">
        <div className="mb-8">
          <div className="mb-4 text-center">
            <h2 className="text-white text-2xl font-bold mb-2">{isSharedView ? t.sharedResultView : t.resultTitle}</h2>
            <p className="text-gray-300">
              {isJapanese
                ? `「${content}」について「${styleName}」スタイルで回答`
                : `Answered about "${content}" in "${styleName}" style`}
            </p>
          </div>

          <div className="flex justify-center mb-8">
            <div className="w-full max-w-md bg-gray-800 rounded-full h-6">
              <div
                className={`h-6 rounded-full ${score >= 80 ? 'bg-green-500' : score >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
                style={{ width: `${score}%` }}
              ></div>
            </div>
            <div className="text-white font-bold text-xl ml-4">{score}/100</div>
          </div>

          <div className="bg-twitter-dark-post rounded-xl overflow-hidden mb-6">
            {/* 質問ポスト */}
            <Post 
              user={quizUser}
              content={content}
              timestamp={t.postedXMinutesAgo.replace('{minutes}', '45')}
              className="border-b border-gray-700"
              postId={`quiz-${quizId}`}
            />

            {/* Grokへの回答リクエストポスト */}
            <ReplyRequest
              user={replyUser}
              originalUser={quizUser}
              style={style}
              isJapanese={isJapanese}
              customSeed={`quiz-${quizId}`}
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

                  {/* インタラクションボタン */}
                  <PostInteractions seed={`grok-answer-${quizId}-${styleId}`} />
                </div>
              </div>
            </div>

            {/* Geminiフィードバック */}
            <GeminiFeedback
              feedback={feedbackData}
              t={t}
              isJapanese={isJapanese}
              resultId={`result-${quizId}-${styleId}-${Math.floor(Math.random() * 10000)}`}
            />

            {/* モデル回答（遅延表示/ボタンで表示） */}
            {isSharedView ? (
              showShowMoreButton && (
                <div className="p-4 text-center">
                  <button
                    onClick={() => setShowReferencePost(true)}
                    className={`btn-secondary mt-4 ${showReferencePost ? 'hidden' : ''}`}
                  >
                    {t.showModelAnswer}
                  </button>
                </div>
              )
            ) : (
              <div className="p-4 text-center">
                <button
                  onClick={() => setShowReferencePost(!showReferencePost)}
                  className="btn-secondary mt-4"
                >
                  {showReferencePost ? t.hideModelAnswer : t.showModelAnswer}
                </button>
              </div>
            )}

            {/* Gemini参考回答 */}
            {showReferencePost && feedbackData.gemini_answer && (
              <GeminiAnswerDisplay
                geminiAnswer={feedbackData.gemini_answer}
                resultId={`result-${quizId}-${styleId}`}
                locale={isJapanese ? 'ja' : 'en'}
                t={t}
                isReference={true}
              />
            )}
          </div>

          {/* シェアボタン */}
          <div className="flex flex-col md:flex-row justify-center gap-4 mt-8">
            <button
              onClick={handleShare}
              className="btn-primary flex items-center justify-center"
            >
              {t.shareOnX}
            </button>

            <button
              onClick={() => router.push('/?lang=' + (isJapanese ? 'ja' : 'en'))}
              className="btn-secondary"
            >
              {t.tryAgain}
            </button>
          </div>
        </div>
      </div>

      {/* Aboutモーダル */}
      <AboutModal
        isOpen={isAboutOpen}
        onClose={() => setIsAboutOpen(false)}
        t={t}
      />
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  // URLパラメータからクイズIDとスタイルIDを取得
  const { quizId, styleId, answer } = context.query;
  
  // 言語パラメータを取得（なければデフォルトは日本語）
  const langParam = context.query.lang as string || 'ja';
  
  // データが欠けている場合はホームにリダイレクト
  if (!quizId || !styleId || !answer) {
    // シェアのプロトタイプパラメータがあれば展開してみる
    const shortParams = context.query.p as string;
    if (shortParams) {
      try {
        // パラメータを展開
        const expandedParams = expandUrlParams(shortParams);
        const { quizId: qId, styleId: sId, answer: ans } = expandedParams;
        
        if (qId && sId && ans) {
          return {
            redirect: {
              destination: `/result?quizId=${qId}&styleId=${sId}&answer=${encodeURIComponent(ans)}${langParam ? `&lang=${langParam}` : ''}`,
              permanent: false,
            },
          };
        }
      } catch (error) {
        console.error('Error expanding params:', error);
      }
    }
    
    return {
      redirect: {
        destination: `/${langParam ? `?lang=${langParam}` : ''}`,
        permanent: false,
      },
    };
  }
  
  // 明示的に 'ja' または 'en' のみを許可
  const locale = langParam === 'ja' ? 'ja' : 'en';
  const langQuery = `?lang=${locale}`;

  try {
    // ダミースコアの設定（実際の評価はこの後行われる）
    const score = 70;
    
    // クイズとスタイルの存在確認
    const quiz = quizData.find(q => q.id === parseInt(quizId as string, 10));
    const style = styleVariations.find(s => s.id === parseInt(styleId as string, 10));
    if (!quiz || !style) {
      // 存在しないクイズまたはスタイルの場合はホームにリダイレクト
      return {
        redirect: {
          destination: `/${langQuery}`,
          permanent: false,
        },
      };
    }
    
    // ユーザー回答を取得
    const userAnswer = answer as string;
    if (!userAnswer) {
      return {
        redirect: {
          destination: `/${langQuery}`,
          permanent: false,
        },
      };
    }
    
    // 回答の質を評価
    const quizContent = locale === 'ja' ? quiz.content_ja : quiz.content_en;
    const styleText = locale === 'ja' ? style.name_ja : style.name_en;
    
    // Geminiの模範回答を取得
    let geminiAnswer: GeminiAnswer | null = null;
    
    try {
      geminiAnswer = await getGeminiAnswerServer(quiz, style, locale);
    } catch (error) {
      console.error('Failed to get Gemini answer:', error);
      // エラーが発生した場合はモックデータを使用
      geminiAnswer = {
        content: locale === 'ja'
          ? `※APIエラーのため、モックデータを表示しています。${quizContent}について、${styleText}スタイルで回答します。`
          : `※Showing mock data due to API error. Answering about ${quizContent} in ${styleText} style.`,
        avatar_url: "https://lh3.googleusercontent.com/a/ACg8ocL6It7Up3pLC6Zexk19oNK4UQTd_iIz5eXXHxWjZrBxH_cN=s48-c"
      };
    }
    
    // 参考回答の取得は必須ではないので、エラーが発生しても続行
    try {
      await getGeminiReferenceAnswerServer(quiz, locale);
    } catch (error) {
      console.error('Failed to get reference answer:', error);
    }
    
    // 回答を評価
    let resultScore = 0;
    let feedbackData: FeedbackData;
    
    try {
      feedbackData = await evaluateAnswerServer(quiz, style, userAnswer, geminiAnswer, locale);
      resultScore = feedbackData.total_score;
    } catch (error) {
      console.error('Failed to evaluate answer:', error);
      
      // エラーが発生した場合はモックのフィードバックを生成
      const errorMessage = locale === 'ja'
        ? '※APIエラーのため、モックのフィードバックを表示しています。'
        : '※Showing mock feedback due to API error.';
      
      feedbackData = {
        accuracy_score: 35,
        style_score: 35,
        total_score: 70,
        accuracy_comment: `${errorMessage} ${locale === 'ja' ? '内容の正確性は平均的です。' : 'The accuracy is average.'}`,
        style_comment: `${errorMessage} ${locale === 'ja' ? 'スタイルの模倣は部分的にできています。' : 'The style imitation is partially accomplished.'}`,
        overall_comment: `${errorMessage} ${locale === 'ja' ? '全体的には可もなく不可もない回答です。' : 'Overall, this is a mediocre answer.'}`,
        gemini_answer: geminiAnswer
      };
      
      resultScore = 70; // モックのスコア
    }
    
    // ソーシャルシェア用の設定
    const ogImageUrl = generateOgImageUrl(
      parseInt(quizId as string, 10),
      parseInt(styleId as string, 10),
      resultScore,
      locale
    );
    
    const resultUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://in-grok-mind.shaba.dev'}/result?quizId=${quizId}&styleId=${styleId}&answer=${encodeURIComponent(userAnswer)}&lang=${locale}`;
    const shareText = generateShareText(quiz, style, resultScore, locale);
    
    // データを渡す
    return {
      props: {
        quizId: parseInt(quizId as string, 10),
        styleId: parseInt(styleId as string, 10),
        score: resultScore,
        userAnswer,
        locale,
        ogImageUrl,
        resultUrl,
        shareText,
        isSharedView: false,
        feedbackData
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