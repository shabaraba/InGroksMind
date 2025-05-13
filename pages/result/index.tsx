import React, { useContext, useEffect, useState, useRef } from 'react';
import { GetServerSideProps, NextPage } from 'next';
import Head from 'next/head';
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
import PostInteractions from '../../components/PostInteractions';
import GeminiAnswerDisplay from '../../components/GeminiAnswerDisplay';
import GeminiFeedback from '../../components/GeminiFeedback';
import * as ga from '../../utils/analytics';

// 結果ページのプロパティ
interface ResultPageProps {
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
  
  // 一意のシードを生成（タイムスタンプベース、シェア時に本当のIDが生成される）
  const seedBase = `result-${Date.now()}`;
  
  // ユーザー情報の初期化
  const initialUsers = initializeUsers(seedBase, quizId, isJapanese, quizUserId, replyUserId);
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
    const updatedUsers = initializeUsers(seedBase, quizId, isJapanese, quizUserId, replyUserId);
    setQuizUser(updatedUsers[0]);
    setReplyUser(updatedUsers[1]);
    setCurrentGrokUser(getGrokUser(isJapanese));
  }, [isJapanese, seedBase, quizId, quizUserId, replyUserId]);

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
        timestamp: Date.now()
      };
      
      try {
        // API経由でデータを保存し、シェアID/URLを取得
        const response = await fetch('/api/save-result', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(resultData),
        });
        
        // レスポンスをJSONとして解析
        const result = await response.json();
        
        if (result.success && result.shareUrl) {
          // 正常に処理された場合
          
          // シェアURLをクリップボードにコピー（サポートされている場合）
          try {
            if (navigator.clipboard) {
              await navigator.clipboard.writeText(result.shareUrl);
              alert(isJapanese ? 'シェアURLがクリップボードにコピーされました' : 'Share URL has been copied to clipboard');
            }
          } catch (clipboardError) {
            console.error('Error copying to clipboard:', clipboardError);
          }
          
          // Twitterでシェア（シェアURLを含める）
          const twitterShareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(result.shareUrl)}`;
          window.open(twitterShareUrl, '_blank');
          return;
        }
        
        // Redisが設定されていない場合や他のエラーの場合は従来のシェア方法を使用
        console.warn('Falling back to traditional sharing method:', result);
        const twitterShareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
        window.open(twitterShareUrl, '_blank');
        
      } catch (apiError) {
        console.error('API error:', apiError);
        // APIエラーの場合は従来のシェア方法を使用（URLなし）
        const twitterShareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
        window.open(twitterShareUrl, '_blank');
      }
    } catch (error) {
      console.error('Error in share handling:', error);
      
      // エラーが発生した場合はユーザーに通知し、従来のシェア方法を使用
      alert(isJapanese ? 'シェアの準備中にエラーが発生しました。もう一度お試しください。' : 'An error occurred while preparing to share. Please try again.');
      const twitterShareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
      window.open(twitterShareUrl, '_blank');
    }
  };
  
  return (
    <div className="min-h-screen bg-twitter-dark">
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={`${content} - ${isSharedView ? t.sharedResultView : t.resultTitle}: ${score}/100`} />

        {/* OGP メタタグ - 完全化（一部のプラットフォームでは認識しない場合がある） */}
        <meta property="og:title" content={pageTitle} />
        <meta property="og:site_name" content={t.appTitle} />
        <meta property="og:description" content={isSharedView
          ? `${content} - ${styleName} スタイルでの回答 (${score}/100)`
          : `${content} - ${styleName} (${score}/100)`} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={resultUrl} />
        <meta property="og:image" content={`${process.env.NEXT_PUBLIC_SITE_URL || ''}/og-image-home-new.png?v=2`} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />

        {/* Twitter Card - 完全化 */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@from_garage" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={`${content} - ${styleName} (${score}/100)`} />
        <meta name="twitter:image" content={`${process.env.NEXT_PUBLIC_SITE_URL || ''}/og-image-home-new.png?v=2`} />
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
              postId={`quiz-${seedBase}-${quizId}`}
            />
            
            {/* Grokへのリプライリクエスト */}
            <ReplyRequest
              user={replyUser}
              originalUser={quizUser}
              style={style}
              isJapanese={locale === 'ja'}
              customSeed={`reply-${seedBase}-${styleId}`}
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

                  <PostInteractions seed={`grok-${seedBase}`} />
                </div>
              </div>
            </div>

            {/* Geminiの評価 */}
            <GeminiFeedback feedback={feedbackData} t={t} isJapanese={isJapanese} resultId={seedBase} />

            {/* 参考回答を表示するボタン */}
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
                resultId={seedBase}
                locale={isJapanese ? 'ja' : 'en'}
                t={t}
              />
            )}

            {/* デバッグメッセージ（開発用のみ） */}
            {process.env.NODE_ENV === 'development' && !feedbackData.gemini_answer && (
              <div className="p-4 bg-red-100 text-red-800 border border-red-200 rounded-md mt-2 mb-2">
                <p>Debug: Gemini回答が取得できませんでした。</p>
              </div>
            )}
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
export const getServerSideProps: GetServerSideProps<ResultPageProps> = async (context) => {
  // 言語パラメータのデフォルト設定
  let langParam = 'en'; // デフォルトを英語に設定
  let quizId = 1;
  let styleId = 1;
  let userAnswer = '';
  let quizUserId = '1';
  let replyUserId = '2';
  
  // POSTリクエストの場合のみ処理
  if (context.req.method === 'POST') {
    try {
      // POSTデータを取得
      let formData: URLSearchParams | null = null;
      
      if (context.req.headers['content-type']?.includes('application/x-www-form-urlencoded')) {
        try {
          const bodyBuffer = await new Promise<Buffer>((resolve, reject) => {
            const bodyChunks: Buffer[] = [];
            
            context.req.on('data', (chunk: Buffer) => {
              bodyChunks.push(chunk);
            });
            
            context.req.on('end', () => {
              resolve(Buffer.concat(bodyChunks));
            });
            
            context.req.on('error', (err) => {
              reject(err);
            });
          });
          
          // フォームデータをパース
          formData = new URLSearchParams(bodyBuffer.toString());
          console.log('Form data parsed:', Object.fromEntries(formData.entries()));
          
          // 言語設定を取得
          if (formData.has('locale')) {
            langParam = formData.get('locale') || langParam;
          }
          
          // その他の必要なデータを取得
          if (formData.has('quizId')) {
            quizId = parseInt(formData.get('quizId') || '1', 10);
          }
          
          if (formData.has('styleId')) {
            styleId = parseInt(formData.get('styleId') || '1', 10);
          }
          
          if (formData.has('answer')) {
            userAnswer = formData.get('answer') || '';
          }
          
          if (formData.has('quizUserId')) {
            quizUserId = formData.get('quizUserId') || '1';
          }
          
          if (formData.has('replyUserId')) {
            replyUserId = formData.get('replyUserId') || '2';
          }
        } catch (readError) {
          console.error('Error reading form data:', readError);
        }
      }
    } catch (error) {
      console.error('Error extracting data from POST:', error);
    }
  } else {
    // POSTリクエストでない場合はホームにリダイレクト
    return {
      redirect: {
        destination: '/',
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

    // ホスト名取得
    const host = context.req.headers.host || 'localhost:3000';
    
    // 単純なAPIエンドポイントを使用してOG画像URLを生成
    // Netlify Functionsや依存関係が必要なライブラリを使わないシンプルな実装

    // サーバーサイドでGemini回答を取得
    const geminiAnswer = await getGeminiAnswerServer(quiz, style, locale);

    // サーバーサイドで回答評価
    let feedbackData;
    if (userAnswer) {
      feedbackData = await evaluateAnswerServer(quiz, style, userAnswer, geminiAnswer, locale);
    } else {
      // 評価結果のみ渡す（フィードバック部分だけを含める）
      const accuracyScore = Math.floor(score / 2);
      const styleScore = score - accuracyScore;

      feedbackData = {
        accuracy_score: accuracyScore,
        accuracy_comment: accuracyScore >= 40 ?
          (locale === 'ja' ? "非常に正確な情報提供です。" : "Highly accurate information.") :
          (locale === 'ja' ? "情報の正確性は平均的です。" : "Information accuracy is average."),
        style_score: styleScore,
        style_comment: styleScore >= 40 ?
          (locale === 'ja' ? `「${style.name_ja}」の特徴をよく捉えています。` : `You've captured the characteristics of "${style.name_en}" style well.`) :
          (locale === 'ja' ? `「${style.name_ja}」の特徴をある程度再現しています。` : `You've somewhat reproduced the "${style.name_en}" style.`),
        total_score: score,
        overall_comment: score >= 80 ?
          (locale === 'ja' ? "素晴らしい回答です！" : "Excellent answer!") :
          (locale === 'ja' ? "良い回答です。" : "Good answer."),
        gemini_answer: geminiAnswer
      };
    }

    // 実際のスコアをOG画像のURL生成に使用
    const actualScore = feedbackData.total_score;
    const ogImageUrl = generateOgImageUrl(quizId, styleId, actualScore, locale, host);

    // 結果ページURL生成 - 一時的なダミーURL（実際のシェアURLはAPI経由で生成）
    const resultUrl = `${process.env.NEXT_PUBLIC_SITE_URL || `${host.includes('localhost') ? 'http' : 'https'}://${host}`}/result`;

    // シェアテキスト生成
    const shareText = generateShareText(quiz, style, score, locale, resultUrl);

    // シェアからの訪問判定
    const referer = context.req.headers.referer || '';
    const host_parts = host.split(':')[0];
    const isDirect = context.query.direct === '1';
    const isFromSameOrigin = referer.includes(host_parts);
    const isSharedView = !isDirect && !isFromSameOrigin;

    return {
      props: {
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