import { type ChildProcess, spawn } from 'child_process';

import { load as cheerioLoad } from 'cheerio';
import { type Browser } from 'playwright';
import sleep from 'sleep-promise';

import { getBrowser } from '../browser';

import { getRenderedContent } from './index';

describe('getRenderedContent', () => {
  let browser: Browser;
  let reactServer: ChildProcess;
  let vueServer: ChildProcess;

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

  it('responses Image', async () => {
    const result = await getRenderedContent(browser, {
      url: 'https://i.picsum.photos/id/188/200/200.jpg?hmac=TipFoTVq-8WOmIswCmTNEcphuYngcdkCBi4YR7Hv6Cw',
    });
    expect(result.status).toEqual(200);
    expect(result.body.byteLength).toBe(9891);
    expect(browser.contexts.length).toBe(0);
  });

  it('can handle empty response', async () => {
    const result = await getRenderedContent(browser, {
      url: 'https://httpbin.org/status/204',
    });
    expect(result.status).toEqual(204);
    expect(result.body.byteLength).toBe(0);
    expect(browser.contexts.length).toBe(0);
  });
});