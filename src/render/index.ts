import { type Browser } from 'playwright';
import { runWithDefer } from 'with-defer';

export const lifeCycleEvents = [
  'load',
  'domcontentloaded',
  'networkidle',
  'commit',
] as const;
export type LifecycleEvent = (typeof lifeCycleEvents)[number];

export interface RenderRequest {
  url: string;
  waitUntil?: LifecycleEvent;
  evaluates?: string[];
}

export interface EvaluateResult {
  success: boolean;
  script: string;
  result: unknown;
}

export interface RenderResult {
  status: number;
  headers: { [key: string]: string };
  body: Buffer;
  evaluateResults: EvaluateResult[];
}

function emptyRenderResult(): RenderResult {
  return {
    status: 204,
    headers: {},
    body: Buffer.from(''),
    evaluateResults: [],
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

  return await runWithDefer(async (defer) => {
    const page = await browser.newPage();
    defer(() => page.close());

    let response;
    const evaluateResults = [];
    try {
      response = await page.goto(url, { waitUntil });
      if (request.evaluates) {
        for (const evaluate of request.evaluates) {
          try {
            const result = await page.evaluate(evaluate, { waitUntil });
            evaluateResults.push({ success: true, result, script: evaluate });
          } catch (error) {
            evaluateResults.push({
              success: false,
              result: String(error),
              script: evaluate,
            });
          }
        }
      }
    } catch (error) {
      return emptyRenderResult();
    }

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
      evaluateResults,
    };
  });
}
