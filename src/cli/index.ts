import { getRenderedContent } from '../render';
import { withBrowser } from '../browser';
import { ensureURLStartsWithProtocolScheme } from '../lib/url';
import { Writable } from 'stream';

export async function main(url: string): Promise<void> {
  process.stdout.setEncoding('binary');
  await renderToStream(url, process.stdout);
  process.exit();
}

export async function renderToStream(
  url: string,
  writable: Writable
): Promise<void> {
  for await (const browser of withBrowser()) {
    const url_ = ensureURLStartsWithProtocolScheme(url);
    const result = await getRenderedContent(browser, {
      url: url_,
    });
    writable.write(result.body);
  }
}
