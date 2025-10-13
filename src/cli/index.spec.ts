import { execSync } from 'node:child_process'
import { Writable } from 'node:stream'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'

import { main, renderToStream } from './index'

let dockerId: string | null = null
let httpbinUrl = 'http://httpbin'

beforeAll(() => {
  if (!process.env.RUNNING_IN_DOCKER) {
    const proc = execSync('docker run -d -p 8083:80 kennethreitz/httpbin')
    httpbinUrl = 'http://localhost:8083'
    dockerId = proc.toString().trim()
  }
  execSync('sleep 5')
})

afterAll(() => {
  if (dockerId) {
    execSync(`docker kill ${dockerId}`)
    execSync(`docker rm ${dockerId}`)
  }
})

describe('renderToStream', () => {
  it('render', async () => {
    const texts: string[] = []
    const writable = new Writable({
      write(chunk, _encoding, callback) {
        texts.push(chunk.toString())
        callback(null)
      },
      objectMode: true,
    })
    await renderToStream(
      { name: 'chromium', url: `${httpbinUrl}/robots.txt` },
      writable,
    )
    expect(texts).toMatchSnapshot()
  })
})

describe('main', () => {
  let called = false
  const outputs: string[] = []
  type MockType = (code?: number | string | null | undefined) => never
  vi.spyOn(process, 'exit').mockImplementation(((
    code?: number | string | null | undefined,
  ): void => {
    called = true
    process.emit('exit', code ?? 0)
  }) as MockType)

  const spy = vi.spyOn(process.stdout, 'write').mockImplementation(((
    str: string | Uint8Array,
  ) => {
    outputs.push(str.toString())
  }) as (
    str: string | Uint8Array,
    encoding?: BufferEncoding | undefined,
  ) => never)

  it('main', async () => {
    expect(called).toBe(false)
    expect(outputs).toStrictEqual([])
    await main({ url: `${httpbinUrl}/robots.txt`, name: 'chromium' })
    expect(called).toBe(true)
    expect(outputs).toMatchSnapshot()
    spy.mockClear()
  })
})
