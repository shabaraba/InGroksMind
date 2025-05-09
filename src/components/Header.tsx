import React, { useState, useEffect } from 'react';
import getTranslation from '../i18n/translations';
import AboutModal from './AboutModal';
import UsernameModal from './UsernameModal';
import { saveUsername, getUsername } from '../utils/userStorage';

const Header: React.FC = () => {
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isUsernameModalOpen, setIsUsernameModalOpen] = useState(false);
  const [username, setUsername] = useState<string>('');
  const t = getTranslation();

  // コンポーネント初期化時にローカルストレージからユーザー名を取得
  useEffect(() => {
    const storedUsername = getUsername();
    if (storedUsername) {
      setUsername(storedUsername);
    }
  }, []);

  // ユーザー名を保存
  const handleUsernameSubmit = (newUsername: string) => {
    setUsername(newUsername);
    saveUsername(newUsername);
  };

  return (
    <>
      <header className="sticky top-0 z-10 bg-black/80 backdrop-blur-md p-4 border-b border-gray-700">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold text-white">{t.appTitle}</h1>
          <div className="flex items-center space-x-4">
            {username ? (
              <div
                className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm flex items-center cursor-pointer"
                onClick={() => setIsUsernameModalOpen(true)}
              >
                <span className="mr-1">@{username}</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </div>
            ) : (
              <button
                className="text-blue-400 hover:text-blue-300 text-sm"
                onClick={() => setIsUsernameModalOpen(true)}
              >
                {t.usernameInputTitle}
              </button>
            )}
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

      <UsernameModal
        isOpen={isUsernameModalOpen}
        onClose={() => setIsUsernameModalOpen(false)}
        onSubmit={handleUsernameSubmit}
        initialUsername={username}
      />
    </>
  );
};

export default Header;