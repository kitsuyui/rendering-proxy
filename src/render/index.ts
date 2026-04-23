import type { Browser, Response as PlaywrightResponse } from 'playwright'
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
}

export interface EvaluateResult {
  success: boolean
  script: string
  result: unknown
}

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
  page: Awaited<ReturnType<Browser['newPage']>>,
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
  page: Awaited<ReturnType<Browser['newPage']>>,
  evaluates: string[] | undefined,
  waitUntil: LifecycleEvent,
): Promise<EvaluateResult[]> {
  return Promise.all(
    (evaluates ?? []).map((script) => evaluateScript(page, script, waitUntil)),
  )
}

async function navigatePage(
  page: Awaited<ReturnType<Browser['newPage']>>,
  request: Required<Pick<RenderRequest, 'url' | 'waitUntil'>> & RenderRequest,
): Promise<{
  response: PlaywrightResponse | null
  evaluateResults: EvaluateResult[]
} | null> {
  try {
    const response = await page.goto(request.url, {
      waitUntil: request.waitUntil,
    })
    const evaluateResults = await collectEvaluateResults(
      page,
      request.evaluates,
      request.waitUntil,
    )
    return {
      response,
      evaluateResults,
    }
  } catch {
    return null
  }
}

async function readRenderedBody(
  page: Awaited<ReturnType<Browser['newPage']>>,
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
    const page = await browser.newPage()
    defer(() => page.close())

    const navigationResult = await navigatePage(page, normalizedRequest)
    if (!navigationResult?.response) {
      return emptyRenderResult()
    }

    const headers = { ...navigationResult.response.headers() }
    return {
      status: navigationResult.response.status(),
      headers,
      body: await readRenderedBody(page, navigationResult.response),
      evaluateResults: navigationResult.evaluateResults,
    }
  })
}
