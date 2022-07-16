import http from 'http';
import { IncomingMessage, ServerResponse } from 'http';
// const accesslog = require("access-log");
import { getRenderedContent } from './utils';
import { getPuppeteer } from './chromium';

export async function serverMain(port: number) {
  const browser = await getPuppeteer();

  const httpServer = http.createServer(
    async (req: IncomingMessage, res: ServerResponse) => {
      const evaluate = undefined;
      const waitUntil = undefined;
      if (!req.url) return;
      const url = req.url.slice(1);

      if (!(url.startsWith('https://') || url.startsWith('http://'))) {
        res.writeHead(204);
        res.end();
        return;
      }

      // accesslog(req, res);
      const result = await getRenderedContent(browser, url, {
        evaluate,
        waitUntil,
      });
      if (result.errors.length > 0) {
        res.statusCode = 502;
        const errorMessage = encodeURI(result.errors.join('\n'));
        res.setHeader('X-UA-Errors', errorMessage);
      }
      for (const key of Object.keys(result.headers)) {
        if (ignoreHeaders.includes(key.toLowerCase())) {
          continue;
        }
        res.setHeader(key, result.headers[key]);
      }
      res.write(result.body);
      res.end();
    }
  );
  httpServer.listen(port);
}

const ignoreHeaders = [
  'accept-ranges',
  'content-length',
  'transfer-encoding',
  'connection',
  'content-encoding',
];
