import {
  Browser,
  Page,
  HTTPResponse,
  ConsoleMessageType,
  ConsoleMessageLocation,
  ConsoleMessage,
} from 'puppeteer';
import type { PuppeteerLifeCycleEvent } from 'puppeteer';

export type WaitUntil =
  | PuppeteerLifeCycleEvent
  | PuppeteerLifeCycleEvent[]
  | undefined;

interface ConsoleItem {
  type: ConsoleMessageType;
  text: string;
  location: ConsoleMessageLocation;
}

interface BaseResponse {
  headers: { [key: string]: string };
  body: Buffer;
}

interface BrowserState {
  errors: string[];
  consoleLogs: ConsoleItem[];
}

type RenderResult = BaseResponse & BrowserState;

export async function getRenderedContent(
  browser: Browser,
  url: string,
  { evaluate, waitUntil }: { evaluate?: string; waitUntil: WaitUntil }
): Promise<RenderResult> {
  const page = await browser.newPage();
  const browserState: BrowserState = {
    consoleLogs: [],
    errors: [],
  };
  page.on('console', (message) => {
    browserState.consoleLogs.push(convertConsoleMessage(message));
  });
  page.on('pageerror', (err) => {
    browserState.errors.push(err.toString());
  });
  try {
    const response = await page.goto(url, { waitUntil });
    if (evaluate) {
      try {
        await page.evaluate(evaluate);
      } catch (err) {
        browserState.errors.push(String(err));
      }
    }
    if (!response) {
      return { ...emptyBaseResponse(), ...browserState };
    }
    return { ...(await getContent(page, response)), ...browserState };
  } finally {
    await page.close();
  }
}

function convertConsoleMessage(message: ConsoleMessage): ConsoleItem {
  return {
    type: message.type(),
    text: message.text().toString(),
    location: message.location(),
  };
}

export function isContentTypeHTML(contentType: string): boolean {
  const htmlContentTypes = ['text/html', 'application/xhtml+xml'];
  return htmlContentTypes.some((htmlContentType) => {
    return contentType.startsWith(htmlContentType);
  });
}

function emptyBaseResponse(): BaseResponse {
  return {
    body: Buffer.from([]),
    headers: {},
  };
}

async function getContent(
  page: Page,
  response: HTTPResponse
): Promise<BaseResponse> {
  const headers = { ...response.headers() };

  // workaround
  if (
    headers['content-type'] === 'application/json' &&
    process.env.PUPPETEER_PRODUCT === 'firefox'
  ) {
    return {
      body: Buffer.from(
        JSON.stringify({
          error: [
            'JSON content-type is not supported in Firefox yet. Use Chrome instead. See following issue:',
            'https://github.com/puppeteer/puppeteer/issues/7344',
            'https://github.com/puppeteer/puppeteer/issues/7772',
          ],
        })
      ),
      headers,
    };
  }

  if (
    headers['content-type'] === 'text/plain' &&
    process.env.PUPPETEER_PRODUCT === 'firefox'
  ) {
    /* istanbul ignore next */
    const script = () => document.documentElement.textContent || '';
    const text = await page.evaluate(script);
    return { body: Buffer.from(text), headers };
  }

  if (isContentTypeHTML(headers['content-type'] || '')) {
    /*
     * Coverage instrumentation by nyc is not working in browsers.
     * discussed at https://github.com/istanbuljs/nyc/issues/514#issuecomment-434352869
     */
    /* istanbul ignore next */
    const script = () => document.documentElement.outerHTML;
    const textHTML = await page.evaluate(script);
    return { body: Buffer.from(textHTML), headers };
  }
  return { body: await response.buffer(), headers };
}
