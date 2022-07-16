import { isContentTypeHTML, getRenderedContent } from './utils';
import { getPuppeteer } from './chromium';
import type { Browser } from 'puppeteer';

describe('isContentTypeHTML', () => {
  test('HTML content types', () => {
    expect(isContentTypeHTML('text/html')).toBe(true);
    expect(isContentTypeHTML('text/html; charset=UTF-8')).toBe(true);
    expect(isContentTypeHTML('application/xhtml+xml')).toBe(true);
    expect(isContentTypeHTML('application/xhtml+xml; UTF-8')).toBe(true);
  });

  test('Other content types', () => {
    expect(isContentTypeHTML('text/plain')).toBe(false);
    expect(isContentTypeHTML('text/plain; charset=UTF-8')).toBe(false);
    expect(isContentTypeHTML('text/javascript')).toBe(false);
    expect(isContentTypeHTML('application/json')).toBe(false);
    expect(isContentTypeHTML('audio/midi')).toBe(false);
  });
});

describe('getRenderedContent', () => {
  let browser: Browser;
  beforeAll(async () => {
    browser = await getPuppeteer();
  });
  afterAll(async () => {
    await browser.close();
  });

  test('get title', async () => {
    const result = await getRenderedContent(browser, 'https://example.com/', {
      waitUntil: 'domcontentloaded',
    });
    expect(result?.body.toString()).toContain('<title>Example Domain</title>');
  });

  test('get json', async () => {
    const result = await getRenderedContent(
      browser,
      'https://httpbin.org/json',
      {
        waitUntil: 'domcontentloaded',
      }
    );
    expect(JSON.parse(result?.body.toString() || '')).toEqual(
      JSON.parse(`{
      "slideshow": {
        "author": "Yours Truly",
        "date": "date of publication",
        "slides": [
          {
            "title": "Wake up to WonderWidgets!",
            "type": "all"
          },
          {
            "items": [
              "Why <em>WonderWidgets</em> are great",
              "Who <em>buys</em> WonderWidgets"
            ],
            "title": "Overview",
            "type": "all"
          }
        ],
        "title": "Sample Slide Show"
      }
    }`)
    );
  });
});
