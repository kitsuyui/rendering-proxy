import { isContentTypeHTML, getRenderedContent } from './utils';
import { getPuppeteer } from './chromium';
import type { Browser } from 'puppeteer';
import { spawn, type ChildProcess } from 'child_process';
import cheerio from 'cheerio';
import sleep from 'sleep-promise';

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

  test('test console', async () => {
    const result = await getRenderedContent(browser, 'https://example.com/', {
      waitUntil: 'domcontentloaded',
      evaluate:
        'console.log("Hello, Console!"); console.error("Error, Console!");',
    });
    expect(result?.consoleLogs).toStrictEqual([
      {
        location: {
          columnNumber: 8,
          lineNumber: 0,
          url: 'pptr://__puppeteer_evaluation_script__',
        },
        text: 'Hello, Console!',
        type: 'log',
      },
      {
        location: {
          columnNumber: 40,
          lineNumber: 0,
          url: 'pptr://__puppeteer_evaluation_script__',
        },
        text: 'Error, Console!',
        type: 'error',
      },
    ]);
    expect(result?.errors).toStrictEqual([]);
  });

  test('test errors', async () => {
    const result = await getRenderedContent(browser, 'https://example.com/', {
      waitUntil: 'domcontentloaded',
      evaluate: 'throw new Error("Error!")',
    });
    expect(result?.errors).toStrictEqual([
      'Error: Evaluation failed: Error: Error!\n    at pptr://__puppeteer_evaluation_script__:1:7',
    ]);
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

describe('test virtual dom', () => {
  let browser: Browser;
  let reactServer: ChildProcess;
  let vueServer: ChildProcess;

  beforeAll(async () => {
    browser = await getPuppeteer();
    reactServer = spawn('http-server', ['-p', '8001', 'tests/fixtures/react']);
    vueServer = spawn('http-server', ['-p', '8002', 'tests/fixtures/vue']);
    await sleep(1000);
  });
  afterAll(async () => {
    await browser.close();
    reactServer.kill();
    vueServer.kill();
  });

  test('React', async () => {
    const result = await getRenderedContent(browser, 'http://localhost:8001/', {
      waitUntil: 'domcontentloaded',
    });
    const dom = cheerio.load(result?.body.toString());
    expect(dom('h1.title').text()).toEqual('Hello, rendering-proxy!');
    expect(dom('.factorial').text()).toEqual('factorial(5) = 120');
  });

  test('Vue', async () => {
    const result = await getRenderedContent(browser, 'http://localhost:8002/', {
      waitUntil: 'domcontentloaded',
    });
    const dom = cheerio.load(result?.body.toString());
    expect(dom('h1.title').text()).toEqual('Hello, rendering-proxy!');
    expect(dom('.fibonacci').text()).toEqual('fibonacci(10) = 55');
  });
});
