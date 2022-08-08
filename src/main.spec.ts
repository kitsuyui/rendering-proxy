import { parseArgs } from './main';

describe('parseArgs', () => {
  test('cli', async () => {
    const argv = await parseArgs([
      'cli',
      'https://httpbin.org/robots.txt',
      '--browser',
      'chromium',
      '--waitUntil',
      'networkidle',
    ]);
    expect(argv.u).toBe('networkidle');
    expect(argv.b).toBe('chromium');
    expect(argv.url).toBe('https://httpbin.org/robots.txt');
  });

  test('server', async () => {
    const argv = await parseArgs([
      'server',
      '--browser',
      'chromium',
      '--port',
      '8080',
    ]);
    expect(argv.b).toBe('chromium');
    expect(argv.p).toBe(8080);
  });
});
