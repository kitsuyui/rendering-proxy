import { isContentTypeHTML } from './utils';

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
