import type { Browser, Page, Response as PlaywrightResponse } from 'playwright'
import { runWithDefer } from 'with-defer'

import { excludeCacheValidationHeaders } from '../lib/headers'

export const lifeCycleEvents = [
  'load',
  'domcontentloaded',
  'networkidle',
  'commit',
] as const
export type LifecycleEvent = (typeof lifeCycleEvents)[number]

export interface RenderRequest {
  url: string
  waitUntil?: LifecycleEvent
  evaluates?: string[]
  timeout?: number
}

export type EvaluateResult =
  | { success: true; script: string; result: unknown }
  | { success: false; script: string; result: string }

export interface RenderResult {
  status: number
  headers: { [key: string]: string }
  body: Buffer
  evaluateResults: EvaluateResult[]
}

function emptyRenderResult(): RenderResult {
  return {
    status: 204,
    headers: {},
    body: Buffer.from(''),
    evaluateResults: [],
  }
}

function isRenderableContentType(contentType: string): boolean {
  // TODO: support more content types
  if (contentType.startsWith('text/html')) {
    return true
  }
  return false
}

async function evaluateScript(
  page: Page,
  script: string,
): Promise<EvaluateResult> {
  try {
    const result = await page.evaluate(script)
    return { success: true, result, script }
  } catch (error) {
    return {
      success: false,
      result: String(error),
      script,
    }
  }
}

async function collectEvaluateResults(
  page: Page,
  evaluates: string[] | undefined,
): Promise<EvaluateResult[]> {
  return Promise.all(
    (evaluates ?? []).map((script) => evaluateScript(page, script)),
  )
}

async function navigatePage(
  page: Page,
  request: Required<Pick<RenderRequest, 'url' | 'waitUntil'>> & RenderRequest,
): Promise<{
  response: PlaywrightResponse | null
  evaluateResults: EvaluateResult[]
} | null> {
  try {
    const response = await page.goto(request.url, {
      waitUntil: request.waitUntil,
      timeout: request.timeout,
    })
    const evaluateResults = await collectEvaluateResults(
      page,
      request.evaluates,
    )
    return {
      response,
      evaluateResults,
    }
  } catch (error) {
    console.error(`navigate failed: ${request.url}`, error)
    return null
  }
}

function computeResponseHeaders(response: PlaywrightResponse): {
  [key: string]: string
} {
  const headers = { ...response.headers() }
  if (isRenderableContentType(headers['content-type'] || '')) {
    return excludeCacheValidationHeaders(headers)
  }
  return headers
}

async function readRenderedBody(
  page: Page,
  response: PlaywrightResponse,
): Promise<Buffer> {
  const headers = { ...response.headers() }
  if (isRenderableContentType(headers['content-type'] || '')) {
    return Buffer.from(await page.content())
  }
  return response.body()
}

export async function getRenderedContent(
  browser: Browser,
  request: RenderRequest,
): Promise<RenderResult> {
  const normalizedRequest = {
    ...request,
    waitUntil: request.waitUntil ?? 'load',
  }

  return await runWithDefer(async (defer) => {
    const context = await browser.newContext()
    defer(() => context.close())
    const page = await context.newPage()

    const navigationResult = await navigatePage(page, normalizedRequest)
    if (!navigationResult?.response) {
      return emptyRenderResult()
    }

    return {
      status: navigationResult.response.status(),
      headers: computeResponseHeaders(navigationResult.response),
      body: await readRenderedBody(page, navigationResult.response),
      evaluateResults: navigationResult.evaluateResults,
    }
  })
}
