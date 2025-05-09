# Twitter認証の実装ガイド

## 1. Twitter Developer Portalでの設定

1. [Twitter Developer Portal](https://developer.twitter.com/en/portal/dashboard)にアクセスして登録
2. プロジェクトとアプリを作成
3. 以下の情報を取得
   - API Key（Consumer Key）
   - API Secret（Consumer Secret）
   - Bearer Token

4. OAuth 2.0設定
   - リダイレクトURLを設定: `https://yourdomain.com/api/auth/twitter/callback`（開発時は`http://localhost:8888/api/auth/twitter/callback`）
   - 必要なスコープを選択（最低限`tweet.read`と`users.read`）

## 2. 必要なパッケージのインストール

```bash
npm install passport passport-twitter-oauth2 express-session
```

## 3. Netlify Functionsの実装

`netlify/functions/auth-twitter.js`を作成してTwitter認証を処理します：

```javascript
const express = require('express');
const passport = require('passport');
const session = require('express-session');
const TwitterStrategy = require('passport-twitter-oauth2').Strategy;
const serverless = require('serverless-http');

const app = express();

// セッション設定
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24時間
  }
}));

// Passportの初期化
app.use(passport.initialize());
app.use(passport.session());

// Passport設定
passport.use(new TwitterStrategy({
  consumerKey: process.env.TWITTER_API_KEY,
  consumerSecret: process.env.TWITTER_API_SECRET,
  callbackURL: process.env.TWITTER_CALLBACK_URL,
}, (token, tokenSecret, profile, done) => {
  // ユーザー情報をセッションに保存
  return done(null, profile);
}));

// ユーザーシリアライズ/デシリアライズ
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

// Twitter認証開始エンドポイント
app.get('/api/auth/twitter', passport.authenticate('twitter'));

// Twitter認証コールバックエンドポイント
app.get('/api/auth/twitter/callback', 
  passport.authenticate('twitter', { 
    failureRedirect: '/?auth_error=true'
  }),
  (req, res) => {
    // ユーザー情報をクライアントが利用できる形で保存
    const userData = {
      id: req.user.id,
      username: req.user.username,
      displayName: req.user.displayName,
      photos: req.user.photos
    };
    
    // クッキーに保存するか、クライアントサイドストレージに保存するための情報を渡す
    res.cookie('twitter_user', JSON.stringify(userData), {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000
    });
    
    // 認証後のリダイレクト
    res.redirect('/?auth_success=true');
  }
);

// ユーザー情報取得エンドポイント
app.get('/api/auth/user', (req, res) => {
  if (req.user) {
    return res.json({
      authenticated: true,
      user: {
        id: req.user.id,
        username: req.user.username,
        displayName: req.user.displayName,
        photos: req.user.photos
      }
    });
  }
  
  res.json({ authenticated: false });
});

// Netlify Functionsのハンドラー
exports.handler = serverless(app);
```

## 4. Netlify設定の更新

`netlify.toml`ファイルに以下を追加:

```toml
[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/auth-twitter/:splat"
  status = 200
  force = true
```

## 5. フロントエンド実装

### Twitterログインボタンの追加

```tsx
// src/components/TwitterLoginButton.tsx
import React from 'react';

const TwitterLoginButton: React.FC = () => {
  return (
    <button
      className="bg-blue-400 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded-full flex items-center"
      onClick={() => {
        window.location.href = '/api/auth/twitter';
      }}
    >
      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
      Twitterでログイン
    </button>
  );
};

export default TwitterLoginButton;
```

### ユーザー状態の管理

```tsx
// src/contexts/UserContext.tsx
import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';

// Twitterユーザータイプの定義
interface TwitterUser {
  id: string;
  username: string;
  displayName: string;
  photos: Array<{ value: string }>;
}

interface UserContextType {
  user: TwitterUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [user, setUser] = useState<TwitterUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // クッキーからユーザー情報を読み込む
  const checkAuth = async () => {
    try {
      setLoading(true);
      // クッキーからユーザー情報を取得
      const userCookie = document.cookie
        .split('; ')
        .find(row => row.startsWith('twitter_user='));
      
      if (userCookie) {
        const userData = JSON.parse(decodeURIComponent(userCookie.split('=')[1]));
        setUser(userData);
        setIsAuthenticated(true);
      } else {
        // APIからユーザー情報を取得
        const response = await fetch('/api/auth/user');
        const data = await response.json();
        
        if (data.authenticated) {
          setUser(data.user);
          setIsAuthenticated(true);
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setLoading(false);
    }
  };

  // ログアウト
  const logout = () => {
    // クッキーを削除
    document.cookie = 'twitter_user=; Max-Age=0; path=/;';
    setUser(null);
    setIsAuthenticated(false);
  };

  // 初回ロード時に認証チェック
  useEffect(() => {
    checkAuth();
    
    // URLパラメータのauth_successをチェック
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('auth_success') === 'true') {
      // クリーンなURLにリダイレクト
      window.history.replaceState({}, document.title, '/');
    }
  }, []);

  return (
    <UserContext.Provider value={{ user, isAuthenticated, loading, logout, checkAuth }}>
      {children}
    </UserContext.Provider>
  );
};

// カスタムフック
export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
```

### アプリへの統合

```tsx
// src/App.tsx
import { UserProvider } from './contexts/UserContext';

function App() {
  return (
    <UserProvider>
      {/* 既存のコード */}
    </UserProvider>
  );
}
```

## 6. PostContainerの更新

`src/components/PostContainer.tsx`を更新して、認証済みの場合はTwitterユーザー情報を表示します：

```tsx
import { useUser } from '../contexts/UserContext';

const PostContainer: React.FC = () => {
  const { user, isAuthenticated } = useUser();
  
  // 既存のコード
  
  // ユーザーがログインしている場合は、そのユーザーのアイコンと名前を使用
  const getUserDisplay = () => {
    if (isAuthenticated && user) {
      return {
        name: user.displayName,
        username: user.username,
        avatarUrl: user.photos?.[0]?.value,
        // 仮想的なユーザーIDとカラー
        id: 999,
        avatarColor: 'bg-blue-400'
      };
    }
    
    // 未認証の場合は通常の仮想ユーザーを使用
    return userPersona;
  };
  
  const currentUserDisplay = getUserDisplay();
  
  // JSXの回答表示部分を更新
  return (
    // ...
    {!feedback ? (
      <AnswerForm onSubmit={handleSubmit} isLoading={isLoading} />
    ) : (
      <div className="p-4">
        <div ref={resultRef} className="result-container">
          <div className="tweet-container bg-gray-800/50 rounded-lg">
            <div className="flex">
              <div className="mr-3">
                {isAuthenticated && user?.photos?.[0]?.value ? (
                  <img 
                    src={user.photos[0].value} 
                    alt={user.displayName}
                    className="w-12 h-12 rounded-full"
                  />
                ) : (
                  <div className={`w-12 h-12 rounded-full ${userPersona.avatarColor} flex items-center justify-center`}>
                    <span className="text-lg font-bold">{userPersona.avatarInitial}</span>
                  </div>
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center">
                  <span className="font-bold mr-2">
                    {isAuthenticated ? user?.displayName : (navigator.language.startsWith('ja') ? userPersona.name_ja : userPersona.name_en)}
                  </span>
                  <span className="text-gray-500">
                    @{isAuthenticated ? user?.username : userPersona.username} · {t.justNow}
                  </span>
                </div>
                <div className="mt-2">
                  <p className="text-white whitespace-pre-wrap">{answer}</p>
                </div>
              </div>
            </div>
          </div>
          {/* ... */}
        </div>
      </div>
    )}
    // ...
  );
};
```

## 7. 環境変数設定

`.env.local`ファイルに以下の変数を追加：

```
TWITTER_API_KEY=あなたのTwitter API Key
TWITTER_API_SECRET=あなたのTwitter API Secret
TWITTER_CALLBACK_URL=http://localhost:8888/api/auth/twitter/callback
SESSION_SECRET=ランダムな文字列
```

Netlifyにデプロイする場合は、Netlifyのサイト設定でも同じ環境変数を設定する必要があります。

---

この実装により、ユーザーはTwitterでログインし、自分のTwitterアカウントのアイコンと名前を使って回答できるようになります。ログインしていない場合は仮想ユーザーが使用されます。Netlify Functionsを使用してOAuth認証を処理するため、APIキーなどの機密情報がフロントエンドに露出することもありません。