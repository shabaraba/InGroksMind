import React, { useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import { FeedbackData } from './FeedbackDisplay';
import { QuizItem } from '../data/quizData';
import { StyleVariation } from '../data/styleVariations';
import getTranslation from '../i18n/translations';

interface ShareButtonProps {
  quiz: QuizItem;
  style: StyleVariation;
  answer: string;
  feedback: FeedbackData | null;
  resultRef?: React.RefObject<HTMLDivElement>;
}

const ShareButton: React.FC<ShareButtonProps> = ({ quiz, style, answer, feedback, resultRef }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [shareImageUrl, setShareImageUrl] = useState<string | null>(null);
  const t = getTranslation();

  if (!feedback) return null;

  // 画像を生成してシェアする
  const handleShareWithImage = async () => {
    if (!resultRef?.current) return;

    setIsGenerating(true);
    try {
      // 結果画面のDOM要素をキャプチャ
      const canvas = await html2canvas(resultRef.current, {
        backgroundColor: '#15202b',
        scale: 2, // 高解像度
        logging: false,
        useCORS: true
      });

      // canvasを保存
      canvasRef.current = canvas;

      // DataURLに変換
      const imageUrl = canvas.toDataURL('image/png');
      setShareImageUrl(imageUrl);

      // シェアテキスト
      const shareText = t.shareTextCompact.replace('{totalScore}', feedback.total_score.toString());

      // 画像URLはX APIでは直接共有できないが、テキスト内の説明として含める
      const xShareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;

      // 画像をダウンロード
      const link = document.createElement('a');
      link.download = 'grok-result.png';
      link.href = imageUrl;
      link.click();

      // Xで共有
      window.open(xShareUrl, '_blank');
    } catch (err) {
      console.error('画像の生成中にエラーが発生しました:', err);
      // エラー時はテキストのみでシェア
      handleTextOnlyShare();
    } finally {
      setIsGenerating(false);
    }
  };

  // テキストのみでシェア（フォールバック）
  const handleTextOnlyShare = () => {
    const content = navigator.language.startsWith('ja') ? quiz.content_ja : quiz.content_en;
    const shareText = t.shareText
      .replace('{content}', content.substring(0, 100) + (content.length > 100 ? '...' : ''))
      .replace('{style}', navigator.language.startsWith('ja') ? style.name_ja : style.name_en)
      .replace('{accuracyScore}', feedback.accuracy_score.toString())
      .replace('{styleScore}', feedback.style_score.toString())
      .replace('{totalScore}', feedback.total_score.toString());

    // Xシェア用のURL
    const xShareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
    window.open(xShareUrl, '_blank');
  };

  return (
    <div className="mt-4 flex flex-col items-center">
      <button
        onClick={handleShareWithImage}
        className="btn-primary flex items-center"
        disabled={isGenerating}
      >
        {isGenerating ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {t.generatingImage}
          </>
        ) : (
          <>
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            {t.shareButton}
          </>
        )}
      </button>
      <p className="text-xs text-gray-400 mt-2">{t.imageDownloadNote}</p>
    </div>
  );
};

export default ShareButton;