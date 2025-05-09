import React, { useState } from 'react';
import getTranslation from '../i18n/translations';
import AboutModal from './AboutModal';

const Header: React.FC = () => {
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const t = getTranslation();

  return (
    <>
      <header className="sticky top-0 z-10 bg-black/80 backdrop-blur-md p-4 border-b border-gray-700">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold text-white">{t.appTitle}</h1>
          <div className="flex space-x-4">
            <span
              className="text-gray-400 hover:text-white cursor-pointer transition-colors"
              onClick={() => setIsAboutOpen(true)}
            >
              {t.about}
            </span>
          </div>
        </div>
      </header>

      <AboutModal
        isOpen={isAboutOpen}
        onClose={() => setIsAboutOpen(false)}
      />
    </>
  );
};

export default Header;