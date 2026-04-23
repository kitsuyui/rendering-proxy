import http from 'node:http'

import type { Browser } from 'playwright'
import { runWithDefer } from 'with-defer'

import { getBrowser, type SelectableBrowsers } from '../browser'
import { excludeUnusedHeaders } from '../lib/headers'
import { isAbsoluteURL } from '../lib/url'
import { waitForProcessExit } from '../lib/wait_for_exit'
import { getRenderedContent } from '../render'

import { parseRenderingProxyHeader } from './request_options'

interface ServerArgument {
  port?: number
  name?: SelectableBrowsers
  headless?: boolean
}

type IncomingRenderRequest =
  | { type: 'health' }
  | { type: 'invalid' }
  | { type: 'render'; request: Parameters<typeof getRenderedContent>[1] }

function resolveOriginUrl(requestUrl: string | undefined): string | null {
  if (!requestUrl) {
    return null
  }

  const originUrl = requestUrl.slice(1)
  return originUrl && isAbsoluteURL(originUrl) ? originUrl : null
}

function parseIncomingRenderRequest(
  request: http.IncomingMessage,
): IncomingRenderRequest {
  if (request.url === '/health/') {
    return { type: 'health' }
  }

  const originUrl = resolveOriginUrl(request.url)
  if (!originUrl) {
    return { type: 'invalid' }
  }

  return {
    type: 'render',
    request: {
      url: originUrl,
      ...parseRenderingProxyHeader(request.headers['x-rendering-proxy']),
    },
  }
}

async function renderToResponse(
  browser: Browser,
  res: http.ServerResponse,
  request: Parameters<typeof getRenderedContent>[1],
): Promise<void> {
  const renderedContent = await getRenderedContent(browser, request)
  const headers = {
    ...excludeUnusedHeaders(renderedContent.headers),
    'x-rendering-proxy': JSON.stringify(renderedContent.evaluateResults),
  }
  res.writeHead(renderedContent.status, headers)
  res.end(renderedContent.body, 'binary')
}

async function respondToIncomingRequest(
  browser: Browser,
  req: http.IncomingMessage,
  res: http.ServerResponse,
): Promise<void> {
  const parsedRequest = parseIncomingRenderRequest(req)
  const handlers: Record<IncomingRenderRequest['type'], () => Promise<void>> = {
    health: async () => {
      res.writeHead(200)
      res.end('OK')
    },
    invalid: async () => {
      terminateRequestWithEmpty(req, res)
    },
    render: async () => {
      if (parsedRequest.type !== 'render') {
        return
      }
      await renderToResponse(browser, res, parsedRequest.request)
    },
  }

  await handlers[parsedRequest.type]()
}

export function createHandler(browser: Browser) {
  return async function renderHandler(
    req: http.IncomingMessage,
    res: http.ServerResponse,
  ) {
    await respondToIncomingRequest(browser, req, res)
  }
}

export async function createServer({
  browser,
  port = 8080,
}: {
  browser: Browser
  port: number
}): Promise<http.Server> {
  const server = http.createServer(createHandler(browser))
  await new Promise((resolve) => {
    server.listen(port, () => {
      resolve(undefined)
    })
  })
  return server
}

/**
 * Terminate request with empty response.
 * @param req {http.IncomingMessage} request object
 * @param res {http.ServerResponse} response object
 */
export function terminateRequestWithEmpty(
  _req: http.IncomingMessage,
  res: http.ServerResponse,
) {
  // 204 No Content
  res.writeHead(204)
  res.end()
}

/**
 * Start rendering proxy server.
 * @param port {number} port number
 * @param name {string} browser name
 * @param headless {boolean} headless mode
 * @returns {Promise<void>}
 */
export async function main({
  port = 8080,
  name = 'chromium',
  headless = true,
}: ServerArgument = {}): Promise<void> {
  await runWithDefer(async (defer) => {
    const browser = await getBrowser({ name, headless })
    defer(() => browser.close())

    const server = await createServer({ browser, port })
    defer(() => server.close())

    await waitForProcessExit()
  })
}
