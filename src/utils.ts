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
type ErrorInfo =
  | {
      type: ConsoleMessageType;
      text: string;
      location: ConsoleMessageLocation;
    }
  | string;

export const chromiumOptions = [
  '--disable-accelerated-2d-canvas',
  '--disable-accelerated-video-decode',
  '--disable-background-networking',
  '--disable-client-side-phishing-detection',
  '--disable-breakpad',
  '--disable-default-apps',
  '--disable-extensions',
  '--disable-gpu',
  '--disable-sync',
  '--disable-translate',
  '--font-cache-shared-handle',
  '--incognito',
  '--metrics-recording-only',
  '--mute-audio',
  '--no-default-browser-check',
  '--no-first-run',
  '--no-sandbox',
  '--safebrowsing-disable-auto-update',
];

const uaLogLevels = ['error', 'warning'];

export async function getRenderedContent(
  browser: Browser,
  url: string,
  { evaluate, waitUntil }: { evaluate?: string; waitUntil: WaitUntil }
): Promise<Response | null> {
  const page = await browser.newPage();
  const errors: ErrorInfo[] = [];
  page.on('console', (message) => {
    if (uaLogLevels.includes(message.type())) {
      errors.push({
        type: message.type(),
        text: message.text().toString(),
        location: message.location(),
      });
    }
  });
  page.on('pageerror', (err) => {
    errors.push(err.toString());
  });
  try {
    const response = await page.goto(url, { waitUntil });
    if (evaluate) {
      await page.evaluate(evaluate);
    }
    if (!response) {
      return null;
    }
    return await getContent(page, response, errors);
  } finally {
    setImmediate(async () => {
      await page.close();
    });
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
  errors: ErrorInfo[]
): Promise<Response> {
  const headers = Object.assign({}, response.headers());
  if (isContentTypeHTML(headers['content-type'])) {
    const script = () => document.documentElement.outerHTML;
    const textHTML = await page.evaluate(script);
    return new Response(headers, Buffer.from(textHTML), errors);
  }
  return new Response(headers, await response.buffer(), errors);
}

class Response {
  headers: { [key: string]: string };
  body: Buffer;
  errors: ErrorInfo[];

  constructor(
    headers: { [key: string]: string },
    body: Buffer,
    errors: ErrorInfo[]
  ) {
    this.headers = headers;
    this.body = body;
    this.errors = errors;
  }
}
