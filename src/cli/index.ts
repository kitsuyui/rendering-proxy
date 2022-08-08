import { Writable } from 'stream';

import { SelectableBrowsers, withBrowser } from '../browser';
import { runWith } from '../lib/run_with';
import { ensureURLStartsWithProtocolScheme } from '../lib/url';
import { getRenderedContent, type RenderRequest } from '../render';

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
  await runWith(withBrowser({ name: request.name }), async (browser) => {
    const url_ = ensureURLStartsWithProtocolScheme(request.url);
    const result = await getRenderedContent(browser, {
      url: url_,
      waitUntil: request.waitUntil,
    });
    writable.write(result.body);
  });
}
