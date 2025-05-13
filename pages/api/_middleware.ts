import type { NextApiRequest, NextApiResponse } from 'next';
import type { NextApiHandler, NextApiMiddleware } from 'next';

// POSTリクエストの本文を解析するミドルウェア
export const bodyParser: NextApiMiddleware = (handler) => async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST' && !req.body) {
    // Content-Typeがapplication/jsonの場合
    if (req.headers['content-type']?.includes('application/json')) {
      try {
        // リクエストストリームからJSONを読み込む
        const buffer = await readRequestBody(req);
        req.body = JSON.parse(buffer.toString());
      } catch (error) {
        console.error('Error parsing JSON body:', error);
        req.body = {};
      }
    }
    // Content-Typeがapplication/x-www-form-urlencodedの場合
    else if (req.headers['content-type']?.includes('application/x-www-form-urlencoded')) {
      try {
        const buffer = await readRequestBody(req);
        const text = buffer.toString();
        const params = new URLSearchParams(text);
        const body: Record<string, string> = {};
        
        // URLSearchParamsをオブジェクトに変換
        for (const [key, value] of params.entries()) {
          body[key] = value;
        }
        
        req.body = body;
      } catch (error) {
        console.error('Error parsing form data:', error);
        req.body = {};
      }
    }
    // multipart/form-dataの場合は別途ライブラリが必要なので、ここでは対応しない
  }
  
  return handler(req, res);
};

// リクエストボディを読み込む関数
const readRequestBody = (req: NextApiRequest): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    const bodyParts: Buffer[] = [];
    let body: Buffer;
    
    req.on('data', (chunk: Buffer) => {
      bodyParts.push(chunk);
    });
    
    req.on('end', () => {
      body = Buffer.concat(bodyParts);
      resolve(body);
    });
    
    req.on('error', (error) => {
      reject(error);
    });
  });
};