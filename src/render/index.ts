import { type Browser } from 'playwright';

import { withPage } from '../browser';

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

  for await (const page of withPage(browser)) {
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
  /* istanbul ignore next */
  return emptyRenderResult(); // unreachable
}
