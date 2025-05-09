import React, { useContext } from 'react';
import { useRouter } from 'next/router';
import { LanguageContext } from '../pages/_app';

const LanguageSwitcher: React.FC = () => {
  const router = useRouter();
  const { language, setLanguage } = useContext(LanguageContext);

  // 現在のURLに言語パラメータを追加して再読み込み
  const switchLanguage = (newLang: string) => {
    // 現在のURLパラメータを取得
    const urlParams = new URLSearchParams(window.location.search);

    // 言語パラメータを設定
    urlParams.set('lang', newLang);

    // 現在のパスを取得
    const path = router.pathname;

    // 現在のパスパラメータを取得
    const query = { ...router.query };
    delete query.lang; // router.queryからlangを削除（URLSearchParamsに追加したため）

    // コンテキストの言語を更新
    setLanguage(newLang);

    // 新しいURLでページを更新
    // [id]などの動的パラメータを保持するために別のアプローチを使用
    const newQuery = { ...query, lang: newLang };
    router.push({
      pathname: path,
      query: newQuery,
    }, undefined, { shallow: true });
  };
  
  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={() => switchLanguage('en')}
        className={`px-2 py-1 rounded ${language === 'en' ? 'bg-twitter-blue text-white' : 'bg-gray-700 text-gray-300'}`}
        aria-label="Switch to English"
      >
        EN
      </button>
      <button
        onClick={() => switchLanguage('ja')}
        className={`px-2 py-1 rounded ${language === 'ja' ? 'bg-twitter-blue text-white' : 'bg-gray-700 text-gray-300'}`}
        aria-label="日本語に切り替え"
      >
        JP
      </button>
    </div>
  );
};

export default LanguageSwitcher;