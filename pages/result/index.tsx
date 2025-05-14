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
        timestamp: Date.now(),
        answerLanguage: isJapanese ? 'ja' : 'en', // 回答時の言語設定を保存
        quizUserId: quizUser.id, // クイズユーザーIDを保存
        replyUserId: replyUser.id // リプライユーザーIDを保存
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
          
          // シェアURLを使って新しいシェアテキストを生成
          const updatedShareText = generateShareText(quiz, style, score, isJapanese ? 'ja' : 'en', result.shareUrl);
          
          // シェアテキストにはすでにURLが含まれているので、URLパラメータは追加しない
          const twitterShareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(updatedShareText)}`;
          window.open(twitterShareUrl, '_blank');
          return;
        }
        
        // Redisが設定されていない場合や他のエラーの場合は従来のシェア方法を使用
        console.warn('Falling back to traditional sharing method:', result);
        // URLなしのシェアテキストを生成（コンパクト版）
        const fallbackShareText = generateShareText(quiz, style, score, isJapanese ? 'ja' : 'en');
        const twitterShareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(fallbackShareText)}`;
        window.open(twitterShareUrl, '_blank');
        
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
              isJapanese={isJapanese}
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

export const getServerSideProps: GetServerSideProps = async (context) => {
  // URLパラメータからクイズIDとスタイルIDを取得
  let quizId = 1;
  let styleId = 1;
  let userAnswer = '';
  let langParam = 'ja';
  
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
        } catch (readError) {
          console.error('Error reading form data:', readError);
        }
      }
    } catch (error) {
      console.error('Error extracting data from POST:', error);
    }
  } else {
    // クエリパラメータから取得 (GET)
    const { quizId: qId, styleId: sId, answer: ans, lang } = context.query;
    
    if (qId) quizId = parseInt(qId as string, 10);
    if (sId) styleId = parseInt(sId as string, 10);
    if (ans) userAnswer = ans as string;
    if (lang) langParam = lang as string;
    
    // クエリパラメータがない場合はホームにリダイレクト
    if (!qId || !sId || !ans) {
      // シェアのプロトタイプパラメータがあれば展開してみる
      const shortParams = context.query.p as string;
      if (shortParams) {
        try {
          // パラメータを展開
          const expandedParams = expandUrlParams(shortParams);
          const { quizId: expandedQid, styleId: expandedSid, answer: expandedAns } = expandedParams;
          
          if (expandedQid && expandedSid && expandedAns) {
            return {
              redirect: {
                destination: `/result?quizId=${expandedQid}&styleId=${expandedSid}&answer=${encodeURIComponent(expandedAns)}${lang ? `&lang=${lang}` : ''}`,
                permanent: false,
              },
            };
          }
        } catch (error) {
          console.error('Error expanding params:', error);
        }
      }
      
      // それでもパラメータがない場合はホームにリダイレクト
      return {
        redirect: {
          destination: `/${langParam ? `?lang=${langParam}` : ''}`,
          permanent: false,
        },
      };
    }
  }
  
  // 明示的に 'ja' または 'en' のみを許可
  const locale = langParam === 'ja' ? 'ja' : 'en';
  const langQuery = `?lang=${locale}`;

  try {
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
    
    // ユーザー回答が無い場合はホームにリダイレクト
    if (!userAnswer) {
      return {
        redirect: {
          destination: `/${langQuery}`,
          permanent: false,
        },
      };
    }
    
    // クイズとスタイルの内容（ローカル変数）
    const quizContent = locale === 'ja' ? quiz.content_ja : quiz.content_en;
    const styleText = locale === 'ja' ? style.name_ja : style.name_en;
    
    // サーバーサイドでGemini回答を取得（エラー発生時はフォールバック）
    let geminiAnswer;
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
      await getGeminiReferenceAnswerServer(quiz, style, locale);
    } catch (error) {
      console.error('Failed to get reference answer:', error);
    }

    // サーバーサイドで回答評価（エラー発生時はフォールバック）
    let feedbackData;
    let resultScore = 0;
    
    try {
      feedbackData = await evaluateAnswerServer(quiz, style, userAnswer, geminiAnswer, locale);
      resultScore = feedbackData.total_score;
    } catch (error) {
      console.error('Failed to evaluate answer:', error);
      
      // エラーが発生した場合はモックのフィードバックを生成
      const errorMessage = locale === 'ja'
        ? '※APIエラーのため、モックのフィードバックを表示しています。'
        : '※Showing mock feedback due to API error.';
      
      // ランダムなスコアを生成するモックデータ
      const accuracyScore = Math.floor(Math.random() * 30) + 20; // 20-50点
      const styleScore = Math.floor(Math.random() * 30) + 20; // 20-50点
      const totalScore = accuracyScore + styleScore;
      
      feedbackData = {
        accuracy_score: accuracyScore,
        accuracy_comment: locale === 'ja'
          ? `${errorMessage} 内容の正確性は平均的です。`
          : `${errorMessage} The accuracy is average.`,
        style_score: styleScore,
        style_comment: locale === 'ja'
          ? `${errorMessage} スタイルの模倣は部分的にできています。`
          : `${errorMessage} The style imitation is partially accomplished.`,
        total_score: totalScore,
        overall_comment: locale === 'ja'
          ? `${errorMessage} 全体的には可もなく不可もない回答です。`
          : `${errorMessage} Overall, this is a mediocre answer.`,
        gemini_answer: geminiAnswer
      };
      
      resultScore = totalScore; // モックのスコア
    }

    // 実際のスコアをOG画像のURL生成に使用
    const ogImageUrl = generateOgImageUrl(quizId, styleId, resultScore, locale);

    // 結果ページURL生成 - 一時的なダミーURL（実際のシェアURLはAPI経由で生成）
    const resultUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://in-grok-mind.shaba.dev'}/result`;

    // シェアテキスト生成
    const shareText = generateShareText(quiz, style, resultScore, locale, resultUrl);

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
        score: resultScore,
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