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