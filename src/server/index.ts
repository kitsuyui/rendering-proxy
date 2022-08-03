import { type Browser } from 'playwright';
import { excludeUnusedHeaders } from '../lib/headers';
import { isAbsoluteURL } from '../lib/url';
import http from 'http';
import { getBrowser, SelectableBrowsers } from '../browser';

export function createHandler(browser: Browser) {
  return async function renderHandler(
    req: http.IncomingMessage,
    res: http.ServerResponse
  ) {
    if (!req.url) return terminateRequestWithEmpty(req, res);
    const originUrl = req.url.slice(1);
    if (!originUrl) return terminateRequestWithEmpty(req, res);
    if (!isAbsoluteURL(originUrl)) return terminateRequestWithEmpty(req, res);

    const context = await browser.newContext();
    const page = await context.newPage();
    const response = await page.goto(originUrl);
    if (!response) return terminateRequestWithEmpty(req, res);

    const body = await response.body();
    const headers = excludeUnusedHeaders({ ...response.headers() });
    const status = response.status();
    res.writeHead(status, headers);
    res.end(body, 'binary');
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
  const browser = await getBrowser({ name, headless });
  const server = http.createServer(createHandler(browser));
  server.listen(port);
}
