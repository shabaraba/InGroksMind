import { NextRequest, NextResponse } from 'next/server';

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // POSTリクエストの処理
  if (req.method === 'POST') {
    // 結果ページへのPOSTリクエストを処理
    if (pathname === '/result') {
      // フォームデータを処理
      try {
        const formData = await req.formData();
        const answer = formData.get('answer');
        const quizId = formData.get('quizId');
        const styleId = formData.get('styleId');
        const locale = formData.get('locale');
        const quizUserId = formData.get('quizUserId');
        const replyUserId = formData.get('replyUserId');
        
        // 必要なパラメータがある場合、URLに追加
        if (answer && quizId && styleId) {
          const url = req.nextUrl.clone();
          
          // クエリパラメータにformDataの内容を追加
          url.searchParams.set('quizId', quizId.toString());
          url.searchParams.set('styleId', styleId.toString());
          url.searchParams.set('answer', answer.toString());
          
          if (locale) {
            url.searchParams.set('lang', locale.toString());
          }
          
          // ユーザーIDも追加（存在する場合）
          if (quizUserId) {
            url.searchParams.set('quizUserId', quizUserId.toString());
          }
          
          if (replyUserId) {
            url.searchParams.set('replyUserId', replyUserId.toString());
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