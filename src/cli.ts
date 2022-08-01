import { parse as urlParse } from 'url';
import { getRenderedContent } from './utils';
import { getPuppeteer } from './browsers';
import type { WaitUntil } from './utils';

export async function cliMain(
  url: string,
  waitUntil: WaitUntil,
  evaluate?: string
): Promise<void> {
  process.on('unhandledRejection', (err) => {
    console.error(err);
    process.exit(1);
  });
  const browser = await getPuppeteer();
  const filledUrl = fillURLProtocolScheme(url);
  const result = await getRenderedContent(browser, filledUrl, {
    evaluate,
    waitUntil,
  });
  process.stdout.setEncoding('binary');
  process.stdout.write(result.body);
  browser.close();
  process.exit();
}

export function fillURLProtocolScheme(url: string, scheme = 'http://'): string {
  if (urlParse(url).protocol) {
    return url;
  }
  return scheme + url;
}
