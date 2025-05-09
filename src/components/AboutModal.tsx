import React from 'react';
import getTranslation from '../i18n/translations';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  const t = getTranslation();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 modal-overlay" onClick={onClose}>
      <div
        className="bg-gray-800 rounded-xl shadow-xl max-w-lg w-full overflow-y-auto modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-white">{t.aboutTitle}</h2>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          
          <div className="text-gray-300 space-y-4">
            <p>{t.aboutDescription}</p>
            
            <div>
              <h3 className="text-white font-bold mb-2">{t.aboutHowToPlay}</h3>
              <ol className="list-decimal pl-5 space-y-2">
                <li>{t.aboutStep1}</li>
                <li>{t.aboutStep2}</li>
                <li>{t.aboutStep3}</li>
                <li>{t.aboutStep4}</li>
              </ol>
            </div>
            
            <div>
              <h3 className="text-white font-bold mb-2">{t.aboutTechnology}</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>React + TypeScript</li>
                <li>Tailwind CSS</li>
                <li>Google Gemini API</li>
                <li>Netlify Functions</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-white font-bold mb-2">{t.aboutLinks}</h3>
              <div className="flex flex-wrap gap-4">
                <a
                  href="https://github.com/shabaraba/BeGrok"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-blue-400 hover:text-blue-300 transition-colors"
                >
                  <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                  </svg>
                  {t.aboutGithub}
                </a>
                <a
                  href="https://blog.shaba.dev"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-blue-400 hover:text-blue-300 transition-colors"
                >
                  <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19.993 8v1h-2v11h-14v-11h-2v-1h18zm-14 10h12v-9h-12v9zm6-14h-2v-1h2v1zm0 2h-2v-1h2v1zm0 2h-2v-1h2v1zm-4-4h-2v-1h2v1zm0 2h-2v-1h2v1zm0 2h-2v-1h2v1zm8-4h-2v-1h2v1zm0 2h-2v-1h2v1zm0 2h-2v-1h2v1z"/>
                  </svg>
                  {t.aboutBlog}
                </a>
                <a
                  href="https://x.com/shabaraba"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-blue-400 hover:text-blue-300 transition-colors"
                >
                  <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                  {t.aboutX}
                </a>
              </div>
            </div>

            <div className="border-t border-gray-700 pt-4">
              <p className="text-sm text-gray-400">{t.aboutDisclaimer}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutModal;