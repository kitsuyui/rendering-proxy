import { describe, expect, it } from 'vitest'

import { parseRenderingProxyHeader } from './request_options'

describe('parseRenderingProxyHeader', () => {
  it('returns default when header is absent or empty', async () => {
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
  })

  it('throws for syntactically invalid JSON in a non-empty header', async () => {
    // Callers (e.g. the HTTP server) must catch and return 400 Bad Request
    expect(() => parseRenderingProxyHeader('{')).toThrow(SyntaxError)
    expect(() => parseRenderingProxyHeader('[unclosed')).toThrow(SyntaxError)
    expect(() => parseRenderingProxyHeader('{waitUntil: "load"}')).toThrow(
      SyntaxError,
    )
  })

  it('throws when the header is valid JSON but not a JSON object', async () => {
    expect(() => parseRenderingProxyHeader('1234')).toThrow(TypeError)
    expect(() => parseRenderingProxyHeader('["script"]')).toThrow(TypeError)
  })

  it('throws when field types do not match the protocol schema', async () => {
    expect(() =>
      parseRenderingProxyHeader('{"evaluates": 1234, "waitUntil": 3456}'),
    ).toThrow(TypeError)
    expect(() => parseRenderingProxyHeader('{"timeout": "fast"}')).toThrow(
      TypeError,
    )
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
  })

  it('keeps all evaluate entries without truncation', async () => {
    const scripts = Array.from({ length: 20 }, (_, i) => `script${i}`)
    const result = parseRenderingProxyHeader(
      JSON.stringify({ evaluates: scripts }),
    )
    expect(result.evaluates).toHaveLength(20)
    expect(result.evaluates).toStrictEqual(scripts)
  })
})
