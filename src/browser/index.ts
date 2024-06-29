import {
  type Browser,
  type BrowserType,
  chromium,
  firefox,
  webkit,
} from 'playwright'
import sleep from 'sleep-promise'

export const selectableBrowsers = ['chromium', 'firefox', 'webkit'] as const
export type SelectableBrowsers = (typeof selectableBrowsers)[number]

const chromiumOptions = [
  '--disable-accelerated-2d-canvas',
  '--disable-accelerated-video-decode',
  '--disable-background-networking',
  '--disable-client-side-phishing-detection',
  '--disable-breakpad',
  '--disable-default-apps',
  '--disable-extensions',
  '--disable-gpu',
  '--disable-sync',
  '--disable-translate',
  '--disable-software-rasterizer',
  '--font-cache-shared-handle',
  '--incognito',
  '--metrics-recording-only',
  '--mute-audio',
  '--no-default-browser-check',
  '--no-first-run',
  '--no-sandbox',
  '--safebrowsing-disable-auto-update',
]

const firefoxOptions = ['-wait-for-browser']

const webkitOptions: string[] = []

export function getBrowserTypeByName(name: SelectableBrowsers): BrowserType {
  switch (name) {
    case 'chromium':
      return chromium
    case 'firefox':
      return firefox
    case 'webkit':
      return webkit
    default:
      throw new Error(`Unknown browser type: ${name}`)
  }
}

export function getBrowserOptionsByName(name: SelectableBrowsers): string[] {
  switch (name) {
    case 'chromium':
      return chromiumOptions
    case 'firefox':
      return firefoxOptions
    case 'webkit':
      return webkitOptions
    default:
      return []
  }
}

export async function getBrowser({
  name = 'chromium',
  headless = true,
}: {
  name?: SelectableBrowsers
  headless?: boolean
} = {}): Promise<Browser> {
  const browserType = getBrowserTypeByName(name)
  const browser = await browserType.launch({
    headless,
    args: getBrowserOptionsByName(name),
  })
  // Wait for the browser to be ready.
  while (!browser.isConnected()) {
    await sleep(100)
  }
  return browser
}
