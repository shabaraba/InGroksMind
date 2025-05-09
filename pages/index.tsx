import React, { useState, useEffect, useContext } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { getTranslation } from '../i18n/translations';
import { quizData } from '../data/quizData';
import { styleVariations } from '../data/styleVariations';
import { evaluateAnswer, generateResultId } from '../utils/geminiService';
import { FeedbackData } from '../utils/types';
import { LanguageContext } from './_app';
import { getRandomUser, getGrokUser, virtualUsers } from '../data/virtualUsers';
import Post from '../components/Post';
import ReplyRequest from '../components/ReplyRequest';
import LanguageSwitcher from '../components/LanguageSwitcher';
import AboutModal from '../components/AboutModal';
import * as ga from '../utils/analytics';

// ホームページコンポーネント
export default function Home() {
  const router = useRouter();
  const { isJapanese } = useContext(LanguageContext);
  const t = getTranslation();
  
  // ランダムなクイズとスタイルIDを選択
  const [quizId, setQuizId] = useState(1);
  const [styleId, setStyleId] = useState(1);
  const [answer, setAnswer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);

  // 仮想ユーザー
  const [quizUser, setQuizUser] = useState(getRandomUser(isJapanese));
  const [replyUser, setReplyUser] = useState(getRandomUser(isJapanese));
  const [currentGrokUser, setCurrentGrokUser] = useState(getGrokUser(isJapanese));
  
  // 初期化時にランダムな問題とスタイルを選択
  useEffect(() => {
    const randomQuizId = Math.floor(Math.random() * quizData.length) + 1;
    const randomStyleId = Math.floor(Math.random() * styleVariations.length) + 1;

    setQuizId(randomQuizId);
    setStyleId(randomStyleId);

    // 必ず別の仮想ユーザーを選択するヘルパー関数（ユーザーIDを使用）
    const selectDistinctUsers = () => {
      // virtualUsersからユーザーIDの配列を取得
      const userIds = virtualUsers.map(user => user.id);

      // ユーザーIDのペアを作成（必ず異なるIDのペア）
      const pairs = [
        [1, 2], // IDが1と2のユーザー
        [2, 3], // IDが2と3のユーザー
        [3, 4], // IDが3と4のユーザー
        [4, 5], // IDが4と5のユーザー
        [5, 1]  // IDが5と1のユーザー
      ];

      // ランダムに組み合わせを選択
      const randomPair = pairs[Math.floor(Math.random() * pairs.length)];

      // 選択したペアのIDに対応するユーザーを取得
      const user1 = { ...virtualUsers.find(user => user.id === randomPair[0])! };
      const user2 = { ...virtualUsers.find(user => user.id === randomPair[1])! };

      // 言語に合わせて名前を設定
      user1.name = isJapanese ? user1.name_ja : user1.name_en;
      user2.name = isJapanese ? user2.name_ja : user2.name_en;

      return [user1, user2];
    };

    // 別々のユーザーを選択
    const [newQuizUser, newReplyUser] = selectDistinctUsers();

    setQuizUser(newQuizUser);
    setReplyUser(newReplyUser);
  }, [isJapanese]);
  
  // クイズとスタイルの情報を取得
  const quiz = quizData.find(q => q.id === quizId) || quizData[0];
  const style = styleVariations.find(s => s.id === styleId) || styleVariations[0];
  
  // 言語に応じたコンテンツを取得
  const [content, setContent] = useState('');
  const [styleName, setStyleName] = useState('');

  // 言語が変更されたときにコンテンツを更新
  useEffect(() => {
    setContent(isJapanese ? quiz.content_ja : quiz.content_en);
    setStyleName(isJapanese ? style.name_ja : style.name_en);
  }, [isJapanese, quiz, style]);

  // 言語が変更されたときにユーザー名を更新
  useEffect(() => {
    // 現在のユーザーのIDを保持しつつ、新しい言語で名前を更新
    const updatedQuizUser = getRandomUser(isJapanese);
    const updatedReplyUser = getRandomUser(isJapanese);

    // 既存のユーザーと同じIDのユーザーを探して言語を更新
    const matchingQuizUser = virtualUsers.find(u => u.id === quizUser.id);
    const matchingReplyUser = virtualUsers.find(u => u.id === replyUser.id);

    if (matchingQuizUser) {
      setQuizUser({
        ...quizUser,
        name: isJapanese ? matchingQuizUser.name_ja : matchingQuizUser.name_en
      });
    }

    if (matchingReplyUser) {
      setReplyUser({
        ...replyUser,
        name: isJapanese ? matchingReplyUser.name_ja : matchingReplyUser.name_en
      });
    }

    // Grokユーザーも更新
    setCurrentGrokUser(getGrokUser(isJapanese));
  }, [isJapanese]);
  
  // 回答提出時の処理
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (answer.trim() === '' || isSubmitting) return;

    setIsSubmitting(true);
    try {
      // 回答評価APIを呼び出し（言語情報も渡し、Geminiの回答も取得する）
      const feedback = await evaluateAnswer(quiz, style, answer, isJapanese ? 'ja' : 'en', true);

      // 結果ID生成
      const resultId = generateResultId(quizId, styleId, feedback.total_score);

      // Google Analyticsにイベントを送信
      ga.trackAnswerSubmission(feedback.total_score, isJapanese ? style.name_ja : style.name_en);

      // パラメータを設定（直接アクセスフラグを含む）
      const params = new URLSearchParams({
        answer: answer,
        lang: isJapanese ? 'ja' : 'en',
        quizUserId: quizUser.id.toString(),
        replyUserId: replyUser.id.toString(),
        direct: '1', // 自分で回答した場合は直接アクセスとマーク
        has_gemini: feedback.gemini_answer ? '1' : '0' // Gemini回答があるかどうかのフラグ
      });

      // 結果ページにリダイレクト (言語パラメータとユーザーIDを含める)
      router.push(`/result/${resultId}?${params.toString()}`);
    } catch (error) {
      console.error('Error submitting answer:', error);
      alert('回答の評価中にエラーが発生しました。もう一度お試しください。');
      setIsSubmitting(false);
    }
  };
  
  // 新しい問題を取得
  const handleNewQuestion = () => {
    const randomQuizId = Math.floor(Math.random() * quizData.length) + 1;
    const randomStyleId = Math.floor(Math.random() * styleVariations.length) + 1;

    setQuizId(randomQuizId);
    setStyleId(randomStyleId);
    setAnswer('');

    // 必ず別の仮想ユーザーを選択するヘルパー関数（ユーザーIDを使用）
    const selectDistinctUsers = () => {
      // ユーザーIDのペアを作成（必ず異なるIDのペア）
      const pairs = [
        [1, 2], // IDが1と2のユーザー
        [2, 3], // IDが2と3のユーザー
        [3, 4], // IDが3と4のユーザー
        [4, 5], // IDが4と5のユーザー
        [5, 1]  // IDが5と1のユーザー
      ];

      // ランダムに組み合わせを選択
      const randomPair = pairs[Math.floor(Math.random() * pairs.length)];

      // 選択したペアのIDに対応するユーザーを取得
      const user1 = { ...virtualUsers.find(user => user.id === randomPair[0])! };
      const user2 = { ...virtualUsers.find(user => user.id === randomPair[1])! };

      // 言語に合わせて名前を設定
      user1.name = isJapanese ? user1.name_ja : user1.name_en;
      user2.name = isJapanese ? user2.name_ja : user2.name_en;

      return [user1, user2];
    };

    // 別々のユーザーを選択
    const [newQuizUser, newReplyUser] = selectDistinctUsers();

    setQuizUser(newQuizUser);
    setReplyUser(newReplyUser);

    // 新しいクイズの内容を設定（useEffectが実行されるが、即時更新も行う）
    const newQuiz = quizData.find(q => q.id === randomQuizId) || quizData[0];
    const newStyle = styleVariations.find(s => s.id === randomStyleId) || styleVariations[0];
    setContent(isJapanese ? newQuiz.content_ja : newQuiz.content_en);
    setStyleName(isJapanese ? newStyle.name_ja : newStyle.name_en);
  };
  
  return (
    <div className="min-h-screen bg-twitter-dark">
      <Head>
        <title>{t.appTitle}</title>
        <meta name="description" content={t.appDescription} />
        <link rel="icon" href="/favicon.ico" />
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
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">{t.appTitle}</h2>
            <p className="text-gray-400">
              {t.appDescription}
            </p>
          </div>
          
          <div className="bg-twitter-darker rounded-lg border border-gray-700 overflow-hidden mb-8">
            {/* 元の投稿 - クイズIDとスタイルIDの組み合わせを固定シードに */}
            <Post
              user={quizUser}
              content={content}
              postId={`quiz-${quizId}-${styleId}`}
            />
            
            {/* Grokへのリプライリクエスト - 固定シードを追加 */}
            <ReplyRequest
              user={replyUser}
              originalUser={quizUser}
              style={style}
              isJapanese={isJapanese}
              customSeed={`reply-${quizId}-${styleId}`}
            />
            
            {/* Grokになりきって回答するフォーム */}
            <div className="p-4 pl-12">
              <div className="flex items-start">
                <div
                  className="mr-3 flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-white text-lg font-bold"
                  style={{ backgroundColor: currentGrokUser.avatar }}
                >
                  {currentGrokUser.name.charAt(0)}
                </div>
                <div className="flex-grow">
                  <div className="flex items-start mb-2">
                    <div>
                      <h3 className="font-bold text-white">{currentGrokUser.name}</h3>
                      <p className="text-gray-400 text-sm">@{currentGrokUser.username}</p>
                    </div>
                  </div>
                  
                  <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                      <p className="text-gray-400 text-sm mb-2">
                        {isJapanese ? '返信先:' : 'Replying to:'} <span className="text-twitter-blue">@{replyUser.username}</span>
                      </p>
                      <textarea
                        className="input-field min-h-[120px]"
                        placeholder={t.placeholderAnswer}
                        value={answer}
                        onChange={(e) => setAnswer(e.target.value)}
                        disabled={isSubmitting}
                      />
                    </div>
                    <div className="flex justify-between">
                      <button
                        type="button"
                        onClick={handleNewQuestion}
                        className="btn-secondary"
                      >
                        {t.newQuestion}
                      </button>
                      <button
                        type="submit"
                        className="btn-primary"
                        disabled={answer.trim() === '' || isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            {t.buttonEvaluating}
                          </>
                        ) : (
                          t.buttonSubmit
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
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
}