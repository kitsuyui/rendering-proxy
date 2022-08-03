import { getBrowserTypeByName, getBrowser, selectableBrowsers } from './index';

describe('browser', () => {
  test('getBrowserByName', () => {
    expect(getBrowserTypeByName('chromium').name()).toBe('chromium');
    expect(getBrowserTypeByName('firefox').name()).toBe('firefox');
    expect(getBrowserTypeByName('webkit').name()).toBe('webkit');
    expect(() => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      getBrowserTypeByName('foobar');
    }).toThrow();
  });

  test('getBrowser() without parameter', async () => {
    const browser = await getBrowser();
    expect(browser.browserType().name()).toBe('chromium');
    await browser.close();
  });

  test('getBrowser with parameters', async () => {
    // Test all parameters
    for (const name of selectableBrowsers) {
      for (const headless of [true, false]) {
        const browser = await getBrowser({ name, headless });
        expect(browser.browserType().name()).toBe(name);
        await browser.close();
      }
    }
  });
});
