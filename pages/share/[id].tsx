import React, { useContext, useEffect, useState } from 'react';
import { GetServerSideProps, NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { quizData } from '../../data/quizData';
import { styleVariations } from '../../data/styleVariations';
import { getTranslationForLocale } from '../../i18n/translations';
import { getResultFromKV } from '../../utils/kvStorage';
import { ResultPageData, FeedbackData } from '../../utils/types';
import { generateShareText } from '../../utils/shareUtils';
import { getTimestampParam } from '../../utils/simpleImageUtils';
import { LanguageContext } from '../_app';
import { initializeUsers } from '../../utils/userHelpers';
import { getGrokUser } from '../../data/virtualUsers';
import Post from '../../components/Post';
import ReplyRequest from '../../components/ReplyRequest';
import LanguageSwitcher from '../../components/LanguageSwitcher';
import AboutModal from '../../components/AboutModal';
import PostInteractions from '../../components/PostInteractions';
import GeminiAnswerDisplay from '../../components/GeminiAnswerDisplay';
import GeminiFeedback from '../../components/GeminiFeedback';
import * as ga from '../../utils/analytics';

// シェアページのプロパティ
interface SharePageProps {
  shareId: string;
  resultData: ResultPageData | null;
  locale: string;
  error?: string;
}

const SharePage: NextPage<SharePageProps> = ({
  shareId,
  resultData,
  locale,
  error
}) => {
  const router = useRouter();
  const { isJapanese, setLanguage } = useContext(LanguageContext);
  const [t, setT] = useState(getTranslationForLocale(locale));
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  
  // エラーチェック
  if (error || !resultData) {
    return (
      <div className="min-h-screen bg-twitter-dark flex items-center justify-center">
        <div className="bg-twitter-darker p-8 rounded-lg border border-gray-700 max-w-md w-full">
          <h1 className="text-xl font-bold text-white mb-4">{t.shareError}</h1>
          <p className="text-gray-300 mb-6">{t.shareNotFound}</p>
          <Link href="/" className="btn-primary block text-center">
            {t.returnToHomepage}
          </Link>
        </div>
      </div>
    );
  }

  const { quizId, styleId, answer, feedback, timestamp } = resultData;

  // クイズとスタイルの情報を取得
  const quiz = quizData.find(q => q.id === quizId) || quizData[0];
  const style = styleVariations.find(s => s.id === styleId) || styleVariations[0];
  const score = feedback.total_score;

  // 初期レンダリング時に言語設定を適用（元の回答言語を優先）
  useEffect(() => {
    // 保存された回答言語があればそれを優先する
    if (resultData?.answerLanguage && (resultData.answerLanguage === 'ja' || resultData.answerLanguage === 'en')) {
      setLanguage(resultData.answerLanguage);
    } else if (locale === 'ja' || locale === 'en') {
      setLanguage(locale);
    }
  }, [locale, setLanguage, resultData?.answerLanguage]);

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
  
  // ページタイトル（言語変更時に更新）
  const [pageTitle, setPageTitle] = useState('');
  useEffect(() => {
    setPageTitle(`${t.appTitle} - ${t.sharedResultView} (${score}/100)`);
  }, [t, score]);
  
  // ユーザー情報の初期化 (固定のシード値を使用)
  const seedBase = `share-${shareId}`;
  const initialUsers = initializeUsers(seedBase, quizId, isJapanese);
  const [quizUser, setQuizUser] = useState(initialUsers[0]);
  const [replyUser, setReplyUser] = useState(initialUsers[1]);
  const [currentGrokUser, setCurrentGrokUser] = useState(getGrokUser(isJapanese));
  const [showReferencePost, setShowReferencePost] = useState(true); // シェアページでは常に表示

  // 言語が変更されたときにユーザー名を更新
  useEffect(() => {
    // 言語に合わせてユーザー情報を更新
    const updatedUsers = initializeUsers(seedBase, quizId, isJapanese);
    setQuizUser(updatedUsers[0]);
    setReplyUser(updatedUsers[1]);
    setCurrentGrokUser(getGrokUser(isJapanese));
  }, [isJapanese, seedBase, quizId]);
  
  // Xでシェアする
  const handleShare = () => {
    ga.trackShareResult(score, 'twitter');
    
    // シェアURL
    const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
    
    // シェアテキスト生成
    const shareText = generateShareText(quiz, style, score, isJapanese ? 'ja' : 'en', shareUrl);
    
    // Twitterシェア
    const twitterShareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
    window.open(twitterShareUrl, '_blank');
  };
  
  return (
    <div className="min-h-screen bg-twitter-dark">
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={`${content} - ${t.sharedResultView}: ${score}/100`} />

        {/* OGP メタタグ */}
        <meta property="og:title" content={pageTitle} />
        <meta property="og:site_name" content={t.appTitle} />
        <meta property="og:description" content={`${content} - ${styleName} (${score}/100)`} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${process.env.NEXT_PUBLIC_SITE_URL || 'https://in-grok-mind.vercel.app'}/share/${shareId}`} />
        <meta property="og:image" content={`${process.env.NEXT_PUBLIC_SITE_URL || 'https://in-grok-mind.vercel.app'}/og-image-home-new.png?${getTimestampParam()}`} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@from_garage" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={`${content} - ${styleName} (${score}/100)`} />
        <meta name="twitter:image" content={`${process.env.NEXT_PUBLIC_SITE_URL || 'https://in-grok-mind.vercel.app'}/og-image-home-new.png?${getTimestampParam()}`} />
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
            {t.sharedResultView}
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
                    {answer}
                  </div>

                  <PostInteractions seed={`grok-${seedBase}`} />
                </div>
              </div>
            </div>

            {/* Geminiの評価 */}
            <GeminiFeedback feedback={feedback} t={t} isJapanese={isJapanese} resultId={shareId} />

            {/* Geminiの回答表示 */}
            {feedback.gemini_answer && showReferencePost && (
              <GeminiAnswerDisplay
                geminiAnswer={feedback.gemini_answer}
                resultId={shareId}
                locale={isJapanese ? 'ja' : 'en'}
                t={t}
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
              {t.tryGrokYourself}
            </button>
          </div>

          {/* 結果ページの警告 */}
          <div className="mt-10 p-4 border border-amber-500/30 bg-amber-500/10 rounded-lg text-sm text-amber-500">
            <p>{t.resultDisclaimer}</p>
          </div>
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
export const getServerSideProps: GetServerSideProps = async (context) => {
  // 言語パラメータ取得
  const langParam = context.query.lang as string;
  const locale = langParam === 'ja' ? 'ja' : (langParam === 'en' ? 'en' : (context.locale || 'en'));
  const langQuery = locale ? `?lang=${locale}` : '';

  // IDを取得
  const { id } = context.params || {};
  if (!id || typeof id !== 'string') {
    // 存在しないIDの場合はホームにリダイレクト
    return {
      redirect: {
        destination: `/${langQuery}`,
        permanent: false,
      },
    };
  }

  try {
    // KVストアから結果データを取得
    const resultData = await getResultFromKV(id);
    
    if (!resultData) {
      // 結果が見つからない場合
      return {
        props: {
          shareId: id,
          resultData: null,
          locale,
          error: 'Result not found'
        }
      };
    }
    
    // 結果データをプロパティとして返す
    return {
      props: {
        shareId: id,
        resultData,
        locale
      }
    };
  } catch (error) {
    console.error('Error in getServerSideProps:', error);
    // エラー発生時はエラーメッセージを返す
    return {
      props: {
        shareId: id,
        resultData: null,
        locale,
        error: 'Failed to load result data'
      }
    };
  }
};

export default SharePage;