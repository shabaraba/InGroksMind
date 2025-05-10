import { useEffect } from 'react';
import { useRouter } from 'next/router';

// 存在しないページにアクセスした際に自動でトップページにリダイレクトするコンポーネント
export default function Custom404() {
  const router = useRouter();

  useEffect(() => {
    // 存在しないページへのアクセスを検知してトップページにリダイレクト
    // 少し遅延を入れてユーザーが何が起きたか理解できるようにする
    const redirectTimer = setTimeout(() => {
      // クエリパラメータを保持して言語設定が引き継がれるようにする
      const lang = router.query.lang || '';
      const langParam = typeof lang === 'string' && (lang === 'ja' || lang === 'en') 
        ? `?lang=${lang}` 
        : '';
      
      router.push(`/${langParam}`);
    }, 100);

    return () => clearTimeout(redirectTimer);
  }, [router]);

  // リダイレクト中は何も表示しない
  // リダイレクトは即時に行われるため、表示される時間はごく短い
  return (
    <div className="min-h-screen bg-twitter-dark flex items-center justify-center">
      <div className="animate-spin h-10 w-10 border-4 border-blue-500 rounded-full border-t-transparent"></div>
    </div>
  );
}