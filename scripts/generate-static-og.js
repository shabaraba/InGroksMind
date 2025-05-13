// OG画像生成用スクリプト
const fs = require('fs');
const path = require('path');
const { Canvas } = require('skia-canvas');

// 出力ファイルパス
const outputPath = path.join(__dirname, '../public/og-image-static.png');

async function generateImage() {
  try {
    // OG画像の設定
    const width = 1200;
    const height = 630;
    const canvas = new Canvas(width, height);
    const ctx = canvas.getContext('2d');

    // 背景色を描画
    ctx.fillStyle = '#15202b'; // Twitterダークモード風の背景色
    ctx.fillRect(0, 0, width, height);

    // タイトル描画
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 64px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText("In Grok's Mind", width / 2, height / 2 - 40);

    // サブタイトル
    ctx.font = '36px sans-serif';
    ctx.fillText("Answer as if you were Grok!", width / 2, height / 2 + 40);

    // フッター（Twitterスタイル）
    ctx.fillStyle = '#1d9bf0'; // Twitter Blue
    ctx.font = '24px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('#BeGrok', width - 50, height - 50);
    ctx.fillText('#InGrokMind', width - 50, height - 20);

    // 左下にクレジット
    ctx.textAlign = 'left';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('© from-garage 2025', 50, height - 20);

    // 生成時刻
    const now = new Date().toISOString();
    ctx.font = '14px sans-serif';
    ctx.fillText(`Generated: ${now}`, 50, height - 50);

    // 画像をファイルに書き出し
    const buffer = await canvas.toBuffer('png');
    fs.writeFileSync(outputPath, buffer);

    console.log(`OG画像が生成されました: ${outputPath}`);
  } catch (error) {
    console.error('Error generating OG image:', error);
  }
}

// 画像生成を実行
generateImage();