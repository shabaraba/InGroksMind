import React from 'react';
import { FeedbackData } from '../utils/types';
import PostInteractions from './PostInteractions';

interface GeminiFeedbackProps {
  feedback: FeedbackData;
  t: any;
  isJapanese: boolean;
  resultId: string;
}

const GeminiFeedback: React.FC<GeminiFeedbackProps> = ({ 
  feedback, 
  t, 
  isJapanese, 
  resultId 
}) => {
  // スコアに応じたカラークラスを取得
  const getScoreClass = (score: number, max: number = 50) => {
    const percentage = (score / max) * 100;
    if (percentage >= 80) return 'score-high';
    if (percentage >= 60) return 'score-medium';
    return 'score-low';
  };

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

export default GeminiFeedback;