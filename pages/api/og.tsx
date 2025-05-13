import { ImageResponse } from '@vercel/og';
import { NextRequest } from 'next/server';

export const config = {
  runtime: 'edge',
};

export default async function handler(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    
    // デフォルトのタイトルとテキスト
    const title = searchParams.get('title') || 'In Grok\'s Mind';
    const score = searchParams.get('score') || '80';
    const question = searchParams.get('question') || 'How would Grok respond to this question?';
    const style = searchParams.get('style') || 'Cool and Confident';
    const locale = searchParams.get('locale') || 'en';
    
    // 言語に依存するテキスト
    const isJapanese = locale === 'ja';
    const questionLabel = isJapanese ? 'お題:' : 'Question:';
    const styleLabel = isJapanese ? '指定された口調:' : 'Style:';
    const totalScoreLabel = isJapanese ? '総合評価' : 'Total Score';
    const hashtags = isJapanese 
      ? '#Grokの気持ち #InGrokMind' 
      : '#InGrokMind #Grokの気持ち';
    
    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#15202b',
            backgroundImage: 'radial-gradient(circle at 25% 25%, #1D2939 0%, #15202b 100%)',
            color: 'white',
            position: 'relative',
            fontFamily: '"Inter", sans-serif',
            padding: 40,
          }}
        >
          {/* 背景の星々 */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: 'radial-gradient(white 1px, transparent 0)',
            backgroundSize: '50px 50px',
            opacity: 0.1,
          }} />

          {/* メインコンテンツ */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'flex-start',
            margin: '0 auto',
            width: '90%',
            height: '90%',
            border: '2px solid rgba(138, 43, 226, 0.3)',
            borderRadius: 15,
            padding: 20,
            position: 'relative',
          }}>
            {/* タイトル */}
            <div style={{
              display: 'flex', 
              justifyContent: 'center',
              backgroundColor: 'rgba(138, 43, 226, 0.2)',
              borderRadius: 10,
              padding: '20px 60px',
              marginBottom: 20,
            }}>
              <h1 style={{
                fontSize: 64,
                fontWeight: 'bold',
                textAlign: 'center',
                margin: 0,
                background: 'linear-gradient(to right, #fff, #d6bcfa, #fff)',
                backgroundClip: 'text',
                color: 'transparent',
                WebkitBackgroundClip: 'text',
              }}>
                {title}
              </h1>
            </div>
            
            {/* 問題内容 */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              marginBottom: 20,
              width: '100%',
            }}>
              <h2 style={{
                fontSize: 32,
                color: '#1d9bf0',
                marginBottom: 10,
              }}>
                {questionLabel}
              </h2>
              <p style={{
                fontSize: 28,
                textAlign: 'center',
                margin: 0,
                maxWidth: '80%',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
              }}>
                {question}
              </p>
            </div>
            
            {/* スタイル */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              marginBottom: 40,
              width: '100%',
            }}>
              <h2 style={{
                fontSize: 28,
                color: '#ff9ff3',
                marginBottom: 5,
              }}>
                {styleLabel}
              </h2>
              <p style={{
                fontSize: 24,
                textAlign: 'center',
                margin: 0,
              }}>
                {style}
              </p>
            </div>
            
            {/* スコア */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              backgroundColor: parseInt(score) >= 80 
                ? 'rgba(74, 222, 128, 0.2)' 
                : parseInt(score) >= 60 
                  ? 'rgba(250, 204, 21, 0.2)' 
                  : 'rgba(248, 113, 113, 0.2)',
              padding: 20,
              borderRadius: 10,
              width: '50%',
              border: `2px solid ${parseInt(score) >= 80 
                ? 'rgba(74, 222, 128, 0.5)' 
                : parseInt(score) >= 60 
                  ? 'rgba(250, 204, 21, 0.5)' 
                  : 'rgba(248, 113, 113, 0.5)'}`,
            }}>
              <h2 style={{
                fontSize: 32,
                margin: 0,
                marginBottom: 10,
              }}>
                {totalScoreLabel}
              </h2>
              <p style={{
                fontSize: 56,
                fontWeight: 'bold',
                margin: 0,
                color: parseInt(score) >= 80 
                  ? '#4ade80' 
                  : parseInt(score) >= 60 
                    ? '#facc15' 
                    : '#f87171',
              }}>
                {score}/100
              </p>
            </div>
          </div>
          
          {/* フッター */}
          <div style={{
            position: 'absolute',
            bottom: 20,
            width: '90%',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <p style={{ fontSize: 20, color: 'white' }}>
              © from-garage 2025
            </p>
            <p style={{ fontSize: 20, color: '#1d9bf0' }}>
              {hashtags}
            </p>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      },
    );
  } catch (e: any) {
    console.log(`Error generating image: ${e.message}`);
    return new Response(`Failed to generate the image`, {
      status: 500,
    });
  }
}