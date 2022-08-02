export function isAbsoluteURL(url: string): boolean {
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return true;
  }
  return false;
}
