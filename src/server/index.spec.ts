import { execSync } from 'node:child_process'
import http, { type IncomingMessage } from 'node:http'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { runWithDefer } from 'with-defer'

import { getBrowser } from '../browser'
import { waitServerReady } from '../test-helpers/server'
import {
  createServer,
  parseIncomingRenderRequest,
  terminateRequestWithEmpty,
} from './index'

let dockerId: string | null = null
let httpbinUrl = 'http://httpbin'

beforeAll(async () => {
  if (!process.env.RUNNING_IN_DOCKER) {
    const proc = execSync('docker run -d -p 8082:80 kennethreitz/httpbin')
    httpbinUrl = 'http://localhost:8082'
    dockerId = proc.toString().trim()
  }
  await waitServerReady(httpbinUrl)
})

afterAll(() => {
  if (dockerId) {
    execSync(`docker kill ${dockerId}`)
    execSync(`docker rm ${dockerId}`)
  }
})

describe('parseIncomingRenderRequest', () => {
  function makeRequest(
    url: string,
    headers: Record<string, string> = {},
  ): http.IncomingMessage {
    const req = new http.IncomingMessage(
      null as unknown as import('node:net').Socket,
    )
    req.url = url
    Object.assign(req.headers, headers)
    return req
  }

  it('returns badRequest when x-rendering-proxy header contains invalid JSON', () => {
    const req = makeRequest('/http://example.com', { 'x-rendering-proxy': '{' })
    expect(parseIncomingRenderRequest(req)).toStrictEqual({
      type: 'badRequest',
    })
  })

  it('returns render type when x-rendering-proxy header is valid JSON', () => {
    const req = makeRequest('/http://example.com', {
      'x-rendering-proxy': '{"waitUntil":"load"}',
    })
    const result = parseIncomingRenderRequest(req)
    expect(result.type).toBe('render')
  })

  it('returns health for /health/', () => {
    const req = makeRequest('/health/')
    expect(parseIncomingRenderRequest(req)).toStrictEqual({ type: 'health' })
  })

  it('returns invalid for missing URL', () => {
    const req = makeRequest('/')
    expect(parseIncomingRenderRequest(req)).toStrictEqual({ type: 'invalid' })
  })
})

describe('terminateRequestWithEmpty', () => {
  it('responses nothing', async () => {
    const port = 8090
    const server = http.createServer(terminateRequestWithEmpty)
    server.listen(port)
    const res: IncomingMessage = await new Promise((resolve) => {
      return http.get(`http://localhost:${port}/`, (res) => {
        return resolve(res)
      })
    })
    expect(res.statusCode).toBe(204)
    expect(res.read()).toBe(null)
    server.close()
  })
})

describe('withServer', () => {
  it('responses rendered content', async () => {
    const port = 8091
    const res = await runWithDefer(async (defer) => {
      const browser = await getBrowser()
      defer(() => browser.close())

      const server = await createServer({ browser, port })
      defer(() => server.close())

      const res: IncomingMessage = await new Promise((resolve) => {
        return http.get(
          `http://localhost:${port}/${httpbinUrl}/json`,
          (res) => {
            return resolve(res)
          },
        )
      })
      return res
    })
    expect(res.statusCode).toBe(200)
    expect(res.headers.vary).toBe('x-rendering-proxy')
    expect(JSON.parse(res.read().toString('utf8'))).toStrictEqual({
      slideshow: {
        author: 'Yours Truly',
        date: 'date of publication',
        slides: [
          {
            title: 'Wake up to WonderWidgets!',
            type: 'all',
          },
          {
            items: [
              'Why <em>WonderWidgets</em> are great',
              'Who <em>buys</em> WonderWidgets',
            ],
            title: 'Overview',
            type: 'all',
          },
        ],
        title: 'Sample Slide Show',
      },
    })
  })

  it('responses empty when invalid URL', async () => {
    const port = 8092
    await runWithDefer(async (defer) => {
      const browser = await getBrowser()
      defer(() => browser.close())

      const server = await createServer({ browser, port })
      defer(() => server.close())

      const res: IncomingMessage = await new Promise((resolve) => {
        return http.get(`http://localhost:${port}/`, (res) => {
          return resolve(res)
        })
      })
      expect(res.statusCode).toBe(204)
      expect(res.read()).toBe(null)
    })
  })

  it('returns 502 when browser becomes unavailable', async () => {
    const port = 8093
    const browser = await getBrowser()
    const server = await createServer({ browser, port })

    try {
      await browser.close()

      const res: IncomingMessage = await new Promise((resolve) => {
        return http.get(
          `http://localhost:${port}/${httpbinUrl}/json`,
          (res) => {
            return resolve(res)
          },
        )
      })
      expect(res.statusCode).toBe(502)
    } finally {
      server.close()
    }
  })

  it('responses health', async () => {
    const port = 8092
    const res = await runWithDefer(async (defer) => {
      const browser = await getBrowser()
      defer(() => browser.close())

      const server = await createServer({ browser, port })
      defer(() => server.close())

      const res: IncomingMessage = await new Promise((resolve) => {
        return http.get(`http://localhost:${port}/health/`, (res) => {
          return resolve(res)
        })
      })
      return res
    })
    expect(res.statusCode).toBe(200)
    expect(res.read().toString('utf8')).toBe('OK')
  })
})
