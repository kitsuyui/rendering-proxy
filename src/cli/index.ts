import type { Writable } from 'node:stream'

import { runWithDefer } from 'with-defer'

import { getBrowser, type SelectableBrowsers } from '../browser'
import { ensureURLStartsWithProtocolScheme } from '../lib/url'
import { getRenderedContent, type RenderRequest } from '../render'

interface CLiRequest extends RenderRequest {
  name: SelectableBrowsers
}

export async function main(request: CLiRequest): Promise<void> {
  await renderToStream(request, process.stdout)
}

async function writeToStream(
  writable: Writable,
  body: string | Buffer,
): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    writable.write(body, 'binary', (error: Error | null | undefined) => {
      if (error) {
        reject(error)
        return
      }
      resolve()
    })
  })
}

export async function renderToStream(
  request: CLiRequest,
  writable: Writable,
): Promise<void> {
  await runWithDefer(async (defer) => {
    const browser = await getBrowser({ name: request.name })
    defer(() => browser.close())

    const url_ = ensureURLStartsWithProtocolScheme(request.url)
    const result = await getRenderedContent(browser, {
      url: url_,
      waitUntil: request.waitUntil,
      evaluates: request.evaluates,
      timeout: request.timeout,
    })
    await writeToStream(writable, result.body)
  })
}
