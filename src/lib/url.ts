import { parse as urlParse } from 'node:url'

export function isAbsoluteURL(url: string): boolean {
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return true
  }
  return false
}

export function ensureURLStartsWithProtocolScheme(
  url: string,
  scheme = 'https://',
): string {
  const protocol = urlParse(url).protocol
  if (protocol) {
    if (!isAbsoluteURL(url)) {
      throw new Error(`Unsupported URL scheme: ${protocol}`)
    }
    return url
  }
  return scheme + url
}
