import { getRenderedContent, type RenderRequest } from '../render';
import { withBrowser } from '../browser';
import { ensureURLStartsWithProtocolScheme } from '../lib/url';
import { Writable } from 'stream';

export async function main(request: RenderRequest): Promise<void> {
  process.stdout.setEncoding('binary');
  await renderToStream(request, process.stdout);
  process.exit();
}

export async function renderToStream(
  request: RenderRequest,
  writable: Writable
): Promise<void> {
  for await (const browser of withBrowser()) {
    const url_ = ensureURLStartsWithProtocolScheme(request.url);
    const result = await getRenderedContent(browser, {
      url: url_,
      waitUntil: request.waitUntil,
    });
    writable.write(result.body);
  }
}
