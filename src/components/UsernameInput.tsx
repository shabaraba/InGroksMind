import React, { useState } from 'react';
import getTranslation from '../i18n/translations';

interface UsernameInputProps {
  onSubmit: (username: string) => void;
  initialUsername?: string;
}

const UsernameInput: React.FC<UsernameInputProps> = ({ onSubmit, initialUsername = '' }) => {
  const [username, setUsername] = useState(initialUsername);
  const t = getTranslation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      onSubmit(username.trim());
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-4 max-w-md mx-auto mt-4">
      <h3 className="text-white text-lg font-bold mb-3">{t.usernameInputTitle}</h3>
      <p className="text-gray-300 mb-4">{t.usernameInputDescription}</p>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="username" className="block text-gray-300 mb-2">
            {t.usernameInputLabel}
          </label>
          <div className="flex">
            <span className="bg-gray-700 text-gray-300 px-3 py-2 rounded-l-md flex items-center">
              @
            </span>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="input-field flex-1 rounded-l-none"
              placeholder={t.usernameInputPlaceholder}
              required
            />
          </div>
        </div>
        
        <div className="flex justify-end">
          <button
            type="submit"
            className="btn-primary"
            disabled={!username.trim()}
          >
            {t.usernameInputSubmit}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UsernameInput;