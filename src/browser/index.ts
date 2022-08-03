import {
  chromium,
  firefox,
  webkit,
  type Browser,
  type BrowserType,
} from 'playwright';

export const selectableBrowsers = ['chromium', 'firefox', 'webkit'] as const;
export type SelectableBrowsers = typeof selectableBrowsers[number];

export function getBrowserTypeByName(name: SelectableBrowsers): BrowserType {
  switch (name) {
    case 'chromium':
      return chromium;
    case 'firefox':
      return firefox;
    case 'webkit':
      return webkit;
    default:
      throw new Error(`Unknown browser type: ${name}`);
  }
}

export async function getBrowser({
  name = 'chromium',
  headless = true,
}: {
  name?: SelectableBrowsers;
  headless?: boolean;
} = {}): Promise<Browser> {
  const browserType = getBrowserTypeByName(name);
  const browser = await browserType.launch({ headless });
  return browser;
}

export async function* withBrowser({
  name = 'chromium',
  headless = true,
}: {
  name?: SelectableBrowsers;
  headless?: boolean;
} = {}): AsyncIterable<Browser> {
  const browser = await getBrowser({ name, headless });
  try {
    yield browser;
  } finally {
    await browser.close();
  }
}
