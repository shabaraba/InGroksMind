import React, { useContext } from 'react';
import { getTranslation } from '../i18n/translations';
import { LanguageContext } from '../pages/_app';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  const { isJapanese } = useContext(LanguageContext);
  const t = getTranslation();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
      <div className="relative bg-twitter-darker border border-gray-700 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-twitter-darker z-10 p-4 border-b border-gray-700 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">{t.aboutTitle}</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-6">
          <p className="text-white mb-6">
            {t.aboutDescription}
          </p>
          
          <h3 className="text-lg font-semibold text-white mb-4">
            {t.aboutHowToPlay}
          </h3>
          <ol className="list-decimal pl-5 text-white space-y-2 mb-6">
            <li>{t.aboutStep1}</li>
            <li>{t.aboutStep2}</li>
            <li>{t.aboutStep3}</li>
            <li>{t.aboutStep4}</li>
          </ol>
          
          <h3 className="text-lg font-semibold text-white mb-4">
            {t.aboutTechnology}
          </h3>
          <div className="flex flex-wrap gap-2 mb-6">
            {["Next.js", "TypeScript", "TailwindCSS", "Gemini API", "Canvas API", "Vercel"].map((tech) => (
              <span key={tech} className="bg-gray-700 text-white px-2 py-1 rounded text-sm">
                {tech}
              </span>
            ))}
          </div>
          
          <h3 className="text-lg font-semibold text-white mb-4">
            {t.aboutLinks}
          </h3>
          <div className="flex flex-wrap gap-4 text-twitter-blue">
            <a
              href="https://github.com/shabaraba/InGrokMind"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline"
            >
              {t.aboutGithub}
            </a>
            <a
              href="https://blog.shaba.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline"
            >
              {t.aboutBlog}
            </a>
            <a
              href="https://x.com/shaba_dev"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline"
            >
              {t.aboutX}
            </a>
          </div>
          
          <div className="mt-8 space-y-3">
            <p className="text-sm text-gray-400">
              {t.aboutDisclaimer}
            </p>
            <p className="text-sm text-amber-500 border border-amber-500/30 bg-amber-500/10 p-3 rounded">
              {t.resultDisclaimer || "※シェアされた結果ページは一時的なものです。アプリの更新やデプロイにより、過去の結果ページにアクセスできなくなる場合があります。重要な結果はスクリーンショットなどで保存することをお勧めします。"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutModal;