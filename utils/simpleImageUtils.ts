// シンプルなOG画像ユーティリティ

/**
 * タイムスタンプをクエリパラメータとして追加する
 * これはキャッシュバスティングのために使用される
 * @returns タイムスタンプ文字列（例: t=1620000000000）
 */
export const getTimestampParam = (): string => {
  return `t=${Date.now()}`;
};

/**
 * OG画像のURLを生成する
 * タイムスタンプを自動的に追加してキャッシュを回避する
 * @param quizId クイズID
 * @param styleId スタイルID
 * @param score スコア
 * @param locale 言語設定（ja/en）
 * @param host ホスト名
 * @returns OG画像URL
 */
export const generateOgImageUrl = (
  quizId: number,
  styleId: number,
  score: number,
  locale: string = 'ja',
  host: string = 'localhost:3000'
): string => {
  const protocol = host.includes('localhost') ? 'http' : 'https';
  const language = locale === 'ja' ? 'ja' : 'en';
  const timestamp = getTimestampParam();

  return `/api/og?quizId=${quizId}&styleId=${styleId}&score=${score}&locale=${language}&${timestamp}`;
};