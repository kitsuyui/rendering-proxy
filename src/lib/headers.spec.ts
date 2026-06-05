import { describe, expect, it } from 'vitest'

import {
  excludeContentDependentHeaders,
  excludeHopByHopHeaders,
  excludeOriginSecurityContextHeaders,
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

describe('excludeOriginSecurityContextHeaders', () => {
  it('strips origin-bound security headers', () => {
    expect(excludeOriginSecurityContextHeaders({})).toStrictEqual({})
    expect(
      excludeOriginSecurityContextHeaders({
        'set-cookie': 'session=abc; Path=/',
        'strict-transport-security': 'max-age=31536000',
        'content-security-policy': "default-src 'self'",
        'content-security-policy-report-only': "default-src 'self'",
        'access-control-allow-origin': '*',
        'access-control-allow-credentials': 'true',
        'access-control-allow-methods': 'GET, POST',
        'access-control-allow-headers': 'Content-Type',
        'access-control-expose-headers': 'X-Custom',
        'access-control-max-age': '600',
        'clear-site-data': '"cache","cookies"',
        etag: '"3147526947"',
      }),
    ).toStrictEqual({
      etag: '"3147526947"',
    })
  })

  it('passes through unrelated headers', () => {
    expect(
      excludeOriginSecurityContextHeaders({
        etag: '"abc"',
        'content-type': 'text/html',
        'x-custom': 'value',
      }),
    ).toStrictEqual({
      etag: '"abc"',
      'content-type': 'text/html',
      'x-custom': 'value',
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
        'set-cookie': 'session=abc',
        etag: '"3147526947"',
      }),
    ).toStrictEqual({
      etag: '"3147526947"',
    })
  })
})
