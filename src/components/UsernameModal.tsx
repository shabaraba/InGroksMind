import React from 'react';
import UsernameInput from './UsernameInput';
import getTranslation from '../i18n/translations';

interface UsernameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (username: string) => void;
  initialUsername?: string;
}

const UsernameModal: React.FC<UsernameModalProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit,
  initialUsername = ''
}) => {
  const t = getTranslation();

  if (!isOpen) return null;

  const handleSubmit = (username: string) => {
    onSubmit(username);
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 modal-overlay"
      onClick={onClose}
    >
      <div 
        className="bg-gray-800 rounded-xl shadow-xl max-w-lg w-full overflow-y-auto modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-white">{t.usernameInputTitle}</h2>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          
          <UsernameInput onSubmit={handleSubmit} initialUsername={initialUsername} />
        </div>
      </div>
    </div>
  );
};

export default UsernameModal;