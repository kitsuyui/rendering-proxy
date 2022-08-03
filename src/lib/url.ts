import { parse as urlParse } from 'url';

export function isAbsoluteURL(url: string): boolean {
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return true;
  }
  return false;
}

export function ensureURLStartsWithProtocolScheme(
  url: string,
  scheme = 'https://'
): string {
  if (urlParse(url).protocol) {
    return url;
  }
  return scheme + url;
}
