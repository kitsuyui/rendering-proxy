import { type ChildProcess, execSync, spawn } from 'child_process';
import { createHash } from 'crypto';

import { load as cheerioLoad } from 'cheerio';
import { type Browser } from 'playwright';
import sleep from 'sleep-promise';

import { getBrowser } from '../browser';

import { getRenderedContent, RenderResult } from './index';

interface ToBe {
  status: number;
  size: number;
  hash: string;
}

function toBeResult(result: RenderResult, tobe: ToBe) {
  const status = result.status;
  const size = result.body.byteLength;
  const hash = createHash('sha256').update(result.body).digest('hex');
  const pass =
    status === tobe.status && size === tobe.size && hash === tobe.hash;
  if (pass) {
    return {
      message: () => `expected result not to be ${tobe}`,
      pass: true,
    };
  }
  return {
    message: () => `expected result to be ${tobe}`,
    pass: false,
  };
}

export interface CustomMatchers<R = unknown> {
  toBeResult(tobe: ToBe): R;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace jest {
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface Expect extends CustomMatchers {}
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface Matchers<R> extends CustomMatchers<R> {}
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface InverseAsymmetricMatchers extends CustomMatchers {}
  }
}

expect.extend({ toBeResult });

let dockerId: string | null = null;
let httpbinUrl = 'http://httpbin';
beforeAll(() => {
  if (!process.env.RUNNING_IN_DOCKER) {
    const proc = execSync('docker run -d -p 8081:80 kennethreitz/httpbin');
    httpbinUrl = 'http://localhost:8081';
    dockerId = proc.toString().trim();
  }
  execSync('sleep 3');
});

afterAll(() => {
  if (dockerId) {
    execSync(`docker kill ${dockerId}`);
    execSync(`docker rm ${dockerId}`);
  }
});

describe('getRenderedContent', () => {
  jest.setTimeout(30000);
  let browser: Browser;
  let reactServer: ChildProcess;
  let vueServer: ChildProcess;
  let imageServer: ChildProcess;

  beforeAll(async () => {
    browser = await getBrowser();
    reactServer = spawn('http-server', ['-p', '8001', 'tests/fixtures/react']);
    vueServer = spawn('http-server', ['-p', '8002', 'tests/fixtures/vue']);
    imageServer = spawn('http-server', ['-p', '8003', 'tests/fixtures/images']);
    await sleep(1000);
  });
  afterAll(async () => {
    await browser.close();
    reactServer.kill();
    vueServer.kill();
    imageServer.kill();
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
      url: `${httpbinUrl}/status/204`,
    });
    expect(result.status).toEqual(204);
    expect(result.body.byteLength).toBe(0);
    expect(browser.contexts.length).toBe(0);
  });

  test('image/png', async () => {
    const result = await getRenderedContent(browser, {
      url: 'http://localhost:8003/test.png',
    });
    expect(result).toBeResult({
      status: 200,
      size: 282503,
      hash: 'ff37ead307f4a31a7d141704daec23a6c79ea29c3cb8e90aa7120a7380fec062',
    });
  });

  test('image/jpeg', async () => {
    const result = await getRenderedContent(browser, {
      url: 'http://localhost:8003/test.jpg',
    });
    expect(result).toBeResult({
      status: 200,
      size: 197869,
      hash: '64a50ee0db19825fe6c508f8f43155c2904c8dcffbe627d86eeef2d6a57e6e5f',
    });
  });

  test('image/gif', async () => {
    const result = await getRenderedContent(browser, {
      url: 'http://localhost:8003/test.gif',
    });
    expect(result).toBeResult({
      status: 200,
      size: 120216,
      hash: 'c467d1c8a71c3985267884d82522adfabc7ce10ff452b60dfe87dbca4a24cf65',
    });
  });

  test('image/svg', async () => {
    const result = await getRenderedContent(browser, {
      url: 'http://localhost:8003/test.svg',
    });
    expect(result).toBeResult({
      status: 200,
      size: 2793,
      hash: 'adba4cd4b28b98bc155c35bcb1eaf8088ce5a5cdba5441e3a811573032b5566f',
    });
  });

  test('image/webp', async () => {
    const result = await getRenderedContent(browser, {
      url: 'http://localhost:8003/test.webp',
    });
    expect(result).toBeResult({
      status: 200,
      size: 88066,
      hash: 'dd6750f655dc1f6b4a151ee368112ee8f2910a46691a338d507fabe1d89d85ed',
    });
  });
});

describe('getRenderedContent with evaluates', () => {
  let browser: Browser;

  beforeAll(async () => {
    browser = await getBrowser();
  });
  afterAll(async () => {
    await browser.close();
  });

  it('works', async () => {
    const result = await getRenderedContent(browser, {
      url: 'http://example.com/',
      evaluates: ['document.title', 'navigator.userAgent', '1 + 1'],
    });
    expect(result.evaluateResults[0].script).toBe('document.title');
    expect(result.evaluateResults[0].result).toBe('Example Domain');
    expect(result.evaluateResults[1].script).toBe('navigator.userAgent');
    expect(result.evaluateResults[1].result).toContain('Mozilla/5.0');
    expect(result.evaluateResults[2].script).toBe('1 + 1');
    expect(result.evaluateResults[2].result).toBe(2);
  });

  it('works with errors', async () => {
    const result = await getRenderedContent(browser, {
      url: 'http://example.com/',
      evaluates: [
        'document.title',
        'throw new Error("error")',
        'navigator.userAgent',
      ],
    });
    expect(result.evaluateResults[0].script).toBe('document.title');
    expect(result.evaluateResults[0].result).toBe('Example Domain');
    expect(result.evaluateResults[1].script).toBe('throw new Error("error")');
    expect(result.evaluateResults[1].result).toContain('Error');
    expect(result.evaluateResults[1].success).toBe(false);
    expect(result.evaluateResults[2].script).toBe('navigator.userAgent');
    expect(result.evaluateResults[2].result).toContain('Mozilla/5.0');
  });

  it('can update content body', async () => {
    const result = await getRenderedContent(browser, {
      url: 'http://example.com/',
      evaluates: ['document.title = "Updated Title"'],
    });
    expect(result.evaluateResults[0].script).toBe(
      'document.title = "Updated Title"'
    );
    expect(result.evaluateResults[0].result).toBe('Updated Title');
  });
});
