import { Html, Head, Main, NextScript } from 'next/document';
import { GA_MEASUREMENT_ID } from '../utils/analytics';

export default function Document() {
  return (
    <Html lang="ja" prefix="og: https://ogp.me/ns#">
      <Head>
        <meta charSet="utf-8" />
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

        {/* next-seoで管理されるようになったため、ここでOGP設定は不要 */}
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}