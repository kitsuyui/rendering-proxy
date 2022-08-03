import { getRenderedContent, type RenderRequest } from '../render';
import { withBrowser, SelectableBrowsers } from '../browser';
import { ensureURLStartsWithProtocolScheme } from '../lib/url';
import { Writable } from 'stream';

interface CLiRequest extends RenderRequest {
  name: SelectableBrowsers;
}

export async function main(request: CLiRequest): Promise<void> {
  process.stdout.setEncoding('binary');
  await renderToStream(request, process.stdout);
  process.exit();
}

export async function renderToStream(
  request: CLiRequest,
  writable: Writable
): Promise<void> {
  for await (const browser of withBrowser({ name: request.name })) {
    const url_ = ensureURLStartsWithProtocolScheme(request.url);
    const result = await getRenderedContent(browser, {
      url: url_,
      waitUntil: request.waitUntil,
    });
    writable.write(result.body);
  }
}
