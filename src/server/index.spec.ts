import http, { IncomingMessage } from 'http';

import { getBrowser } from '../browser';
import { withDispose } from '../lib/with_dispose';

import { createServer, terminateRequestWithEmpty } from './index';

describe('terminateRequestWithEmpty', () => {
  it('responses nothing', async () => {
    const port = 8090;
    const server = http.createServer(terminateRequestWithEmpty);
    server.listen(port);
    const res: IncomingMessage = await new Promise((resolve) => {
      return http.get(`http://localhost:${port}/`, (res) => {
        return resolve(res);
      });
    });
    expect(res.statusCode).toBe(204);
    expect(res.read()).toBe(null);
    server.close();
  });
});

describe('withServer', () => {
  it('responses rendered content', async () => {
    const port = 8091;
    const res = await withDispose(async (dispose) => {
      const browser = await getBrowser();
      dispose(async () => await browser.close());

      const server = await createServer({ browser, port });
      dispose(async () => server.close());

      const res: IncomingMessage = await new Promise((resolve) => {
        return http.get(
          `http://localhost:${port}/https://httpbin.org/json`,
          (res) => {
            return resolve(res);
          }
        );
      });
      return res;
    });
    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.read().toString('utf8'))).toStrictEqual({
      slideshow: {
        author: 'Yours Truly',
        date: 'date of publication',
        slides: [
          {
            title: 'Wake up to WonderWidgets!',
            type: 'all',
          },
          {
            items: [
              'Why <em>WonderWidgets</em> are great',
              'Who <em>buys</em> WonderWidgets',
            ],
            title: 'Overview',
            type: 'all',
          },
        ],
        title: 'Sample Slide Show',
      },
    });
  });

  it('responses empty when invalid URL', async () => {
    const port = 8092;
    await withDispose(async (dispose) => {
      const browser = await getBrowser();
      dispose(async () => await browser.close());

      const server = await createServer({ browser, port });
      dispose(async () => server.close());

      const res: IncomingMessage = await new Promise((resolve) => {
        return http.get(`http://localhost:${port}/`, (res) => {
          return resolve(res);
        });
      });
      expect(res.statusCode).toBe(204);
      expect(res.read()).toBe(null);
    });
  });

  it('responses health', async () => {
    const port = 8092;
    const res = await withDispose(async (dispose) => {
      const browser = await getBrowser();
      dispose(async () => await browser.close());

      const server = await createServer({ browser, port });
      dispose(async () => server.close());

      const res: IncomingMessage = await new Promise((resolve) => {
        return http.get(`http://localhost:${port}/health/`, (res) => {
          return resolve(res);
        });
      });
      return res;
    });
    expect(res.statusCode).toBe(200);
    expect(res.read().toString('utf8')).toBe('OK');
  });
});
