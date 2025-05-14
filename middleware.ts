import { NextRequest, NextResponse } from 'next/server';

export default async function middleware(req: NextRequest) {
  // GETリクエストのハンドリングのみ残す
  return NextResponse.next();
}

// ミドルウェアを適用するパス
export const config = {
  matcher: [
    // 結果ページのルートにマッチ
    '/result'
  ],
};