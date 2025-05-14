/**
 * エラーメッセージの集中管理
 * アプリケーション全体で一貫したエラーメッセージを使用するためのユーティリティ
 */

// エラータイプの列挙型
export enum ErrorType {
  API_KEY_MISSING = 'API_KEY_MISSING',
  NETWORK_ERROR = 'NETWORK_ERROR',
  RATE_LIMIT = 'RATE_LIMIT',
  INVALID_RESPONSE = 'INVALID_RESPONSE',
  REDIS_ERROR = 'REDIS_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

// エラーメッセージの型定義
interface ErrorMessages {
  title: string;
  message: string;
}

// 日本語のエラーメッセージ
const jaErrorMessages: Record<ErrorType, ErrorMessages> = {
  [ErrorType.API_KEY_MISSING]: {
    title: 'APIキーが設定されていません',
    message: '※APIキーが設定されていないため、モックデータを表示しています。'
  },
  [ErrorType.NETWORK_ERROR]: {
    title: 'ネットワークエラー',
    message: '※エラーが発生したため、モックデータを表示しています。'
  },
  [ErrorType.RATE_LIMIT]: {
    title: 'API呼び出し制限',
    message: '※APIの制限により正確な評価ができませんでした。モックデータを表示しています。'
  },
  [ErrorType.INVALID_RESPONSE]: {
    title: '不正なレスポンス',
    message: '※API応答の形式が不正です。モックデータを表示しています。'
  },
  [ErrorType.REDIS_ERROR]: {
    title: 'データストアエラー',
    message: '※データの取得に失敗しました。もう一度お試しください。'
  },
  [ErrorType.UNKNOWN_ERROR]: {
    title: '予期せぬエラー',
    message: '※予期せぬエラーが発生しました。しばらく時間をおいてから再度お試しください。'
  }
};

// 英語のエラーメッセージ
const enErrorMessages: Record<ErrorType, ErrorMessages> = {
  [ErrorType.API_KEY_MISSING]: {
    title: 'API Key is not configured',
    message: '※API key is not configured, showing mock data.'
  },
  [ErrorType.NETWORK_ERROR]: {
    title: 'Network Error',
    message: '※An error occurred, showing mock data.'
  },
  [ErrorType.RATE_LIMIT]: {
    title: 'API Rate Limit Exceeded',
    message: '※API rate limit exceeded, showing mock data.'
  },
  [ErrorType.INVALID_RESPONSE]: {
    title: 'Invalid Response',
    message: '※Invalid API response format, showing mock data.'
  },
  [ErrorType.REDIS_ERROR]: {
    title: 'Data Store Error',
    message: '※Failed to retrieve data. Please try again.'
  },
  [ErrorType.UNKNOWN_ERROR]: {
    title: 'Unexpected Error',
    message: '※An unexpected error occurred. Please try again later.'
  }
};

/**
 * エラーメッセージを取得する
 * @param type エラータイプ
 * @param locale 言語設定（ja/en）
 * @returns エラーメッセージ
 */
export const getErrorMessage = (type: ErrorType, locale: string = 'ja'): ErrorMessages => {
  const messages = locale === 'ja' ? jaErrorMessages : enErrorMessages;
  return messages[type] || messages[ErrorType.UNKNOWN_ERROR];
};

/**
 * 詳細なエラーメッセージを生成する
 * @param type エラータイプ
 * @param locale 言語設定（ja/en）
 * @param details 追加の詳細情報（エラーメッセージなど）
 * @returns 詳細なエラーメッセージ
 */
export const getDetailedErrorMessage = (type: ErrorType, locale: string = 'ja', details?: string): string => {
  const { message } = getErrorMessage(type, locale);
  if (!details) return message;
  
  return locale === 'ja'
    ? `${message} エラー詳細: ${details}`
    : `${message} Error details: ${details}`;
};

/**
 * モックのフィードバックデータ用のエラーメッセージを生成する
 * @param type エラータイプ
 * @param locale 言語設定（ja/en）
 * @returns エラーメッセージ（短いバージョン）
 */
export const getErrorMessageForFeedback = (type: ErrorType, locale: string = 'ja'): string => {
  const { message } = getErrorMessage(type, locale);
  return message;
};

/**
 * 総合エラー説明（overall_comment用）を生成する
 * @param type エラータイプ
 * @param locale 言語設定（ja/en）
 * @returns 総合エラー説明
 */
export const getOverallErrorComment = (type: ErrorType, locale: string = 'ja'): string => {
  return locale === 'ja'
    ? `※注：${getErrorMessage(type, locale).message.substring(1)} これはデモ表示です。`
    : `※Note: ${getErrorMessage(type, locale).message.substring(1)} This is a demo display.`;
};