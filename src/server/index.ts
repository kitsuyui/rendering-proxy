import http from 'http';

import { type Browser } from 'playwright';

import { getBrowser, SelectableBrowsers } from '../browser';
import { excludeUnusedHeaders } from '../lib/headers';
import { isAbsoluteURL } from '../lib/url';
import { waitForProcessExit } from '../lib/wait_for_exit';
import { withDispose } from '../lib/with_dispose';
import { getRenderedContent } from '../render';

interface ServerArgument {
  port?: number;
  name?: SelectableBrowsers;
  headless?: boolean;
}

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

export async function createServer({
  browser,
  port = 8080,
}: {
  browser: Browser;
  port: number;
}): Promise<http.Server> {
  const server = http.createServer(createHandler(browser));
  await new Promise((resolve) => {
    server.listen(port, () => {
      resolve(undefined);
    });
  });
  return server;
}

export function terminateRequestWithEmpty(
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
}: ServerArgument = {}): Promise<void> {
  await withDispose(async (dispose) => {
    const browser = await getBrowser({ name, headless });
    dispose(async () => await browser.close());

    const server = await createServer({ browser, port });
    dispose(async () => server.close());

    await waitForProcessExit();
  });
}
