import { describe, expect, it } from 'vitest'

import { parseRenderingProxyHeader } from './request_options'

describe('parseRenderingProxyHeader', () => {
  it('returns default when empty or invalid header value', async () => {
    expect(parseRenderingProxyHeader(undefined)).toStrictEqual({
      waitUntil: 'load',
      evaluates: [],
      timeout: undefined,
    })
    expect(parseRenderingProxyHeader('')).toStrictEqual({
      waitUntil: 'load',
      evaluates: [],
      timeout: undefined,
    })
    expect(parseRenderingProxyHeader([])).toStrictEqual({
      waitUntil: 'load',
      evaluates: [],
      timeout: undefined,
    })
    expect(parseRenderingProxyHeader('1234')).toStrictEqual({
      waitUntil: 'load',
      evaluates: [],
      timeout: undefined,
    })
    expect(parseRenderingProxyHeader('{')).toStrictEqual({
      waitUntil: 'load',
      evaluates: [],
      timeout: undefined,
    })
    expect(
      parseRenderingProxyHeader('{"evaluates": 1234, "waitUntil": 3456}'),
    ).toStrictEqual({
      waitUntil: 'load',
      evaluates: [],
      timeout: undefined,
    })
  })

  it('parses evaluates', async () => {
    expect(parseRenderingProxyHeader('{"evaluates": []}')).toStrictEqual({
      waitUntil: 'load',
      evaluates: [],
      timeout: undefined,
    })
    expect(parseRenderingProxyHeader('{"evaluates": ["1 + 1"]}')).toStrictEqual(
      {
        waitUntil: 'load',
        evaluates: ['1 + 1'],
        timeout: undefined,
      },
    )
    expect(
      parseRenderingProxyHeader('{"evaluates": ["1 + 1", "document.title"]}'),
    ).toStrictEqual({
      waitUntil: 'load',
      evaluates: ['1 + 1', 'document.title'],
      timeout: undefined,
    })
  })

  it('parses waitUntil', async () => {
    expect(
      parseRenderingProxyHeader('{"waitUntil": "networkidle"}'),
    ).toStrictEqual({
      waitUntil: 'networkidle',
      evaluates: [],
      timeout: undefined,
    })
    expect(
      parseRenderingProxyHeader('{"waitUntil": "domcontentloaded"}'),
    ).toStrictEqual({
      waitUntil: 'domcontentloaded',
      evaluates: [],
      timeout: undefined,
    })
    expect(parseRenderingProxyHeader('{"waitUntil": "load"}')).toStrictEqual({
      waitUntil: 'load',
      evaluates: [],
      timeout: undefined,
    })
    expect(parseRenderingProxyHeader('{"waitUntil": "commit"}')).toStrictEqual({
      waitUntil: 'commit',
      evaluates: [],
      timeout: undefined,
    })
  })

  it('parses timeout', async () => {
    expect(parseRenderingProxyHeader('{"timeout": 5000}')).toStrictEqual({
      waitUntil: 'load',
      evaluates: [],
      timeout: 5000,
    })
    expect(parseRenderingProxyHeader('{"timeout": 0}')).toStrictEqual({
      waitUntil: 'load',
      evaluates: [],
      timeout: undefined,
    })
    expect(parseRenderingProxyHeader('{"timeout": -1}')).toStrictEqual({
      waitUntil: 'load',
      evaluates: [],
      timeout: undefined,
    })
    expect(parseRenderingProxyHeader('{"timeout": "fast"}')).toStrictEqual({
      waitUntil: 'load',
      evaluates: [],
      timeout: undefined,
    })
  })

  it('truncates evaluates to at most 10 entries', async () => {
    const scripts = Array.from({ length: 20 }, (_, i) => `script${i}`)
    const result = parseRenderingProxyHeader(
      JSON.stringify({ evaluates: scripts }),
    )
    expect(result.evaluates).toHaveLength(10)
    expect(result.evaluates).toStrictEqual(scripts.slice(0, 10))
  })
})
