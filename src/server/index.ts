import http from 'http';

import { type Browser } from 'playwright';

import { SelectableBrowsers, withBrowser } from '../browser';
import { excludeUnusedHeaders } from '../lib/headers';
import { isAbsoluteURL } from '../lib/url';
import { getRenderedContent } from '../render';

export function createHandler(browser: Browser) {
  return async function renderHandler(
    req: http.IncomingMessage,
    res: http.ServerResponse
  ) {
    if (!req.url) return terminateRequestWithEmpty(req, res);
    if (req.url === '/health/') {
      res.writeHead(200);
      res.end('OK');
      return;
    }
    const originUrl = req.url.slice(1);
    if (!originUrl) return terminateRequestWithEmpty(req, res);
    if (!isAbsoluteURL(originUrl)) return terminateRequestWithEmpty(req, res);

    const renderedContent = await getRenderedContent(browser, {
      url: originUrl,
    });
    const headers = excludeUnusedHeaders(renderedContent.headers);
    const status = renderedContent.status;
    res.writeHead(status, headers);
    res.end(renderedContent.body, 'binary');
  };
}

function terminateRequestWithEmpty(
  req: http.IncomingMessage,
  res: http.ServerResponse
) {
  res.writeHead(204);
  res.end();
}

export async function main({
  port = 8080,
  name = 'chromium',
  headless = true,
}: { port?: number; name?: SelectableBrowsers; headless?: boolean } = {}) {
  for await (const browser of withBrowser({ name, headless })) {
    const server = http.createServer(createHandler(browser));
    server.listen(port);
    await new Promise((resolve) => {
      server.on('exit', (err) => {
        resolve(err);
      });
    });
  }
}
