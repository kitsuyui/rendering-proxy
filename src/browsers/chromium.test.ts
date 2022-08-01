import { getPuppeteer } from './chromium';

describe('Tests chromium integration', () => {
  // Dummy
  test('1 + 1 == 2', async () => {
    expect(1 + 1).toBe(2);
  });

  // This test works only in PUPPETEER_PRODUCT='chrome' yarn install
  if (process.env.PUPPETEER_PRODUCT !== 'chrome') {
    return;
  }

  test('getPuppeteer', async () => {
    const browser = await getPuppeteer();
    try {
      expect(await browser.userAgent()).toContain('HeadlessChrome');
    } finally {
      await browser.close();
    }
  });
});
