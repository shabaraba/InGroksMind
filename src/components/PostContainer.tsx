import React, { useState, useEffect, useRef } from 'react';
import QuizPost from './QuizPost';
import ReplyRequest from './ReplyRequest';
import AnswerForm from './AnswerForm';
import FeedbackDisplay, { FeedbackData } from './FeedbackDisplay';
import ShareButton from './ShareButton';
import quizData from '../data/quizData';
import styleVariations from '../data/styleVariations';
import virtualUsers from '../data/virtualUsers';
import { evaluateAnswer } from '../services/geminiService';
import getTranslation from '../i18n/translations';

const PostContainer: React.FC = () => {
  const [quiz, setQuiz] = useState(quizData[0]);
  const [style, setStyle] = useState(styleVariations[0]);
  const [virtualUser, setVirtualUser] = useState(virtualUsers[0]);
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState<FeedbackData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);
  const t = getTranslation(); // 翻訳を取得

  // ランダムなクイズ、口調、仮想ユーザーを選択
  useEffect(() => {
    const randomQuizIndex = Math.floor(Math.random() * quizData.length);
    const randomStyleIndex = Math.floor(Math.random() * styleVariations.length);
    const randomUserIndex = Math.floor(Math.random() * virtualUsers.length);

    setQuiz(quizData[randomQuizIndex]);
    setStyle(styleVariations[randomStyleIndex]);
    setVirtualUser(virtualUsers[randomUserIndex]);
  }, []);

  const handleSubmit = async (userAnswer: string) => {
    setAnswer(userAnswer);
    setIsLoading(true);

    try {
      // 実際の実装では、ここでGemini APIを呼び出す
      // 今はモックデータを使用
      const result = await evaluateAnswer(quiz, style, userAnswer);
      setFeedback(result);
    } catch (error) {
      console.error('Error evaluating answer:', error);
      // エラー処理
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewQuestion = () => {
    const randomQuizIndex = Math.floor(Math.random() * quizData.length);
    const randomStyleIndex = Math.floor(Math.random() * styleVariations.length);
    const randomUserIndex = Math.floor(Math.random() * virtualUsers.length);

    setQuiz(quizData[randomQuizIndex]);
    setStyle(styleVariations[randomStyleIndex]);
    setVirtualUser(virtualUsers[randomUserIndex]);
    setAnswer('');
    setFeedback(null);
  };

  return (
    <div className="max-w-2xl mx-auto bg-black rounded-lg overflow-hidden border border-gray-800 shadow-lg animate-fade-in">
      <div className="sticky top-0 z-10 bg-black/80 backdrop-blur-md p-3 border-b border-gray-700 flex items-center">
        <h3 className="text-white font-bold">{t.appSubtitle}</h3>
      </div>

      <QuizPost quiz={quiz} virtualUser={virtualUser} />
      <ReplyRequest style={style} virtualUser={virtualUser} />

      {!feedback ? (
        <AnswerForm onSubmit={handleSubmit} isLoading={isLoading} />
      ) : (
        <div className="p-4">
          <div ref={resultRef} className="result-container">
            <div className="tweet-container bg-gray-800/50 rounded-lg">
              <div className="flex">
                <div className="mr-3">
                  <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center">
                    <span className="text-lg font-bold">あなた</span>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center">
                    <span className="font-bold mr-2">{t.yourAnswer}</span>
                    <span className="text-gray-500">@you · {t.justNow}</span>
                  </div>
                  <div className="mt-2">
                    <p className="text-white whitespace-pre-wrap">{answer}</p>
                  </div>
                </div>
              </div>
            </div>

            <FeedbackDisplay feedback={feedback} />
          </div>

          <ShareButton
            quiz={quiz}
            style={style}
            answer={answer}
            feedback={feedback}
            resultRef={resultRef}
          />

          <div className="mt-6 flex justify-center">
            <button
              onClick={handleNewQuestion}
              className="btn-secondary"
            >
              {t.newQuestion}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostContainer;