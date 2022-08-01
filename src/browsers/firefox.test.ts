import { getPuppeteer } from './firefox';

describe('Tests firefox integration', () => {
  // Dummy
  test('1 + 1 == 2', async () => {
    expect(1 + 1).toBe(2);
  });

  // This test works only in PUPPETEER_PRODUCT='firefox' yarn install
  if (process.env.PUPPETEER_PRODUCT !== 'firefox') {
    return;
  }

  test('getPuppeteer', async () => {
    const browser = await getPuppeteer();
    try {
      expect(await browser.userAgent()).toContain('Firefox');
    } finally {
      await browser.close();
    }
  });
});
