import { type ChildProcess, spawn } from 'child_process';
import { createHash } from 'crypto';

import { load as cheerioLoad } from 'cheerio';
import { type Browser } from 'playwright';
import sleep from 'sleep-promise';

import { getBrowser } from '../browser';

import { getRenderedContent } from './index';

describe('getRenderedContent', () => {
  let browser: Browser;
  let reactServer: ChildProcess;
  let vueServer: ChildProcess;
  const httpbin_url = process.env.HTTPBIN_URL || 'https://httpbin.org';

  beforeAll(async () => {
    browser = await getBrowser();
    reactServer = spawn('http-server', ['-p', '8001', 'tests/fixtures/react']);
    vueServer = spawn('http-server', ['-p', '8002', 'tests/fixtures/vue']);
    await sleep(1000);
  });
  afterAll(async () => {
    await browser.close();
    reactServer.kill();
    vueServer.kill();
  });

  it('responses rendered React', async () => {
    const result = await getRenderedContent(browser, {
      url: 'http://localhost:8001/',
    });
    const dom = cheerioLoad(result.body.toString('utf8'));
    expect(dom('h1.title').text()).toEqual('Hello, rendering-proxy!');
    expect(dom('.factorial').text()).toEqual('factorial(5) = 120');
    expect(browser.contexts.length).toBe(0);
  });

  it('responses rendered Vue', async () => {
    const result = await getRenderedContent(browser, {
      url: 'http://localhost:8002/',
    });
    const dom = cheerioLoad(result.body.toString('utf8'));
    expect(dom('h1.title').text()).toEqual('Hello, rendering-proxy!');
    expect(dom('.fibonacci').text()).toEqual('fibonacci(10) = 55');
    expect(browser.contexts.length).toBe(0);
  });

  it('can handle empty response', async () => {
    const result = await getRenderedContent(browser, {
      url: `${httpbin_url}/status/204`,
    });
    expect(result.status).toEqual(204);
    expect(result.body.byteLength).toBe(0);
    expect(browser.contexts.length).toBe(0);
  });

  jest.setTimeout(10000);
  test('images', async () => {
    const testCases = [
      {
        url: `${httpbin_url}/image/png`,
        size: 8090,
        hash: '541a1ef5373be3dc49fc542fd9a65177b664aec01c8d8608f99e6ec95577d8c1',
      },
      {
        url: `${httpbin_url}/image/jpeg`,
        size: 35588,
        hash: 'c028d7aa15e851b0eefb31638a1856498a237faf1829050832d3b9b19f9ab75f',
      },
      {
        url: `${httpbin_url}/image/svg`,
        size: 8984,
        hash: '5abf3aba483ef89e6c7b482fc2f304bb211f2efc14e4393a4a9e7cce3d81290f',
      },
      {
        url: `${httpbin_url}/image/webp`,
        size: 10568,
        hash: '567cfaf94ebaf279cea4eb0bc05c4655021fb4ee004aca52c096709d3ba87a63',
      },
    ];
    for (const { url, size, hash } of testCases) {
      const result = await getRenderedContent(browser, { url });
      expect(result.status).toEqual(200);
      expect(result.body.byteLength).toBe(size);
      expect(createHash('sha256').update(result.body).digest('hex')).toEqual(
        hash
      );
    }
  });
});
