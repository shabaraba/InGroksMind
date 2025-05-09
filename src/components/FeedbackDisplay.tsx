import React from 'react';
import getTranslation from '../i18n/translations';

export interface FeedbackData {
  accuracy_score: number;
  accuracy_comment: string;
  style_score: number;
  style_comment: string;
  total_score: number;
  overall_comment: string;
}

interface FeedbackDisplayProps {
  feedback: FeedbackData | null;
}

const FeedbackDisplay: React.FC<FeedbackDisplayProps> = ({ feedback }) => {
  if (!feedback) return null;
  const t = getTranslation();

  const getScoreClass = (score: number, max: number) => {
    const percentage = (score / max) * 100;
    if (percentage >= 80) return 'score-high';
    if (percentage >= 60) return 'score-medium';
    return 'score-low';
  };

  const getScoreColor = (score: number, max: number) => {
    const percentage = (score / max) * 100;
    if (percentage >= 80) return 'text-green-500';
    if (percentage >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className="p-4 bg-gray-900 rounded-lg border border-gray-700 mt-6 animate-fade-in">
      <h3 className="text-xl font-bold mb-4 flex items-center">
        <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M9 12L11 14L15 10M12 3L4 5V11.09C4 16.14 7.41 20.85 12 22C16.59 20.85 20 16.14 20 11.09V5L12 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        {t.evaluationTitle}
      </h3>

      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-300">{t.accuracy}</span>
          <span className={`font-bold score-badge ${getScoreClass(feedback.accuracy_score, 50)}`}>
            {t.points.replace('{score}', feedback.accuracy_score.toString())}
          </span>
        </div>
        <p className="text-gray-400 text-sm">{feedback.accuracy_comment}</p>
      </div>

      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-300">{t.styleReproduction}</span>
          <span className={`font-bold score-badge ${getScoreClass(feedback.style_score, 50)}`}>
            {t.points.replace('{score}', feedback.style_score.toString())}
          </span>
        </div>
        <p className="text-gray-400 text-sm">{feedback.style_comment}</p>
      </div>

      <div className="pt-4 border-t border-gray-700">
        <div className="flex justify-between items-center mb-2">
          <span className="text-white font-bold">{t.totalScore}</span>
          <span className={`font-bold text-lg px-3 py-1 rounded-full ${getScoreColor(feedback.total_score, 100)} bg-opacity-20`}>
            {t.totalPoints.replace('{score}', feedback.total_score.toString())}
          </span>
        </div>
        <p className="text-gray-200">{feedback.overall_comment}</p>
      </div>
    </div>
  );
};

export default FeedbackDisplay;