import { describe, expect, it } from 'vitest'

import { parseRenderingProxyHeader } from './request_options'

describe('parseRenderingProxyHeader', () => {
  it('returns default when empty or invalid header value', async () => {
    expect(parseRenderingProxyHeader(undefined)).toStrictEqual({
      waitUntil: 'load',
      evaluates: [],
    })
    expect(parseRenderingProxyHeader('')).toStrictEqual({
      waitUntil: 'load',
      evaluates: [],
    })
    expect(parseRenderingProxyHeader([])).toStrictEqual({
      waitUntil: 'load',
      evaluates: [],
    })
    expect(parseRenderingProxyHeader('1234')).toStrictEqual({
      waitUntil: 'load',
      evaluates: [],
    })
    expect(parseRenderingProxyHeader('{')).toStrictEqual({
      waitUntil: 'load',
      evaluates: [],
    })
    expect(
      parseRenderingProxyHeader('{"evaluates": 1234, "waitUntil": 3456}'),
    ).toStrictEqual({
      waitUntil: 'load',
      evaluates: [],
    })
  })

  it('parses evaluates', async () => {
    expect(parseRenderingProxyHeader('{"evaluates": []}')).toStrictEqual({
      waitUntil: 'load',
      evaluates: [],
    })
    expect(parseRenderingProxyHeader('{"evaluates": ["1 + 1"]}')).toStrictEqual(
      {
        waitUntil: 'load',
        evaluates: ['1 + 1'],
      },
    )
    expect(
      parseRenderingProxyHeader('{"evaluates": ["1 + 1", "document.title"]}'),
    ).toStrictEqual({
      waitUntil: 'load',
      evaluates: ['1 + 1', 'document.title'],
    })
  })

  it('parses waitUntil', async () => {
    expect(
      parseRenderingProxyHeader('{"waitUntil": "networkidle"}'),
    ).toStrictEqual({
      waitUntil: 'networkidle',
      evaluates: [],
    })
    expect(
      parseRenderingProxyHeader('{"waitUntil": "domcontentloaded"}'),
    ).toStrictEqual({
      waitUntil: 'domcontentloaded',
      evaluates: [],
    })
    expect(parseRenderingProxyHeader('{"waitUntil": "load"}')).toStrictEqual({
      waitUntil: 'load',
      evaluates: [],
    })
    expect(parseRenderingProxyHeader('{"waitUntil": "commit"}')).toStrictEqual({
      waitUntil: 'commit',
      evaluates: [],
    })
  })
})
