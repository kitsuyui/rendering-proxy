import { Writable } from 'stream';

import { getBrowser, SelectableBrowsers } from '../browser';
import { ensureURLStartsWithProtocolScheme } from '../lib/url';
import { withDispose } from '../lib/with_dispose';
import { getRenderedContent, type RenderRequest } from '../render';

interface CLiRequest extends RenderRequest {
  name: SelectableBrowsers;
}

export async function main(request: CLiRequest): Promise<void> {
  await renderToStream(request, process.stdout);
  process.exit();
}

export async function renderToStream(
  request: CLiRequest,
  writable: Writable
): Promise<void> {
  await withDispose(async (dispose) => {
    const browser = await getBrowser({ name: request.name });
    dispose(async () => await browser.close());

    const url_ = ensureURLStartsWithProtocolScheme(request.url);
    const result = await getRenderedContent(browser, {
      url: url_,
      waitUntil: request.waitUntil,
    });
    writable.write(result.body, 'binary');
  });
}
