import { chromium, type Browser } from 'playwright';
import { excludeUnusedHeaders } from './lib/headers';
import { isAbsoluteURL } from './lib/url';
import http from 'http';

export async function getBrowser(): Promise<Browser> {
  const browser = await chromium.launch({
    headless: true,
  });
  return browser;
}

const server = http.createServer(async function (req, res) {
  if (!req.url) return;
  const originUrl = req.url.slice(1);
  if (!originUrl) return;
  if (!isAbsoluteURL(originUrl)) return;

  const browser = await getBrowser();
  const context = await browser.newContext();
  const page = await context.newPage();
  const response = await page.goto(originUrl);
  if (!response) {
    res.statusCode = 502;
    res.end();
    return;
  }
  const body = await response.body();
  const headers = excludeUnusedHeaders({ ...response.headers() });
  const status = response.status();
  res.writeHead(status, headers);
  res.end(body, 'binary');
});

server.listen(8080);
