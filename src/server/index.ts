import http from 'node:http'

import type { Browser } from 'playwright'
import { runWithDefer } from 'with-defer'

import { getBrowser, type SelectableBrowsers } from '../browser'
import {
  appendVaryHeader,
  excludeUnusedHeaders,
  sortHeaders,
} from '../lib/headers'
import { isAbsoluteURL } from '../lib/url'
import { waitForProcessExit } from '../lib/wait_for_exit'
import { getRenderedContent } from '../render'

import { PROTOCOL_VERSION, parseRenderingProxyHeader } from './request_options'

interface ServerArgument {
  port?: number
  name?: SelectableBrowsers
  headless?: boolean
  maxConcurrentRenders?: number
}

type IncomingRenderRequest =
  | { type: 'health' }
  | { type: 'invalid' }
  | { type: 'badRequest' }
  | { type: 'render'; request: Parameters<typeof getRenderedContent>[1] }

function resolveOriginUrl(requestUrl: string | undefined): string | null {
  if (!requestUrl) {
    return null
  }

  const originUrl = requestUrl.slice(1)
  return originUrl && isAbsoluteURL(originUrl) ? originUrl : null
}

export function parseIncomingRenderRequest(
  request: http.IncomingMessage,
): IncomingRenderRequest {
  if (request.url === '/health/') {
    return { type: 'health' }
  }

  const originUrl = resolveOriginUrl(request.url)
  if (!originUrl) {
    return { type: 'invalid' }
  }

  try {
    return {
      type: 'render',
      request: {
        url: originUrl,
        ...parseRenderingProxyHeader(request.headers['x-rendering-proxy']),
      },
    }
  } catch {
    return { type: 'badRequest' }
  }
}

async function renderToResponse(
  browser: Browser,
  res: http.ServerResponse,
  request: Parameters<typeof getRenderedContent>[1],
): Promise<void> {
  const renderedContent = await getRenderedContent(browser, request)
  const headers = sortHeaders(
    appendVaryHeader(
      {
        ...excludeUnusedHeaders(renderedContent.headers),
        'x-rendering-proxy': JSON.stringify(renderedContent.evaluateResults),
        'x-rendering-proxy-version': String(PROTOCOL_VERSION),
      },
      'x-rendering-proxy',
    ),
  )
  res.writeHead(renderedContent.status, headers)
  res.end(renderedContent.body, 'binary')
}

async function respondToIncomingRequest(
  browser: Browser,
  req: http.IncomingMessage,
  res: http.ServerResponse,
): Promise<void> {
  const parsedRequest = parseIncomingRenderRequest(req)
  const startMs = Date.now()
  const handlers: Record<IncomingRenderRequest['type'], () => Promise<void>> = {
    health: async () => {
      res.writeHead(200)
      res.end('OK')
    },
    invalid: async () => {
      terminateRequestWithEmpty(req, res)
    },
    badRequest: async () => {
      res.writeHead(400)
      res.end(
        'Bad Request: x-rendering-proxy header must be a valid JSON object',
      )
    },
    render: async () => {
      if (parsedRequest.type !== 'render') {
        return
      }
      await renderToResponse(browser, res, parsedRequest.request)
    },
  }

  await handlers[parsedRequest.type]()

  if (parsedRequest.type === 'render') {
    console.log(
      `render ${parsedRequest.request.url} ${res.statusCode} ${Date.now() - startMs}ms`,
    )
  }
}

function replyWithBadGateway(res: http.ServerResponse): void {
  if (!res.headersSent) {
    res.writeHead(502)
    res.end()
  }
}

async function renderWithConcurrencyLimit(
  getBrowserFn: () => Browser,
  req: http.IncomingMessage,
  res: http.ServerResponse,
  counter: { value: number },
  limit: number,
): Promise<void> {
  if (counter.value >= limit) {
    res.writeHead(503, { 'retry-after': '1' })
    res.end()
    return
  }
  counter.value++
  try {
    await respondToIncomingRequest(getBrowserFn(), req, res)
  } finally {
    counter.value--
  }
}

export function createHandler(
  getBrowserFn: () => Browser,
  { maxConcurrentRenders = 10 }: { maxConcurrentRenders?: number } = {},
) {
  const counter = { value: 0 }
  return function renderHandler(
    req: http.IncomingMessage,
    res: http.ServerResponse,
  ) {
    const parsedRequest = parseIncomingRenderRequest(req)
    const task =
      parsedRequest.type === 'render'
        ? renderWithConcurrencyLimit(
            getBrowserFn,
            req,
            res,
            counter,
            maxConcurrentRenders,
          )
        : respondToIncomingRequest(getBrowserFn(), req, res)
    task.catch(() => replyWithBadGateway(res))
  }
}

export async function createServer({
  getBrowserFn,
  port = 8080,
  maxConcurrentRenders = 10,
}: {
  getBrowserFn: () => Browser
  port: number
  maxConcurrentRenders?: number
}): Promise<http.Server> {
  const server = http.createServer(
    createHandler(getBrowserFn, { maxConcurrentRenders }),
  )
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

function closeServerGracefully(server: http.Server): Promise<void> {
  server.closeIdleConnections()
  return new Promise<void>((resolve, reject) => {
    server.close((err) => (err ? reject(err) : resolve()))
  })
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
  maxConcurrentRenders = 10,
}: ServerArgument = {}): Promise<void> {
  await runWithDefer(async (defer) => {
    let activeBrowser = await getBrowser({ name, headless })

    const onDisconnected = async () => {
      try {
        activeBrowser = await getBrowser({ name, headless })
        activeBrowser.on('disconnected', onDisconnected)
      } catch {
        // Restart failed; subsequent requests will error naturally
      }
    }
    activeBrowser.on('disconnected', onDisconnected)

    defer(async () => {
      activeBrowser.removeListener('disconnected', onDisconnected)
      await activeBrowser.close()
    })

    const server = await createServer({
      getBrowserFn: () => activeBrowser,
      port,
      maxConcurrentRenders,
    })
    defer(() => closeServerGracefully(server))

    await waitForProcessExit()
  })
}
