import type { Browser } from 'playwright'
import { describe, expect, it } from 'vitest'
import { runWithDefer } from 'with-defer'

import {
  getBrowser,
  getBrowserOptionsByName,
  getBrowserTypeByName,
  selectableBrowsers,
} from './index'

describe('getBrowserByName()', () => {
  it('returns the browserType with the given name', () => {
    expect(getBrowserTypeByName('chromium').name()).toBe('chromium')
    expect(getBrowserTypeByName('firefox').name()).toBe('firefox')
    expect(getBrowserTypeByName('webkit').name()).toBe('webkit')
    expect(() => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      getBrowserTypeByName('foobar')
    }).toThrow()
  })
})

describe('getBrowser()', () => {
  it('returns chromium when without parameters', async () => {
    const browser = await getBrowser()
    expect(browser.browserType().name()).toBe('chromium')
    await browser.close()
  })

  it('returns the browser with the given name', async () => {
    // Test all parameters
    for (const name of selectableBrowsers) {
      const browser = await getBrowser({ name })
      expect(browser.browserType().name()).toBe(name)
      await browser.close()
    }
  })
})

describe('withBrowser()', () => {
  it('dispose of connections correctly', async () => {
    const box: Browser[] = []
    await runWithDefer(async (defer) => {
      const browser = await getBrowser()
      box.push(browser)
      defer(() => browser.close())
    })
    expect(box[0].isConnected()).toBe(false)
  })
})

describe('getBrowserOptionsByName', () => {
  it('returns options array for known browsers', () => {
    expect(Array.isArray(getBrowserOptionsByName('chromium'))).toBe(true)
    expect(Array.isArray(getBrowserOptionsByName('firefox'))).toBe(true)
    expect(Array.isArray(getBrowserOptionsByName('webkit'))).toBe(true)
  })

  it('returns empty array for unknown browsers', () => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    expect(Array.isArray(getBrowserOptionsByName(''))).toBe(true)
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    expect(Array.isArray(getBrowserOptionsByName('foobar'))).toBe(true)
  })
})
