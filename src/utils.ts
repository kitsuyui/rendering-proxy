import {
  Browser,
  Page,
  HTTPResponse,
  ConsoleMessageType,
  ConsoleMessageLocation,
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

export async function getRenderedContent(
  browser: Browser,
  url: string,
  { evaluate, waitUntil }: { evaluate?: string; waitUntil: WaitUntil }
): Promise<Response | null> {
  const page = await browser.newPage();
  const consoleLogs: ConsoleItem[] = [];
  const errors: string[] = [];
  page.on('console', (message) => {
    consoleLogs.push({
      type: message.type(),
      text: message.text().toString(),
      location: message.location(),
    });
  });
  page.on('pageerror', (err) => {
    errors.push(err.toString());
  });
  try {
    const response = await page.goto(url, { waitUntil });
    if (evaluate) {
      try {
        await page.evaluate(evaluate);
      } catch (err) {
        errors.push(String(err));
      }
    }
    if (!response) {
      return null;
    }
    return await getContent(page, response, errors, consoleLogs);
  } finally {
    await page.close();
  }
}

export function isContentTypeHTML(contentType: string): boolean {
  const htmlContentTypes = ['text/html', 'application/xhtml+xml'];
  return htmlContentTypes.some((htmlContentType) => {
    return contentType.startsWith(htmlContentType);
  });
}

async function getContent(
  page: Page,
  response: HTTPResponse,
  errors: string[],
  consoleLogs: ConsoleItem[]
): Promise<Response> {
  const headers = Object.assign({}, response.headers());
  if (isContentTypeHTML(headers['content-type'])) {
    const script = () => document.documentElement.outerHTML;
    const textHTML = await page.evaluate(script);
    return new Response(headers, Buffer.from(textHTML), errors, consoleLogs);
  }
  return new Response(headers, await response.buffer(), errors, consoleLogs);
}

class Response {
  headers: { [key: string]: string };
  body: Buffer;
  errors: string[];
  consoleLogs: ConsoleItem[];

  constructor(
    headers: { [key: string]: string },
    body: Buffer,
    errors: string[],
    consoleLogs: ConsoleItem[]
  ) {
    this.headers = headers;
    this.body = body;
    this.errors = errors;
    this.consoleLogs = consoleLogs;
  }
}
