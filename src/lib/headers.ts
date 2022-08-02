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
];

const contentDependentHeaders = ['content-encoding', 'content-length'];

type Headers = {
  [key: string]: string;
};

export function excludeHopByHopHeaders(headers: Headers): Headers {
  const result: Headers = {};
  for (const key in headers) {
    if (hopByHopHeaders.includes(key)) {
      continue;
    }
    result[key] = headers[key];
  }
  return result;
}

export function excludeContentDependentHeaders(headers: Headers): Headers {
  const result: Headers = {};
  for (const key in headers) {
    if (contentDependentHeaders.includes(key)) {
      continue;
    }
    result[key] = headers[key];
  }
  return result;
}

export function excludeUnusedHeaders(headers: Headers): Headers {
  return {
    ...excludeContentDependentHeaders({
      ...excludeHopByHopHeaders(headers),
    }),
  };
}
