import { describe, expect, it } from 'vitest'

import {
  excludeContentDependentHeaders,
  excludeHopByHopHeaders,
  excludeUnusedHeaders,
} from './headers'

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
