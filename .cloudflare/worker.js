import { getAssetFromKV, mapRequestToAsset } from '@cloudflare/kv-asset-handler';

/**
 * Cloudflare WorkersでNext.jsの静的エクスポートを配信するためのスクリプト
 */
addEventListener('fetch', event => {
  try {
    event.respondWith(handleEvent(event));
  } catch (e) {
    event.respondWith(new Response('Internal Error', { status: 500 }));
  }
});

/**
 * リクエストを処理し、静的アセットを取得する
 */
async function handleEvent(event) {
  const url = new URL(event.request.url);
  let options = {};

  try {
    // 動的ルートの処理（例：/result/[id]）
    if (url.pathname.startsWith('/result/')) {
      // /result/[id]のパターンに一致する場合、index.htmlにフォールバック
      options.mapRequestToAsset = req => {
        return mapRequestToAsset(new Request(`${new URL(req.url).origin}/index.html`, req));
      };
    }

    // 404エラーをindex.htmlにリダイレクト（SPAクライアントサイドルーティング用）
    options.notFoundPageHandler = async request => {
      return getAssetFromKV(event, {
        mapRequestToAsset: req => {
          return mapRequestToAsset(new Request(`${new URL(req.url).origin}/index.html`, req));
        }
      });
    };

    // APIエンドポイントの処理（静的サイトでは動作しない）
    if (url.pathname.startsWith('/api/')) {
      return new Response(JSON.stringify({
        error: 'API endpoints are not available in static export mode'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // KVストレージからアセットを取得
    const page = await getAssetFromKV(event, options);

    // キャッシュコントロールの設定
    const response = new Response(page.body, page);
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

    // ページの種類に応じたキャッシュ設定
    if (url.pathname.startsWith('/static/')) {
      // 静的アセットは長期キャッシュ
      response.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
    } else {
      // HTMLは短期キャッシュ
      response.headers.set('Cache-Control', 'public, max-age=0, must-revalidate');
    }

    return response;
  } catch (e) {
    // エラー時の処理
    console.error('KV Asset Handler Error:', e);
    
    // 404エラーの場合はindex.htmlを返す
    if (e.status === 404) {
      return getAssetFromKV(event, {
        mapRequestToAsset: req => mapRequestToAsset(new Request(`${new URL(req.url).origin}/index.html`, req))
      });
    }

    return new Response('Error: ' + (e.message || 'Unknown error'), { status: 500 });
  }
}