import {
  excludeContentDependentHeaders,
  excludeHopByHopHeaders,
  excludeUnusedHeaders,
} from './headers';

describe('headers', () => {
  test('excludeHopByHopHeaders', () => {
    expect(excludeHopByHopHeaders({})).toStrictEqual({});

    expect(
      excludeHopByHopHeaders({
        connection: 'Keep-Alive',
        etag: '"3147526947"',
      })
    ).toStrictEqual({
      etag: '"3147526947"',
    });
  });

  test('excludeContentDependentHeaders', () => {
    expect(excludeContentDependentHeaders({})).toStrictEqual({});

    expect(
      excludeContentDependentHeaders({
        'content-encoding': 'gzip',
        etag: '"3147526947"',
      })
    ).toStrictEqual({
      etag: '"3147526947"',
    });
  });

  test('excludeUnusedHeaders', () => {
    expect(excludeUnusedHeaders({})).toStrictEqual({});

    expect(
      excludeUnusedHeaders({
        connection: 'Keep-Alive',
        'content-encoding': 'gzip',
        etag: '"3147526947"',
      })
    ).toStrictEqual({
      etag: '"3147526947"',
    });
  });
});
