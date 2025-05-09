import React from 'react';
import getTranslation from '../i18n/translations';

interface TwitterLoginButtonProps {
  // 認証ボタンが押されたときのハンドラー
  onLogin?: () => void;
}

const TwitterLoginButton: React.FC<TwitterLoginButtonProps> = ({ onLogin }) => {
  const t = getTranslation();
  
  const handleLogin = () => {
    // 実際の認証処理は Netlify Functions で行うので、
    // ここではモックとして実装しています
    console.log('Twitter login requested');
    if (onLogin) {
      onLogin();
    }
    
    // 実際の実装では次のようにリダイレクトします
    // window.location.href = '/api/auth/twitter';
    
    // モック実装では代わりにアラートを表示
    alert(t.twitterLoginNotImplemented);
  };

  return (
    <button
      className="bg-blue-400 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded-full flex items-center"
      onClick={handleLogin}
    >
      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
      {t.twitterLoginButton}
    </button>
  );
};

export default TwitterLoginButton;