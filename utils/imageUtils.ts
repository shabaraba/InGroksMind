// サーバーサイドでの画像生成のためのユーティリティ関数

import fs from 'fs';
import path from 'path';
import { createCanvas } from 'canvas'; // node-canvasを使用（skia-canvasの代わり）
import { QuizItem } from '../data/quizData';
import { StyleVariation } from '../data/styleVariations';
import { getTranslationForLocale } from '../i18n/translations';
import { shortenUrl } from './urlShortener';

// OG画像のファイル名を生成する
export const getOgImageFilename = (
  quizId: number,
  styleId: number,
  score: number,
  locale: string = 'ja'
): string => {
  const langParam = locale === 'ja' ? 'ja' : 'en';
  return `og-${quizId}-${styleId}-${score}-${langParam}.png`;
};

// OG画像の保存パスを取得する
export const getOgImagePath = (
  quizId: number,
  styleId: number,
  score: number,
  locale: string = 'ja'
): string => {
  const filename = getOgImageFilename(quizId, styleId, score, locale);
  return path.join(process.cwd(), 'tmp', 'og-images', filename);
};

// OG画像のURLを生成する
export const generateOgImageUrl = (
  quizId: number,
  styleId: number,
  score: number,
  locale: string = 'ja',
  host: string = 'localhost:3000'
): string => {
  const protocol = host.includes('localhost') ? 'http' : 'https';
  const filename = getOgImageFilename(quizId, styleId, score, locale);

  try {
    // 保存された画像のURLを返す
    return `${protocol}://${host}/tmp-og-images/${filename}`;
  } catch (error) {
    // エラーが発生した場合は静的APIエンドポイントを使用
    return `${protocol}://${host}/api/og-image-static`;
  }
};

// 結果ページのURLを生成する
export const generateResultUrl = (
  resultId: string,
  host: string = 'localhost:3000',
  userAnswer?: string,
  locale?: string,
  quizUserId?: string,
  replyUserId?: string
): string => {
  const protocol = host.includes('localhost') ? 'http' : 'https';
  const baseUrl = `${protocol}://${host}/result/${resultId}`;

  // パラメータを追加（存在する場合のみ）
  const params = new URLSearchParams();

  if (userAnswer) {
    params.append('answer', userAnswer);
  }

  if (locale) {
    params.append('lang', locale);
  }

  if (quizUserId) {
    params.append('quizUserId', quizUserId);
  }

  if (replyUserId) {
    params.append('replyUserId', replyUserId);
  }

  // 長いURLを生成
  const fullUrl = params.toString() ? `${baseUrl}?${params.toString()}` : baseUrl;

  // 短縮URLを生成して返す
  try {
    return shortenUrl(fullUrl);
  } catch (error) {
    console.error('Error shortening URL:', error);
    return fullUrl; // エラー時は元のURLを返す
  }
};

// OG画像を生成してファイルに保存する
export const generateAndSaveOgImage = async (
  quizId: number,
  styleId: number,
  score: number,
  quiz: QuizItem,
  style: StyleVariation,
  locale: string = 'ja'
): Promise<string> => {
  try {
    // OG画像の保存パスを取得
    const filePath = getOgImagePath(quizId, styleId, score, locale);

    // 既に画像が存在する場合はそのパスを返す
    if (fs.existsSync(filePath)) {
      return filePath;
    }

    // 保存ディレクトリが存在しない場合は作成
    const dirPath = path.dirname(filePath);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }

    // 画像生成
    const width = 1200;
    const height = 630;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');
    const isJapanese = locale === 'ja';

    // コンテンツを準備
    const quizContent = isJapanese ? quiz.content_ja : quiz.content_en;
    const styleName = isJapanese ? style.name_ja : style.name_en;
    const title = isJapanese ? 'Grokの気持ち' : "In Grok's Mind";

    // 宇宙風の背景
    // ディープスペースのグラデーション背景
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#0B0B1A'); // 暗い宇宙の色
    gradient.addColorStop(0.5, '#151B30'); // 少し明るい宇宙の色
    gradient.addColorStop(1, '#0C0E1A'); // 暗い青紫色
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // 遠くの星々（小さな点）
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    const starCount = 500; // 星の数
    for (let i = 0; i < starCount; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const size = Math.random() * 1.5;

        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
    }

    // 明るい星（ランダムなサイズと輝き）
    for (let i = 0; i < 50; i++) {
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

    // 星雲（カラフルな霧状の領域）
    const nebulaCount = 3;
    const nebulaColors = [
        'rgba(138, 43, 226, 0.1)', // 紫
        'rgba(30, 144, 255, 0.1)', // 青
        'rgba(255, 20, 147, 0.1)'  // ピンク
    ];

    for (let i = 0; i < nebulaCount; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const radius = Math.random() * 300 + 200;

        const nebulaGradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
        nebulaGradient.addColorStop(0, nebulaColors[i % nebulaColors.length]);
        nebulaGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = nebulaGradient;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
    }

    // 宇宙風の輝く枠線
    // 外側の輝く枠線（星のような青紫色）
    ctx.strokeStyle = '#8A2BE2'; // 明るい紫
    ctx.lineWidth = 6;
    ctx.strokeRect(20, 20, width - 40, height - 40);

    // グロー効果のための2重枠線
    ctx.strokeStyle = 'rgba(138, 43, 226, 0.4)'; // 薄い紫
    ctx.lineWidth = 12;
    ctx.strokeRect(15, 15, width - 30, height - 30);

    // 内側の輝く枠線
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.lineWidth = 1;
    ctx.strokeRect(30, 30, width - 60, height - 60);

    // タイトル背景（宇宙風の輝く背景）
    // グラデーション背景
    const titleGradient = ctx.createLinearGradient(width / 2 - 300, 30, width / 2 + 300, 130);
    titleGradient.addColorStop(0, 'rgba(138, 43, 226, 0.4)'); // 紫
    titleGradient.addColorStop(0.5, 'rgba(75, 0, 130, 0.6)'); // 暗い紫
    titleGradient.addColorStop(1, 'rgba(138, 43, 226, 0.4)'); // 紫
    ctx.fillStyle = titleGradient;

    // 角丸の長方形を描画
    ctx.beginPath();
    ctx.roundRect(width / 2 - 300, 30, 600, 100, 15);
    ctx.fill();

    // 輝きを追加
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(width / 2 - 300, 30, 600, 100, 15);
    ctx.stroke();

    // タイトル描画（輝く文字）
    // テキストの影
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.font = 'bold 60px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(title, width / 2 + 2, 95 + 2); // 影効果

    // メインテキスト
    ctx.fillStyle = '#ffffff';
    ctx.fillText(title, width / 2, 95);

    // クイズ情報 - 宇宙風に輝く文字だけ（枠なし）
    // 光る文字
    ctx.shadowColor = 'rgba(30, 144, 255, 0.8)';
    ctx.shadowBlur = 10;
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 34px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(isJapanese ? 'お題:' : 'Question:', width / 2, 165);

    // 影をリセット
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;

    // クイズ内容を折り返して描画
    const maxLineWidth = 1000;
    const wrapText = (text: string, x: number, y: number, maxWidth: number, lineHeight: number): number => {
      const words = text.split(' ');
      let line = '';
      let testLine = '';
      let lineCount = 0;

      // 日本語の場合は異なる処理
      if (isJapanese) {
        // 文字単位で折り返し
        const chars = text.split('');
        line = '';
        for (let i = 0; i < chars.length; i++) {
          testLine = line + chars[i];
          const metrics = ctx.measureText(testLine);
          if (metrics.width > maxWidth && i > 0) {
            ctx.fillText(line, x, y + (lineCount * lineHeight));
            line = chars[i];
            lineCount++;
          } else {
            line = testLine;
          }
        }
        ctx.fillText(line, x, y + (lineCount * lineHeight));
      } else {
        // 英語は単語単位で折り返し
        for (let i = 0; i < words.length; i++) {
          testLine = line + words[i] + ' ';
          const metrics = ctx.measureText(testLine);
          if (metrics.width > maxWidth && i > 0) {
            ctx.fillText(line, x, y + (lineCount * lineHeight));
            line = words[i] + ' ';
            lineCount++;
          } else {
            line = testLine;
          }
        }
        ctx.fillText(line, x, y + (lineCount * lineHeight));
      }
      return lineCount;
    };

    // クイズ内容描画
    const lineHeight = 40;
    const textStartY = 200;
    const lineCount = wrapText(quizContent, width / 2, textStartY, maxLineWidth, lineHeight);

    // スタイル情報描画 - 宇宙風の輝く文字だけ（枠なし）
    const styleY = textStartY + (lineCount + 1) * lineHeight;

    // 光る文字効果（スタイルラベル）
    ctx.shadowColor = 'rgba(255, 20, 147, 0.8)';
    ctx.shadowBlur = 8;
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 30px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(isJapanese ? '指定された口調:' : 'Style:', width / 2, styleY);

    // 影をリセット
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;

    // スタイル名（輝く文字、枠なし）
    ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
    ctx.shadowBlur = 10;
    ctx.fillStyle = '#ff9ff3'; // 明るいピンク
    ctx.font = 'bold 32px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(styleName, width / 2, styleY + lineHeight);

    // 影をリセット
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;

    // スコア表示 - 宇宙風の輝くスコアボード
    const scoreY = styleY + lineHeight * 3;

    // スコアに応じた色を設定（星の輝きのような色）
    let scoreColor, scoreGlowColor, scoreBackground;
    if (score >= 80) {
      scoreColor = '#4ade80'; // 緑
      scoreGlowColor = 'rgba(74, 222, 128, 0.8)'; // 緑の光
      scoreBackground = 'rgba(74, 222, 128, 0.2)'; // 薄い緑の背景
    } else if (score >= 60) {
      scoreColor = '#facc15'; // 黄色
      scoreGlowColor = 'rgba(250, 204, 21, 0.8)'; // 黄色の光
      scoreBackground = 'rgba(250, 204, 21, 0.2)'; // 薄い黄色の背景
    } else {
      scoreColor = '#f87171'; // 赤
      scoreGlowColor = 'rgba(248, 113, 113, 0.8)'; // 赤の光
      scoreBackground = 'rgba(248, 113, 113, 0.2)'; // 薄い赤の背景
    }

    // スコアボードの背景（星空の中の光る板）
    const scoreGradient = ctx.createRadialGradient(
      width / 2, scoreY, 50,
      width / 2, scoreY, 300
    );
    scoreGradient.addColorStop(0, scoreBackground);
    scoreGradient.addColorStop(0.7, 'rgba(0, 0, 0, 0.5)');
    scoreGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = scoreGradient;
    ctx.beginPath();
    ctx.roundRect(width / 2 - 250, scoreY - 50, 500, 100, 20);
    ctx.fill();

    // 輝くスコアボードの外枠
    ctx.strokeStyle = scoreColor;
    ctx.lineWidth = 3;
    ctx.shadowColor = scoreGlowColor;
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.roundRect(width / 2 - 250, scoreY - 50, 500, 100, 20);
    ctx.stroke();

    // スコアラベル（光る文字）- 中央に配置
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
    ctx.shadowBlur = 10;
    ctx.font = 'bold 40px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(isJapanese ? '総合評価' : 'Total Score', width / 2, scoreY - 15);

    // スコア値（特に輝く大きな文字）- 中央に配置
    ctx.fillStyle = scoreColor;
    ctx.shadowColor = scoreGlowColor;
    ctx.shadowBlur = 20;
    ctx.font = 'bold 64px sans-serif';
    ctx.fillText(`${score}/100`, width / 2, scoreY + 45);

    // 効果：小さな光の粒子（スコアの周りに散らばる星）
    for (let i = 0; i < 30; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * 200 + 100;
      const particleX = width / 2 + Math.cos(angle) * distance;
      const particleY = scoreY + Math.sin(angle) * distance / 2; // 楕円に散らばる
      const size = Math.random() * 2 + 1;

      ctx.fillStyle = scoreColor;
      ctx.shadowColor = scoreGlowColor;
      ctx.shadowBlur = 5;
      ctx.beginPath();
      ctx.arc(particleX, particleY, size, 0, Math.PI * 2);
      ctx.fill();
    }

    // 影をリセット
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;

    // フッター - 宇宙風の輝くハッシュタグ
    // グラデーションフッター背景
    const footerGradient = ctx.createLinearGradient(0, height - 130, 0, height);
    footerGradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
    footerGradient.addColorStop(0.3, 'rgba(25, 25, 50, 0.5)');
    footerGradient.addColorStop(1, 'rgba(20, 20, 40, 0.8)');
    ctx.fillStyle = footerGradient;
    ctx.fillRect(0, height - 130, width, 130);

    // 宇宙の効果：フッター部分に点在する小さな星
    for (let i = 0; i < 70; i++) {
      const x = Math.random() * width;
      const y = height - Math.random() * 100;
      const size = Math.random() * 1.2;

      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }

    // ハッシュタグ（宇宙の光のような輝き）
    ctx.shadowColor = 'rgba(138, 43, 226, 0.9)'; // 紫の光
    ctx.shadowBlur = 15;
    ctx.fillStyle = '#1d9bf0'; // Twitter Blue
    ctx.font = 'bold 32px sans-serif';
    ctx.textAlign = 'right';

    // 言語に応じたハッシュタグ表示
    if (isJapanese) {
      // 日本語の場合
      ctx.fillText('#Grokの気持ち #InGroksMind', width - 50, height - 40);
    } else {
      // 英語の場合
      ctx.fillText('#InGroksMind #Grokの気持ち', width - 50, height - 40);
    }

    // 左下にクレジット（輝くテキスト）
    ctx.textAlign = 'left';
    ctx.shadowColor = 'rgba(255, 255, 255, 0.7)';
    ctx.shadowBlur = 10;
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px sans-serif';
    ctx.fillText('© from-garage 2025', 50, height - 40);

    // 影をリセット
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;

    // 生成時刻（キャッシュ対策）- 超薄い表示
    const now = new Date().toISOString();
    ctx.font = '10px sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.fillText(`Generated: ${now}`, 50, height - 15);

    // 画像をファイルに保存
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(filePath, buffer);

    return filePath;
  } catch (error) {
    console.error('Error generating OG image:', error);
    throw error;
  }
};

// シェアテキストを生成する
export const generateShareText = (
  quiz: QuizItem,
  style: StyleVariation,
  score: number,
  locale: string = 'ja',
  url?: string
): string => {
  const t = getTranslationForLocale(locale);
  const content = locale === 'ja' ? quiz.content_ja : quiz.content_en;
  const styleName = locale === 'ja' ? style.name_ja : style.name_en;

  // URLがある場合はURLつきのテキスト、ない場合はコンパクトなテキスト
  if (url) {
    return t.shareTextWithUrl
      .replace('{totalScore}', score.toString())
      .replace('{url}', url);
  } else {
    return t.shareTextCompact
      .replace('{totalScore}', score.toString());
  }
};