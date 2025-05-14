import { Html, Head, Main, NextScript } from 'next/document';
import { GA_MEASUREMENT_ID } from '../utils/analytics';

export default function Document() {
  return (
    <Html lang="ja" prefix="og: http://ogp.me/ns#">
      <Head>
        {/* Google Analytics */}
        {GA_MEASUREMENT_ID && (
          <>
            <script
              async
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
            />
            <script
              dangerouslySetInnerHTML={{
                __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_MEASUREMENT_ID}', {
                  page_path: window.location.pathname,
                });
              `,
              }}
            />
          </>
        )}

        {/* Add default OG image fallback metadata */}
        <meta property="og:type" content="website" />
        <meta property="og:image:type" content="image/png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@from_garage" />
        
        {/* デフォルトOGP画像 - ページ単位で上書き可能 */}
        <meta property="og:image" content="https://in-grok-mind.vercel.app/og-image-home-new.png?t=20250513" />
        <meta name="twitter:image" content="https://in-grok-mind.vercel.app/og-image-home-new.png?t=20250513" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}