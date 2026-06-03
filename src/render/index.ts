import type { Browser, Page, Response as PlaywrightResponse } from 'playwright'
import { errors as PlaywrightErrors } from 'playwright'
import { runWithDefer } from 'with-defer'

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

function errorRenderResult(status: 502 | 504): RenderResult {
  return {
    status,
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
  waitUntil: LifecycleEvent,
): Promise<EvaluateResult> {
  try {
    const result = await page.evaluate(script, { waitUntil })
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
  waitUntil: LifecycleEvent,
): Promise<EvaluateResult[]> {
  return Promise.all(
    (evaluates ?? []).map((script) => evaluateScript(page, script, waitUntil)),
  )
}

type NavigationResult =
  | {
      ok: true
      response: PlaywrightResponse | null
      evaluateResults: EvaluateResult[]
    }
  | { ok: false; status: 502 | 504 }

function classifyNavigationError(error: unknown): 502 | 504 {
  return error instanceof PlaywrightErrors.TimeoutError ? 504 : 502
}

function captureNavigationResponse(page: Page): {
  get: () => PlaywrightResponse | null
  detach: () => void
} {
  let captured: PlaywrightResponse | null = null
  const handler = (response: PlaywrightResponse) => {
    if (response.request().isNavigationRequest()) {
      captured = response
    }
  }
  page.on('response', handler)
  return {
    get: () => captured,
    detach: () => page.off('response', handler),
  }
}

async function tryGoto(
  page: Page,
  request: Required<Pick<RenderRequest, 'url' | 'waitUntil'>> & RenderRequest,
  capture: ReturnType<typeof captureNavigationResponse>,
): Promise<NavigationResult> {
  try {
    const response = await page.goto(request.url, {
      waitUntil: request.waitUntil,
      timeout: request.timeout,
    })
    const evaluateResults = await collectEvaluateResults(
      page,
      request.evaluates,
      request.waitUntil,
    )
    return { ok: true, response: response ?? capture.get(), evaluateResults }
  } catch (error) {
    return { ok: false, status: classifyNavigationError(error) }
  }
}

async function navigatePage(
  page: Page,
  request: Required<Pick<RenderRequest, 'url' | 'waitUntil'>> & RenderRequest,
): Promise<NavigationResult> {
  // Track the main-frame response so we can detect server replies even when
  // page.goto() throws (e.g. 204 No Content aborts the document load).
  const capture = captureNavigationResponse(page)
  const result = await tryGoto(page, request, capture)
  capture.detach()
  const serverResponse = capture.get()
  if (!result.ok && serverResponse) {
    return { ok: true, response: serverResponse, evaluateResults: [] }
  }
  return result
}

function hasNoBody(status: number): boolean {
  return status === 204 || status === 304 || (status >= 100 && status < 200)
}

async function readRenderedBody(
  page: Page,
  response: PlaywrightResponse,
): Promise<Buffer> {
  if (hasNoBody(response.status())) {
    return Buffer.from('')
  }
  const headers = { ...response.headers() }
  if (isRenderableContentType(headers['content-type'] || '')) {
    return Buffer.from(await page.content())
  }
  return response.body()
}

async function buildRenderResult(
  page: Page,
  navigationResult: NavigationResult,
): Promise<RenderResult> {
  if (!navigationResult.ok) {
    return errorRenderResult(navigationResult.status)
  }
  if (!navigationResult.response) {
    // page.goto() returned null without an exception (e.g. origin sent 204 No Content).
    // This is a valid upstream response, not a gateway error.
    return {
      status: 204,
      headers: {},
      body: Buffer.from(''),
      evaluateResults: [],
    }
  }
  const headers = { ...navigationResult.response.headers() }
  return {
    status: navigationResult.response.status(),
    headers,
    body: await readRenderedBody(page, navigationResult.response),
    evaluateResults: navigationResult.evaluateResults,
  }
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
    return buildRenderResult(page, navigationResult)
  })
}
