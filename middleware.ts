import { NextRequest, NextResponse } from 'next/server';

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // POSTリクエストの処理
  if (req.method === 'POST') {
    // 結果ページへのPOSTリクエストを処理
    if (pathname.startsWith('/result/')) {
      // POSTリクエストはそのまま通過させる（サーバーサイドで処理）
      return NextResponse.next();
    }
  }

  return NextResponse.next();
}

// ミドルウェアを適用するパス
export const config = {
  matcher: [
    // 結果ページのルートにマッチ
    '/result/:path*'
  ],
};