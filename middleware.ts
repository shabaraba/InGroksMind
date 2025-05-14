import { NextRequest, NextResponse } from 'next/server';

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // POSTリクエストの処理
  if (req.method === 'POST') {
    // 結果ページへのPOSTリクエストを処理
    if (pathname.startsWith('/result/')) {
      // フォームデータを処理
      try {
        const formData = await req.formData();
        const answer = formData.get('answer');
        const locale = formData.get('locale');
        
        // 必要なパラメータがある場合、URLに追加
        if (answer || locale) {
          const url = req.nextUrl.clone();
          
          // クエリパラメータにformDataの内容を追加
          if (answer && !url.searchParams.has('answer')) {
            url.searchParams.set('answer', answer.toString());
          }
          
          if (locale && !url.searchParams.has('lang')) {
            url.searchParams.set('lang', locale.toString());
          }
          
          // リクエストを続行（必要なデータを含めた状態で）
          return NextResponse.rewrite(url);
        }
      } catch (error) {
        console.error('Error processing form data in middleware:', error);
      }
    }
  }

  return NextResponse.next();
}

// ミドルウェアを適用するパス
export const config = {
  matcher: [
    // 結果ページのルートにマッチ
    '/result'
  ],
};