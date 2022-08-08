import http from 'http';

import { type Browser } from 'playwright';

import { SelectableBrowsers, withBrowser } from '../browser';
import { excludeUnusedHeaders } from '../lib/headers';
import { nestWith, runWith } from '../lib/run_with';
import { isAbsoluteURL } from '../lib/url';
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

export function terminateRequestWithEmpty(
  req: http.IncomingMessage,
  res: http.ServerResponse
) {
  res.writeHead(204);
  res.end();
}

async function* withServerPre(arg: {
  port: number;
  browser: Browser;
}): AsyncIterable<http.Server> {
  const { port, browser } = arg;
  const server = http.createServer(createHandler(browser));
  await new Promise((resolve) => {
    server.listen(port, () => {
      resolve(undefined);
    });
  });
  try {
    yield server;
  } finally {
    server.close();
  }
}

export function withServer({
  port = 8080,
  name = 'chromium',
  headless = true,
}: ServerArgument = {}): AsyncIterable<http.Server> {
  return nestWith(withBrowser({ name, headless }), (browser) =>
    withServerPre({ browser, port })
  );
}

export async function main({
  port = 8080,
  name = 'chromium',
  headless = true,
}: ServerArgument = {}): Promise<void> {
  runWith(withServer({ port, name, headless }), async () => {
    await new Promise((resolve) => {
      process.on('exit', (err) => {
        resolve(err);
      });
    });
  });
}
