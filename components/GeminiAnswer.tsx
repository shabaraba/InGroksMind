import React from 'react';
import { GeminiAnswer as GeminiAnswerType } from '../utils/types';
import Image from 'next/image';

interface GeminiAnswerProps {
  geminiAnswer: GeminiAnswerType;
  locale: string;
}

const GeminiAnswer: React.FC<GeminiAnswerProps> = ({ geminiAnswer, locale }) => {
  const { content, avatar_url } = geminiAnswer;
  
  const defaultAvatarUrl = "https://lh3.googleusercontent.com/a/ACg8ocL6It7Up3pLC6Zexk19oNK4UQTd_iIz5eXXHxWjZrBxH_cN=s48-c";
  const avatarSrc = avatar_url || defaultAvatarUrl;
  
  // メッセージのタイトルを言語に応じて設定
  const messageTitle = locale === 'ja' 
    ? "Geminiの回答例" 
    : "Gemini's Example Answer";
    
  return (
    <div className="mt-6 bg-gray-50 rounded-lg p-4 border border-gray-200">
      <div className="flex items-center mb-3">
        <div className="relative h-10 w-10 overflow-hidden rounded-full mr-3">
          <Image 
            src={avatarSrc}
            alt="Gemini"
            width={40}
            height={40}
            className="object-cover"
          />
        </div>
        <div>
          <h3 className="font-medium text-gray-900">{messageTitle}</h3>
          <p className="text-xs text-gray-500">
            {locale === 'ja' ? "このお題に対するGeminiの回答" : "Gemini's answer to this question"}
          </p>
        </div>
      </div>
      
      <div className="prose prose-sm max-w-none">
        <p className="whitespace-pre-line text-gray-700">{content}</p>
      </div>
      
      <div className="mt-3 text-xs text-gray-400 text-right">
        {locale === 'ja' 
          ? "※これはGeminiが同じ条件で回答した例です。参考として表示しています。" 
          : "※This is an example of how Gemini answered under the same conditions. Shown for reference."}
      </div>
    </div>
  );
};

export default GeminiAnswer;