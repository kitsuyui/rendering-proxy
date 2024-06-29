const hopByHopHeaders = [
  // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers
  'connection',
  'keep-alive',
  'proxy-authenticate',
  'proxy-authorization',
  'te',
  'trailer',
  'transfer-encoding',
  'upgrade',
]

const contentDependentHeaders = ['content-encoding', 'content-length']

type Headers = {
  [key: string]: string
}

/**
 * Note: Hop-by-hop headers are meaningful only for a single transport-level connection, and are not stored by caches or forwarded by proxies.
 * See also: https://developer.mozilla.org/en-US/docs/Web/HTTP/Compression#hop-by-hop_compression
 * So, we should exclude them from the response headers before passing them to the client.
 * And we should exclude content-dependent headers as well.
 */

/**
 * Exclude hop-by-hop headers from the response headers.
 * @param headers {Headers}
 * @returns headers {Headers}
 */
export function excludeHopByHopHeaders(headers: Headers): Headers {
  const result: Headers = {}
  for (const key in headers) {
    if (hopByHopHeaders.includes(key)) {
      continue
    }
    result[key] = headers[key]
  }
  return result
}

/**
 * Exclude content-dependent headers from the response headers.
 * @param headers {Headers}
 * @returns headers {Headers}
 */
export function excludeContentDependentHeaders(headers: Headers): Headers {
  const result: Headers = {}
  for (const key in headers) {
    if (contentDependentHeaders.includes(key)) {
      continue
    }
    result[key] = headers[key]
  }
  return result
}

/**
 * Exclude unused headers from the response headers. (Hop-by-hop headers and content-dependent headers)
 * @param headers {Headers}
 * @returns headers {Headers}
 */
export function excludeUnusedHeaders(headers: Headers): Headers {
  return {
    ...excludeContentDependentHeaders({
      ...excludeHopByHopHeaders(headers),
    }),
  }
}
