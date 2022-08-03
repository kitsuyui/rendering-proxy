import { getRenderedContent } from '../render';
import { getBrowser } from '../browser';
import { ensureURLStartsWithProtocolScheme } from '../lib/url';
import { Writable } from 'stream';

export async function main(url: string): Promise<void> {
  process.on('unhandledRejection', (err) => {
    console.error(err);
    process.exit(1);
  });
  process.stdout.setEncoding('binary');
  await renderToStream(url, process.stdout);
  process.exit();
}

export async function renderToStream(
  url: string,
  writable: Writable
): Promise<void> {
  const browser = await getBrowser();
  const url_ = ensureURLStartsWithProtocolScheme(url);
  const result = await getRenderedContent(browser, {
    url: url_,
  });
  writable.write(result.body);
  browser.close();
}
