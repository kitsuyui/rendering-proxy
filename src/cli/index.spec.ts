import { Writable } from 'node:stream';

import { main, renderToStream } from './index';

describe('renderToStream', () => {
  it('render', async () => {
    const texts: string[] = [];
    const writable = new Writable({
      write(chunk, encoding, callback) {
        texts.push(chunk.toString());
        callback(null);
      },
      objectMode: true,
    });
    await renderToStream(
      { name: 'chromium', url: 'https://httpbin.org/robots.txt' },
      writable
    );
    expect(texts).toMatchSnapshot();
  });
});

describe('main', () => {
  let called = false;
  const outputs = [];
  jest.spyOn(process, 'exit').mockImplementation(() => {
    called = true;
    process.emit('exit');
  });

  jest.spyOn(process.stdout, 'write').mockImplementation((arg: Buffer) => {
    outputs.push(arg.toString('utf8'));
  });

  it('main', async () => {
    expect(called).toBe(false);
    expect(outputs).toStrictEqual([]);
    await main({ url: 'https://httpbin.org/robots.txt', name: 'chromium' });
    expect(called).toBe(true);
    expect(outputs).toMatchSnapshot();
  });
});
