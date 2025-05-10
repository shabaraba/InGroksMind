import type { AppProps } from 'next/app';
import { useRouter } from 'next/router';

// 拡張したPagePropsの型定義
interface ExtendedPageProps {
  preferredLanguage?: string;
  locale?: string;
  [key: string]: any;
}

// AppPropsを拡張
type ExtendedAppProps = AppProps & {
  pageProps: ExtendedPageProps;
};
import Head from 'next/head';
import React, { useEffect, useState, createContext } from 'react';
import '../styles/globals.css';
import * as ga from '../utils/analytics';

// 言語情報をグローバルコンテキストとして保持
interface LanguageContextType {
  language: string;
  isJapanese: boolean;
  setLanguage: (lang: string) => void;
}

export const LanguageContext = createContext<LanguageContextType>({
  language: 'ja',
  isJapanese: true,
  setLanguage: () => {}
});

function MyApp({ Component, pageProps }: ExtendedAppProps) {
  const router = useRouter();

  // デフォルトの言語を設定（優先順位: preferredLanguage > locale > デフォルト）
  // preferredLanguageはシェアページなどでユーザーの元の言語設定を引き継ぐために使用
  const initialLocale = pageProps.preferredLanguage || pageProps.locale || 'ja'; // デフォルトを日本語に変更
  const initialIsJapanese = initialLocale === 'ja';

  // 言語状態を管理
  const [language, setLanguageState] = useState(initialLocale);
  const [isJapanese, setIsJapanese] = useState(initialIsJapanese);
  const [isClient, setIsClient] = useState(false);

  // 言語を設定するラッパー関数
  const setLanguage = (lang: string) => {
    // 言語情報を更新
    setLanguageState(lang);
    setIsJapanese(lang === 'ja');

    // Google Analyticsにイベントを送信
    ga.trackLanguageSwitch(lang);

    // ローカルストレージに設定を保存（次回訪問時のために）
    if (typeof window !== 'undefined') {
      localStorage.setItem('preferredLanguage', lang);
    }
  };

  // ローカルストレージから言語設定を読み込む
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedLang = localStorage.getItem('preferredLanguage');
      if (savedLang === 'ja' || savedLang === 'en') {
        setLanguage(savedLang);
      }
    }
  }, []);

  // クライアントサイドの初期化を処理とGA設定
  useEffect(() => {
    setIsClient(true);

    // Google Analyticsのページビュートラッキング設定
    const handleRouteChange = (url: string) => {
      ga.pageview(url);
    };

    // 初回ロード時に現在のページをトラッキング
    router.events.on('routeChangeComplete', handleRouteChange);

    // Clean up
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router.events]);

  // URLのlangパラメータの変更を監視
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const langParam = urlParams.get('lang');

      if (langParam === 'ja' || langParam === 'en') {
        // URLパラメータがある場合は最優先で適用
        console.log('Setting language from URL:', langParam);
        setLanguage(langParam);
      }
    }
  }, [typeof window !== 'undefined' ? window.location.search : null, setLanguage]); // URLクエリが変わったときだけ実行

  // ページプロパティからの言語設定を適用
  const firstRender = React.useRef(true);
  useEffect(() => {
    // 初回レンダリング時のみ実行し、URLクエリがある場合は上書きしないようにする
    if (firstRender.current) {
      firstRender.current = false;

      // URLパラメータを確認
      const urlParams = new URLSearchParams(window.location.search);
      const langParam = urlParams.get('lang');

      // URLパラメータがない場合のみ、他の優先度に従って言語を設定
      if (!(langParam === 'ja' || langParam === 'en')) {
        if (pageProps.preferredLanguage === 'ja' || pageProps.preferredLanguage === 'en') {
          // ページPropsから言語設定 (シェアページの場合)
          console.log('Setting language from page props:', pageProps.preferredLanguage);
          setLanguage(pageProps.preferredLanguage);
        } else {
          // ブラウザ設定を使用（ローカルストレージにない場合のみ）
          try {
            const savedLang = localStorage.getItem('preferredLanguage');
            if (!savedLang) {
              // ブラウザの言語設定から判定（navigator.languageがない場合も対応）
              const userLang = (navigator.language || (navigator as any).userLanguage || 'en').split('-')[0].toLowerCase(); // 'ja-JP' → 'ja'
              // jaの場合は日本語、それ以外は英語
              const detectedLang = userLang === 'ja' ? 'ja' : 'en';
              console.log('Setting language from browser:', detectedLang, 'Original:', navigator.language);
              setLanguage(detectedLang);
            }
          } catch (error) {
            // localStorage/navigatorへのアクセスでエラーが発生した場合
            console.error('Error accessing browser language:', error);
            // デフォルト言語（日本語）を設定
            setLanguage('ja');
          }
        }
      }
    }
  }, [pageProps.preferredLanguage, setLanguage]);

  return (
    <LanguageContext.Provider value={{ language, isJapanese, setLanguage }}>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta charSet="utf-8" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/favicon.png" />
      </Head>
      {/* クライアントサイドでレンダリングされるまでは何も表示しない */}
      {isClient ? <Component {...pageProps} /> :
        <div className="min-h-screen bg-twitter-dark flex items-center justify-center">
          <div className="animate-spin h-10 w-10 border-4 border-blue-500 rounded-full border-t-transparent"></div>
        </div>
      }
    </LanguageContext.Provider>
  );
}

export default MyApp;