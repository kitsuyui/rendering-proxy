import { describe, expect, it } from 'vitest'

import {
  appendVaryHeader,
  excludeCacheValidationHeaders,
  excludeContentDependentHeaders,
  excludeHopByHopHeaders,
  excludeOriginSecurityContextHeaders,
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

describe('excludeCacheValidationHeaders', () => {
  it('removes etag, last-modified, vary, and cache-control', () => {
    expect(excludeCacheValidationHeaders({})).toStrictEqual({})
    expect(
      excludeCacheValidationHeaders({
        etag: '"abc123"',
        'last-modified': 'Wed, 01 Jan 2025 00:00:00 GMT',
        vary: 'Accept-Encoding',
        'cache-control': 'max-age=3600',
        'content-type': 'text/html; charset=utf-8',
      }),
    ).toStrictEqual({
      'content-type': 'text/html; charset=utf-8',
    })
  })

  it('preserves non-cache headers', () => {
    expect(
      excludeCacheValidationHeaders({
        'content-type': 'text/html',
        'x-custom': 'value',
      }),
    ).toStrictEqual({
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
