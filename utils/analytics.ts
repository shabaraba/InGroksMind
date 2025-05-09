// Google Analytics用のユーティリティ関数

// GA4の測定IDを設定
export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_ID || '';

// ページビューをトラッキングする関数
export const pageview = (url: string) => {
  if (!GA_MEASUREMENT_ID || typeof window === 'undefined') return;
  
  window.gtag('config', GA_MEASUREMENT_ID, {
    page_path: url,
  });
};

// イベントをトラッキングする関数
export const event = ({ action, category, label, value }: {
  action: string;
  category: string;
  label?: string;
  value?: number;
}) => {
  if (!GA_MEASUREMENT_ID || typeof window === 'undefined') return;
  
  window.gtag('event', action, {
    event_category: category,
    event_label: label,
    value: value,
  });
};

// GrokとしてAnswerした時のイベント
export const trackAnswerSubmission = (score: number, style: string) => {
  event({
    action: 'submit_answer',
    category: 'engagement',
    label: `style: ${style}, score: ${score}`,
    value: score
  });
};

// 結果をシェアした時のイベント
export const trackShareResult = (score: number, platform: string = 'twitter') => {
  event({
    action: 'share_result',
    category: 'engagement',
    label: `platform: ${platform}, score: ${score}`,
    value: score
  });
};

// 言語切り替え時のイベント
export const trackLanguageSwitch = (newLanguage: string) => {
  event({
    action: 'switch_language',
    category: 'engagement',
    label: `language: ${newLanguage}`
  });
};