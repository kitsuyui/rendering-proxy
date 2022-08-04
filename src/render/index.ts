import { type Page, type Browser, type BrowserContext } from 'playwright';

export const lifeCycleEvents = [
  'load',
  'domcontentloaded',
  'networkidle',
  'commit',
] as const;
export type LifecycleEvent = typeof lifeCycleEvents[number];

export interface RenderRequest {
  url: string;
  waitUntil?: LifecycleEvent;
}

export interface RenderResult {
  status: number;
  headers: { [key: string]: string };
  body: Buffer;
}

function emptyRenderResult(): RenderResult {
  return {
    status: 204,
    headers: {},
    body: Buffer.from(''),
  };
}

function isRenderableContentType(contentType: string): boolean {
  // TODO: support more content types
  if (contentType.startsWith('text/html')) {
    return true;
  }
  return false;
}

export async function getRenderedContent(
  browser: Browser,
  request: RenderRequest
): Promise<RenderResult> {
  const { url } = request;
  const waitUntil = request.waitUntil || 'networkidle';

  for await (const context of withBrowserContext(browser)) {
    for await (const page of withPage(context)) {
      try {
        const response = await page.goto(url, { waitUntil });
        if (!response) return emptyRenderResult();
        const headers = { ...response.headers() };
        let body;
        if (isRenderableContentType(headers['content-type'] || '')) {
          body = Buffer.from(await page.content());
        } else {
          body = await response.body();
        }
        const status = response.status();
        return {
          status,
          headers,
          body,
        };
      } catch (e) {
        return emptyRenderResult();
      }
    }
  }
  /* istanbul ignore next */
  return emptyRenderResult(); // unreachable
}

async function* withBrowserContext(
  browser: Browser
): AsyncIterable<BrowserContext> {
  const context = await browser.newContext();
  try {
    yield context;
  } finally {
    context.close();
  }
}

async function* withPage(context: BrowserContext): AsyncIterable<Page> {
  const page = await context.newPage();
  try {
    yield page;
  } finally {
    page.close();
  }
}