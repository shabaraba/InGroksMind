import React from 'react';
import './App.css';
import Header from './components/Header';
import PostContainer from './components/PostContainer';
import getTranslation from './i18n/translations';

function App() {
  const t = getTranslation();

  return (
    <div className="min-h-screen bg-gray-900">
      <Header />
      <main className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto my-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">{t.appTitle}</h2>
            <p className="text-gray-400">
              {t.appDescription}
            </p>
          </div>
          <PostContainer />
        </div>
      </main>
      <footer className="bg-black py-6 mt-12">
        <div className="container mx-auto px-4 text-center text-gray-500">
          <p>{t.footer}</p>
          <p className="mt-2 text-sm">
            {t.footerDisclaimer}
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;