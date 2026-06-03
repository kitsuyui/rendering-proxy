import { describe, expect, it } from 'vitest'

import {
  appendVaryHeader,
  excludeContentDependentHeaders,
  excludeHopByHopHeaders,
  excludeUnusedHeaders,
} from './headers'

describe('appendVaryHeader', () => {
  it('adds Vary when no Vary header exists', () => {
    expect(appendVaryHeader({}, 'x-rendering-proxy')).toStrictEqual({
      vary: 'x-rendering-proxy',
    })
  })

  it('appends to an existing Vary header', () => {
    expect(
      appendVaryHeader(
        {
          vary: 'accept-encoding',
        },
        'x-rendering-proxy',
      ),
    ).toStrictEqual({
      vary: 'accept-encoding, x-rendering-proxy',
    })
  })

  it('does not duplicate existing Vary values case-insensitively', () => {
    expect(
      appendVaryHeader(
        {
          Vary: 'Accept-Encoding, X-Rendering-Proxy',
        },
        'x-rendering-proxy',
      ),
    ).toStrictEqual({
      Vary: 'Accept-Encoding, X-Rendering-Proxy',
    })
  })

  it('leaves wildcard Vary unchanged', () => {
    expect(appendVaryHeader({ vary: '*' }, 'x-rendering-proxy')).toStrictEqual({
      vary: '*',
    })
  })
})

describe('excludeHopByHopHeaders', () => {
  it('returns headers excluded hop-by-hop header', () => {
    expect(excludeHopByHopHeaders({})).toStrictEqual({})
    expect(
      excludeHopByHopHeaders({
        connection: 'Keep-Alive',
        etag: '"3147526947"',
      }),
    ).toStrictEqual({
      etag: '"3147526947"',
    })
  })
})

describe('excludeContentDependentHeaders', () => {
  it('returns headers excluded content-dependent header', () => {
    expect(excludeContentDependentHeaders({})).toStrictEqual({})
    expect(
      excludeContentDependentHeaders({
        'content-encoding': 'gzip',
        etag: '"3147526947"',
      }),
    ).toStrictEqual({
      etag: '"3147526947"',
    })
  })
})

describe('excludeUnusedHeaders', () => {
  it('returns headers excluded that unused by rendering-proxy', () => {
    expect(excludeUnusedHeaders({})).toStrictEqual({})
    expect(
      excludeUnusedHeaders({
        connection: 'Keep-Alive',
        'content-encoding': 'gzip',
        etag: '"3147526947"',
      }),
    ).toStrictEqual({
      etag: '"3147526947"',
    })
  })
})
