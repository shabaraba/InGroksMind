import React from 'react';
import { GeminiAnswer as GeminiAnswerType } from '../utils/types';
import Image from 'next/image';
import PostInteractions from './PostInteractions';

interface GeminiAnswerDisplayProps {
  geminiAnswer: GeminiAnswerType;
  resultId: string;
  locale: string;
  t: any; // 翻訳オブジェクト
}

const GeminiAnswerDisplay: React.FC<GeminiAnswerDisplayProps> = ({ 
  geminiAnswer, 
  resultId, 
  locale,
  t
}) => {
  const { content, avatar_url } = geminiAnswer;
  
  // Geminiのアバターと情報
  const geminiAvatar = "#EA4335"; // Google Redを使用
  const geminiName = "Gemini";
  const geminiUsername = "gemini";
  const isJapanese = locale === 'ja';
  
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
            {isJapanese ? '参考回答:' : 'Reference answer:'}
          </p>

          <div className="text-white whitespace-pre-wrap mb-4">
            {content}
          </div>

          {/* インタラクションボタン - 結果IDとgeminiをシードとして使用 */}
          <PostInteractions seed={`gemini-answer-${resultId}`} />
        </div>
      </div>
    </div>
  );
};

export default GeminiAnswerDisplay;