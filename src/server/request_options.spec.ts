import { describe, expect, it } from 'vitest'

import { parseRenderingProxyHeader } from './request_options'

describe('parseRenderingProxyHeader', () => {
  it('returns default when header is absent, empty, or contains valid JSON with wrong types', async () => {
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
    // Valid JSON but not an object — unknown fields normalize to defaults
    expect(parseRenderingProxyHeader('1234')).toStrictEqual({
      waitUntil: 'load',
      evaluates: [],
    })
    // Valid JSON with wrong field types — normalize to defaults
    expect(
      parseRenderingProxyHeader('{"evaluates": 1234, "waitUntil": 3456}'),
    ).toStrictEqual({
      waitUntil: 'load',
      evaluates: [],
    })
  })

  it('throws SyntaxError for syntactically invalid JSON in a non-empty header', async () => {
    // Callers (e.g. the HTTP server) must catch and return 400 Bad Request
    expect(() => parseRenderingProxyHeader('{')).toThrow(SyntaxError)
    expect(() => parseRenderingProxyHeader('[unclosed')).toThrow(SyntaxError)
    expect(() => parseRenderingProxyHeader('{waitUntil: "load"}')).toThrow(
      SyntaxError,
    )
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
