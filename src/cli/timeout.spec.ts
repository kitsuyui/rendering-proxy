import { Writable } from 'node:stream'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const { close, getBrowser, getRenderedContent } = vi.hoisted(() => {
  const close = vi.fn(async () => {})
  const getBrowser = vi.fn(async () => ({ close }))
  const getRenderedContent = vi.fn(async () => ({
    status: 200,
    headers: {},
    body: Buffer.from('rendered body'),
    evaluateResults: [],
  }))
  return { close, getBrowser, getRenderedContent }
})

vi.mock('../browser', () => ({
  getBrowser,
}))

vi.mock('../render', () => ({
  getRenderedContent,
}))

import { renderToStream } from './index'

describe('renderToStream timeout propagation', () => {
  beforeEach(() => {
    close.mockClear()
    getBrowser.mockClear()
    getRenderedContent.mockClear()
  })

  it('passes timeout to the renderer request', async () => {
    const chunks: string[] = []
    const writable = new Writable({
      write(chunk, _encoding, callback) {
        chunks.push(chunk.toString())
        callback(null)
      },
    })

    await renderToStream(
      {
        name: 'chromium',
        url: 'example.com',
        waitUntil: 'networkidle',
        evaluates: ['document.title'],
        timeout: 1234,
      },
      writable,
    )

    expect(getBrowser).toHaveBeenCalledWith({ name: 'chromium' })
    expect(getRenderedContent).toHaveBeenCalledWith(
      { close },
      {
        url: 'https://example.com',
        waitUntil: 'networkidle',
        evaluates: ['document.title'],
        timeout: 1234,
      },
    )
    expect(chunks).toStrictEqual(['rendered body'])
    expect(close).toHaveBeenCalledTimes(1)
  })
})
