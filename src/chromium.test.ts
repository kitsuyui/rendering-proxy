import { getPuppeteer } from './chromium';

describe('Tests chromium integration', () => {
  test('getPuppeteer', async () => {
    const browser = await getPuppeteer();
    try {
      expect(await browser.userAgent()).toContain('HeadlessChrome');
    } finally {
      await browser.close();
    }
  });
});
