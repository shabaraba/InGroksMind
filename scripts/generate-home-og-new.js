// トップページ用更新版 OG画像生成スクリプト - インタラクションアイコンなし
const fs = require('fs');
const path = require('path');
const { Canvas } = require('skia-canvas');

// 出力ファイルパス
const outputPath = path.join(__dirname, '../public/og-image-home-new.png');

async function generateImage() {
  try {
    // Canvas作成
    const canvasWidth = 1200;
    const canvasHeight = 630;
    const canvas = new Canvas(canvasWidth, canvasHeight);
    const ctx = canvas.getContext('2d');
    const isJapanese = true; // 日本語版をデフォルトで生成

    // 背景色（宇宙風グラデーション - 中央から暗くなる）
    const centerX = canvasWidth / 2;
    const centerY = canvasHeight / 2;
    const bgGradient = ctx.createRadialGradient(
      centerX, centerY, 0,
      centerX, centerY, canvasHeight
    );
    bgGradient.addColorStop(0, '#151B30'); // 中央は少し明るい宇宙の色
    bgGradient.addColorStop(0.5, '#0B0B1A'); // 暗い宇宙の色
    bgGradient.addColorStop(1, '#0A0A15'); // さらに暗い宇宙の色
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // 簡易的な星の背景
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    for (let i = 0; i < 200; i++) {
      const starX = Math.random() * canvasWidth;
      const starY = Math.random() * canvasHeight;
      const starSize = Math.random() * 2 + 0.5;
      const brightness = Math.random();
      ctx.globalAlpha = brightness * 0.8 + 0.2; // 星の明るさをランダムに
      ctx.beginPath();
      ctx.arc(starX, starY, starSize, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1.0;

    // 画面の外枠
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 4;
    ctx.strokeRect(20, 20, canvasWidth - 40, canvasHeight - 40);

    // マイルドな光彩効果（タイトルの後ろに）
    const titleGlow = ctx.createRadialGradient(
      centerX, centerY - 70, 50,
      centerX, centerY - 70, 300
    );
    titleGlow.addColorStop(0, 'rgba(29, 155, 240, 0.15)');
    titleGlow.addColorStop(0.7, 'rgba(29, 155, 240, 0.05)');
    titleGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = titleGlow;
    ctx.beginPath();
    ctx.arc(centerX, centerY - 70, 300, 0, Math.PI * 2);
    ctx.fill();

    // タイトル - 中央揃え
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 100px sans-serif';
    ctx.textAlign = 'center';
    ctx.shadowColor = 'rgba(29, 155, 240, 0.8)';
    ctx.shadowBlur = 15;

    // タイトルを中央上部に配置
    ctx.fillText(isJapanese ? 'Grokの気持ち' : "In Grok's Mind", centerX, centerY - 100);

    // サブタイトル - 中央揃え
    ctx.font = 'bold 45px sans-serif';
    ctx.fillStyle = '#1d9bf0'; // Twitter Blue
    ctx.shadowColor = 'rgba(255, 255, 255, 0.5)';
    ctx.shadowBlur = 5;
    ctx.fillText(isJapanese ? 'Grokになりきって雑学に回答しよう！' : 'Let\'s dive into trivia like we\'re Grok!', centerX, centerY - 40);

    // 影をリセット
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;

    // ファクトチェックリクエストを表示（下半分）- Xポストのような見た目
    const rectX = canvasWidth / 2 - 300;
    const rectY = centerY + 20;
    const rectWidth = 600;
    const rectHeight = 160; // 高さを調整（アイコン表示部分を削除したため）
    const rectRadius = 15;

    // ポストの背景 - Xのダークモード風
    ctx.fillStyle = '#15202b'; // Xのダークモード背景色
    ctx.beginPath();
    ctx.moveTo(rectX + rectRadius, rectY);
    ctx.lineTo(rectX + rectWidth - rectRadius, rectY);
    ctx.quadraticCurveTo(rectX + rectWidth, rectY, rectX + rectWidth, rectY + rectRadius);
    ctx.lineTo(rectX + rectWidth, rectY + rectHeight - rectRadius);
    ctx.quadraticCurveTo(rectX + rectWidth, rectY + rectHeight, rectX + rectWidth - rectRadius, rectY + rectHeight);
    ctx.lineTo(rectX + rectRadius, rectY + rectHeight);
    ctx.quadraticCurveTo(rectX, rectY + rectHeight, rectX, rectY + rectHeight - rectRadius);
    ctx.lineTo(rectX, rectY + rectRadius);
    ctx.quadraticCurveTo(rectX, rectY, rectX + rectRadius, rectY);
    ctx.closePath();
    ctx.fill();

    // ポストの境界線 - 薄いグレー
    ctx.strokeStyle = '#38444d'; // Xのダークモードの区切り線
    ctx.lineWidth = 1;
    ctx.stroke();

    // ユーザーアイコン（FactChecker）
    ctx.fillStyle = '#60a5fa'; // 青色 - ファクトチェッカーのカラー
    ctx.beginPath();
    ctx.arc(rectX + 35, rectY + 35, 25, 0, Math.PI * 2);
    ctx.fill();

    // アイコン内に「F」の文字
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 26px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('F', rectX + 35, rectY + 35);
    ctx.textBaseline = 'alphabetic'; // リセット

    // ユーザー名と認証マーク
    ctx.textAlign = 'left';
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 22px sans-serif';
    ctx.fillText(isJapanese ? 'ファクトチェッカー' : 'Fact Checker', rectX + 75, rectY + 30);
    
    // ユーザー名の長さを測定
    const usernameWidth = ctx.measureText(isJapanese ? 'ファクトチェッカー' : 'Fact Checker').width;

    // 認証マーク（青い丸に白いチェック）- ユーザー名の右側に配置
    ctx.fillStyle = '#1d9bf0'; // Twitter Blue
    ctx.beginPath();
    ctx.arc(rectX + 75 + usernameWidth + 15, rectY + 30, 8, 0, Math.PI * 2);
    ctx.fill();

    // チェックマーク
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(rectX + 75 + usernameWidth + 12, rectY + 30);
    ctx.lineTo(rectX + 75 + usernameWidth + 15, rectY + 33);
    ctx.lineTo(rectX + 75 + usernameWidth + 19, rectY + 27);
    ctx.stroke();

    // ユーザーID
    ctx.fillStyle = '#8899a6'; // Xのグレーテキスト
    ctx.font = '18px sans-serif';
    ctx.fillText('@fact_checker · 1分', rectX + 75, rectY + 55);

    // ファクトチェック内容
    ctx.fillStyle = '#ffffff';
    ctx.font = '22px sans-serif';
    ctx.textAlign = 'left';

    // ファクトチェックリクエストテキスト
    const factCheckText = isJapanese
      ? 'ファクトチェックお願い。陽キャ風で回答して。'
      : 'Fact check please. Answer in energetic style.';

    // メンション部分を青色で描画
    ctx.fillStyle = '#1d9bf0'; // Twitter Blue
    ctx.fillText('@grok', rectX + 35, rectY + 95);
    
    // 残りのテキストは白で描画
    ctx.fillStyle = '#ffffff';
    const mentionWidth = ctx.measureText('@grok').width;
    ctx.fillText(` ${factCheckText}`, rectX + 35 + mentionWidth, rectY + 95);

    // フッター
    const footerHeight = 60;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, canvasHeight - footerHeight, canvasWidth, footerHeight);

    // フッターテキスト
    ctx.fillStyle = '#1d9bf0'; // Twitter Blue
    ctx.font = 'bold 24px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('#Grokの気持ち #InGroksMind', 40, canvasHeight - 22);

    // 著作権表示
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'right';
    ctx.fillText('© from-garage 2025', canvasWidth - 40, canvasHeight - 22);

    // 画像をファイルに書き出し
    const buffer = await canvas.toBuffer('png');
    fs.writeFileSync(outputPath, buffer);

    console.log(`トップページ用更新版OG画像が生成されました: ${outputPath}`);
  } catch (error) {
    console.error('Error generating updated home OG image:', error);
  }
}

// 画像生成を実行
generateImage();