import { Handler } from '@netlify/functions';
import { createCanvas } from 'canvas'; // node-canvasを使用（skia-canvasの代わり）
import { quizData } from '../../../data/quizData';
import { styleVariations } from '../../../data/styleVariations';

// サポートする言語
const supportedLanguages = ['ja', 'en'];

// OG画像生成Netlify Function
const handler: Handler = async (event, context) => {
  // GETリクエスト以外は拒否
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  try {
    // パラメータの取得
    const { quizId, styleId, score, lang } = event.queryStringParameters || {};
    
    // パラメータの検証
    if (!quizId || !styleId || !score) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required parameters' }),
      };
    }
    
    // 数値への変換
    const quizIdNum = parseInt(quizId, 10);
    const styleIdNum = parseInt(styleId, 10);
    const scoreNum = parseInt(score, 10);
    
    // 言語の設定
    const language = supportedLanguages.includes(lang || '') ? lang : 'ja';
    const isJapanese = language === 'ja';
    
    // クイズとスタイルの取得
    const quiz = quizData.find(q => q.id === quizIdNum) || quizData[0];
    const style = styleVariations.find(s => s.id === styleIdNum) || styleVariations[0];
    
    // コンテンツを取得
    const quizContent = isJapanese ? quiz.content_ja : quiz.content_en;
    const styleName = isJapanese ? style.name_ja : style.name_en;
    const appTitle = isJapanese ? 'Grokの気持ち' : "In Grok's Mind";
    const yourScoreText = isJapanese ? 'あなたのGrok理解度' : 'Your Grok Score';
    const styleText = isJapanese ? `スタイル: ${styleName}` : `Style: ${styleName}`;
    
    // Canvas設定
    const width = 1200;
    const height = 630;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');
    
    // 画像生成 - 新デザイン（左右分割・スコア大きく表示）
    
    // 背景 - グラデーション（深宇宙風）
    const bgGradient = ctx.createLinearGradient(0, 0, width, height);
    bgGradient.addColorStop(0, '#0B0B1A');  // 暗い宇宙の色
    bgGradient.addColorStop(0.5, '#151B30'); // 少し明るい宇宙の色
    bgGradient.addColorStop(1, '#0C0E1A');  // 暗い青紫色
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);
    
    // 画面分割線 (左右レイアウト)
    const splitX = width * 0.55; // 55:45で分割
    
    // 左右分割のための薄いライン
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(splitX, 80);
    ctx.lineTo(splitX, height - 80);
    ctx.stroke();
    
    // 遠くの星々（小さな点）
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    const starCount = 300; // 星の数
    for (let i = 0; i < starCount; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const size = Math.random() * 1.5;
      
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // 明るい星（ランダムなサイズと輝き）
    for (let i = 0; i < 30; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const size = Math.random() * 2 + 1;
      
      // 明るい星
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
      
      // 星の光芒（十字の輝き）
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(x - size * 3, y);
      ctx.lineTo(x + size * 3, y);
      ctx.moveTo(x, y - size * 3);
      ctx.lineTo(x, y + size * 3);
      ctx.stroke();
    }
    
    // 左側エリア - アプリ名とコンテンツ
    
    // タイトル表示（アプリ名）
    ctx.shadowColor = 'rgba(138, 43, 226, 0.8)';
    ctx.shadowBlur = 15;
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 54px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(appTitle, 60, 80);
    
    // サブタイトル 「あなたのGrok理解度」
    ctx.shadowColor = 'rgba(255, 255, 255, 0.6)';
    ctx.shadowBlur = 10;
    ctx.fillStyle = '#1d9bf0'; // Twitter Blue
    ctx.font = 'bold 32px sans-serif';
    ctx.fillText(yourScoreText, 60, 130);
    
    // スタイル表示
    ctx.shadowColor = 'rgba(255, 20, 147, 0.7)';
    ctx.shadowBlur = 8;
    ctx.fillStyle = '#ff9ff3'; // 明るいピンク
    ctx.font = '28px sans-serif';
    ctx.fillText(styleText, 60, 170);
    
    // 影をリセット
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    
    // お題
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 32px sans-serif';
    ctx.fillText(isJapanese ? 'お題:' : 'Topic:', 60, 230);
    
    // お題内容の折り返し表示
    const maxLeftWidth = splitX - 80;
    const wrapText = (text: string, x: number, y: number, maxWidth: number, lineHeight: number) => {
      // 日本語と英語で処理を分ける
      if (isJapanese) {
        // 日本語は文字単位で折り返し
        const chars = text.split('');
        let line = '';
        let currentY = y;
        
        for (let i = 0; i < chars.length; i++) {
          const testLine = line + chars[i];
          const metrics = ctx.measureText(testLine);
          
          if (metrics.width > maxWidth && i > 0) {
            ctx.fillText(line, x, currentY);
            line = chars[i];
            currentY += lineHeight;
            
            // 高さ制限（画面内に収まるように）
            if (currentY > height - 150) {
              line += '...';
              ctx.fillText(line, x, currentY);
              break;
            }
          } else {
            line = testLine;
          }
        }
        
        // 最後の行を描画
        if (currentY <= height - 150) {
          ctx.fillText(line, x, currentY);
        }
      } else {
        // 英語は単語単位で折り返し
        const words = text.split(' ');
        let line = '';
        let currentY = y;
        
        for (let i = 0; i < words.length; i++) {
          const testLine = line + words[i] + ' ';
          const metrics = ctx.measureText(testLine);
          
          if (metrics.width > maxWidth && i > 0) {
            ctx.fillText(line, x, currentY);
            line = words[i] + ' ';
            currentY += lineHeight;
            
            // 高さ制限
            if (currentY > height - 150) {
              line += '...';
              ctx.fillText(line, x, currentY);
              break;
            }
          } else {
            line = testLine;
          }
        }
        
        // 最後の行を描画
        if (currentY <= height - 150) {
          ctx.fillText(line, x, currentY);
        }
      }
    };
    
    // お題テキストを描画（左側エリア内で折り返し）
    ctx.font = '24px sans-serif';
    ctx.fillStyle = '#e2e8f0';
    wrapText(quizContent, 60, 270, maxLeftWidth, 34);
    
    // 右側エリア - スコア表示（大きく）
    
    // スコアに応じた色を設定
    let scoreColor, scoreGlowColor;
    if (scoreNum >= 80) {
      scoreColor = '#4ade80'; // 緑
      scoreGlowColor = 'rgba(74, 222, 128, 0.8)'; // 緑の光
    } else if (scoreNum >= 60) {
      scoreColor = '#facc15'; // 黄色
      scoreGlowColor = 'rgba(250, 204, 21, 0.8)'; // 黄色の光
    } else {
      scoreColor = '#f87171'; // 赤
      scoreGlowColor = 'rgba(248, 113, 113, 0.8)'; // 赤の光
    }
    
    // スコア表示の背景（円形の輝き）
    const centerX = splitX + (width - splitX) / 2;
    const centerY = height / 2;
    const radius = Math.min((width - splitX) * 0.4, height * 0.35);
    
    const scoreGradient = ctx.createRadialGradient(
      centerX, centerY, radius * 0.2,
      centerX, centerY, radius * 1.2
    );
    scoreGradient.addColorStop(0, `rgba(${scoreColor.substr(1).match(/../g)?.map(x => parseInt(x, 16)).join(',')}, 0.3)`);
    scoreGradient.addColorStop(0.7, `rgba(${scoreColor.substr(1).match(/../g)?.map(x => parseInt(x, 16)).join(',')}, 0.1)`);
    scoreGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    
    ctx.fillStyle = scoreGradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fill();
    
    // スコア値の表示（特に大きく）
    ctx.shadowColor = scoreGlowColor;
    ctx.shadowBlur = 30;
    ctx.fillStyle = scoreColor;
    ctx.font = 'bold 180px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${scoreNum}`, centerX, centerY);
    
    // スコアの単位
    ctx.font = 'bold 48px sans-serif';
    ctx.fillText('/100', centerX, centerY + 60);
    
    // グレード表示
    let grade, gradeText;
    if (scoreNum >= 90) {
      grade = 'S';
      gradeText = isJapanese ? 'マスター' : 'MASTER';
    } else if (scoreNum >= 80) {
      grade = 'A';
      gradeText = isJapanese ? '上級者' : 'EXPERT';
    } else if (scoreNum >= 70) {
      grade = 'B';
      gradeText = isJapanese ? '中級者' : 'SKILLED';
    } else if (scoreNum >= 60) {
      grade = 'C';
      gradeText = isJapanese ? '初級者' : 'INTERMEDIATE';
    } else {
      grade = 'D';
      gradeText = isJapanese ? '見習い' : 'BEGINNER';
    }
    
    // グレードを表示（スコアの下）
    ctx.shadowBlur = 15;
    ctx.font = 'bold 64px sans-serif';
    ctx.fillText(grade, centerX, centerY + 140);
    
    // グレードのテキスト説明
    ctx.font = 'bold 28px sans-serif';
    ctx.fillText(gradeText, centerX, centerY + 180);
    
    // 影をリセット
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    
    // フッター - ハッシュタグと著作権表示
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(0, height - 70, width, 70);
    
    // ハッシュタグ
    ctx.shadowColor = 'rgba(138, 43, 226, 0.7)';
    ctx.shadowBlur = 10;
    ctx.fillStyle = '#1d9bf0'; // Twitter Blue
    ctx.font = 'bold 24px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(isJapanese ? '#Grokの気持ち #InGroksMind' : '#InGroksMind #BeGrok', 60, height - 25);
    
    // 著作権表示
    ctx.shadowColor = 'rgba(255, 255, 255, 0.5)';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'right';
    ctx.fillText('© from-garage 2025', width - 60, height - 25);
    
    // 小さな光の粒子（周囲に散らばる装飾）
    for (let i = 0; i < 50; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * radius * 1.5;
      const particleX = centerX + Math.cos(angle) * distance;
      const particleY = centerY + Math.sin(angle) * distance;
      const size = Math.random() * 2 + 0.5;
      
      ctx.fillStyle = scoreColor;
      ctx.globalAlpha = Math.random() * 0.5 + 0.1;
      ctx.beginPath();
      ctx.arc(particleX, particleY, size, 0, Math.PI * 2);
      ctx.fill();
    }
    
    ctx.globalAlpha = 1.0;
    
    // PNGとして書き出し
    const buffer = canvas.toBuffer('image/png');
    
    // Base64エンコード
    const base64Image = buffer.toString('base64');
    
    // レスポンス設定
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'image/png',
        'Content-Length': buffer.length.toString(),
        'Cache-Control': 'public, max-age=31536000',
      },
      body: base64Image,
      isBase64Encoded: true,
    };
  } catch (error) {
    console.error('Error generating OG image:', error);
    
    // エラーレスポンス
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to generate image' }),
    };
  }
};

export { handler };