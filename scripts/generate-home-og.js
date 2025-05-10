// トップページ用 OG画像生成スクリプト
const fs = require('fs');
const path = require('path');
const { Canvas } = require('skia-canvas');

// 出力ファイルパス
const outputPath = path.join(__dirname, '../public/og-image-home.png');

async function generateImage() {
  try {
    // OG画像の設定
    const width = 1200;
    const height = 630;
    const canvas = new Canvas(width, height);
    const ctx = canvas.getContext('2d');

    // 背景グラデーション（深宇宙風）
    const bgGradient = ctx.createRadialGradient(
      width / 2, height / 2, 100,  // 内側の円の中心と半径
      width / 2, height / 2, Math.max(width, height)  // 外側の円の中心と半径
    );
    bgGradient.addColorStop(0, '#192339');  // 中心部分の色 (暗めの青色)
    bgGradient.addColorStop(0.3, '#151B30'); // 中間色 (より暗い青色)
    bgGradient.addColorStop(1, '#0B0B1A');  // 外側の色 (ほぼ黒)
    
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);

    // 遠くの星々（小さな点）を描画
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
    
    // 明るい星（ランダムなサイズと輝き）を描画
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

    // ポスト表示のための中央エリア
    const postWidth = 700;
    const postHeight = 300;
    const postX = (width - postWidth) / 2;
    const postY = (height - postHeight) / 2;
    
    // 中央エリアの背景（Twitter投稿風）
    ctx.fillStyle = 'rgba(21, 32, 43, 0.8)';  // Twitterダークモード風の背景
    ctx.strokeStyle = 'rgba(83, 100, 113, 0.5)';  // 薄い枠線
    ctx.lineWidth = 1;
    
    // 角丸の長方形を描画
    ctx.beginPath();
    ctx.roundRect(postX, postY, postWidth, postHeight, 15);
    ctx.fill();
    ctx.stroke();
    
    // ユーザーアイコン（円形）
    const iconSize = 60;
    const iconX = postX + 40;
    const iconY = postY + 40;
    
    ctx.fillStyle = '#60a5fa';  // アイコン背景色（青色）
    ctx.beginPath();
    ctx.arc(iconX, iconY, iconSize / 2, 0, Math.PI * 2);
    ctx.fill();
    
    // アイコン内の文字
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('FC', iconX, iconY);  // FactCheckerの頭文字
    
    // ユーザー名とID
    ctx.textAlign = 'left';
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px sans-serif';
    ctx.fillText('ファクトチェッカー', iconX + iconSize / 2 + 20, iconY - 10);
    
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.font = '18px sans-serif';
    ctx.fillText('@fact_checker', iconX + iconSize / 2 + 20, iconY + 20);
    
    // ポスト内容
    ctx.fillStyle = '#ffffff';
    ctx.font = '22px sans-serif';
    const postContent = '応仁の乱？あれって単なる家督争いじゃん。深読みする人いるけど、将軍家の親族喧嘩が拗れただけ。';
    
    // テキストの折り返し処理
    const maxWidth = postWidth - 80;
    const lineHeight = 32;
    let currentY = postY + 120;
    
    // 日本語の文字単位で折り返す
    let line = '';
    const chars = postContent.split('');
    
    for (let i = 0; i < chars.length; i++) {
      const testLine = line + chars[i];
      const metrics = ctx.measureText(testLine);
      
      if (metrics.width > maxWidth && i > 0) {
        ctx.fillText(line, postX + 40, currentY);
        line = chars[i];
        currentY += lineHeight;
      } else {
        line = testLine;
      }
    }
    
    // 最後の行を描画
    ctx.fillText(line, postX + 40, currentY);
    
    // 中央に光彩効果
    const glowGradient = ctx.createRadialGradient(
      width / 2, height / 2, 0,
      width / 2, height / 2, postWidth / 1.5
    );
    glowGradient.addColorStop(0, 'rgba(29, 155, 240, 0.15)');  // Twitter Blueの薄い光
    glowGradient.addColorStop(1, 'rgba(29, 155, 240, 0)');
    
    ctx.fillStyle = glowGradient;
    ctx.fillRect(0, 0, width, height);

    // タイトルを大きく描画（「Grokの気持ち」）
    ctx.textAlign = 'center';
    
    // タイトルの影（光彩効果）
    ctx.shadowColor = 'rgba(29, 155, 240, 0.8)';
    ctx.shadowBlur = 20;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    
    // タイトル
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 92px sans-serif';
    ctx.fillText('Grokの気持ち', width / 2, 140);
    
    // サブタイトル
    ctx.shadowBlur = 10;
    ctx.font = 'bold 32px sans-serif';
    ctx.fillText('Grokになりきって雑学に回答しよう！', width / 2, 190);
    
    // 影をリセット
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    
    // フッター
    const footerHeight = 60;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, height - footerHeight, width, footerHeight);
    
    // フッターテキスト
    ctx.fillStyle = '#1d9bf0'; // Twitter Blue
    ctx.font = 'bold 24px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('#Grokの気持ち #InGroksMind', 40, height - 22);
    
    // 著作権表示
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'right';
    ctx.fillText('© from-garage 2025', width - 40, height - 22);

    // 画像をファイルに書き出し
    const buffer = await canvas.toBuffer('png');
    fs.writeFileSync(outputPath, buffer);

    console.log(`トップページ用OG画像が生成されました: ${outputPath}`);
  } catch (error) {
    console.error('Error generating home OG image:', error);
  }
}

// 画像生成を実行
generateImage();