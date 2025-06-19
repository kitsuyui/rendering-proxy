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

export function createHandler(browser: Browser) {
  return async function renderHandler(
    req: http.IncomingMessage,
    res: http.ServerResponse,
  ) {
    if (!req.url) return terminateRequestWithEmpty(req, res)
    if (req.url === '/health/') {
      res.writeHead(200)
      res.end('OK')
      return
    }
    const originUrl = req.url.slice(1)
    if (!originUrl) return terminateRequestWithEmpty(req, res)
    if (!isAbsoluteURL(originUrl)) return terminateRequestWithEmpty(req, res)

    const options = parseRenderingProxyHeader(req.headers['x-rendering-proxy'])
    const renderedContent = await getRenderedContent(browser, {
      url: originUrl,
      ...options,
    })

    const headers = {
      ...excludeUnusedHeaders(renderedContent.headers),
      'x-rendering-proxy': JSON.stringify(renderedContent.evaluateResults),
    }
    const status = renderedContent.status
    res.writeHead(status, headers)
    res.end(renderedContent.body, 'binary')
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
