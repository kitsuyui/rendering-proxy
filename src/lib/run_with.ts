// Like Python's with statement
export async function runWith<T, S>(
  generator: AsyncIterable<T>,
  fn: (item: T) => Promise<S>
): Promise<S> {
  for await (const item of generator) {
    return await fn(item);
  }
  /* istanbul ignore next */
  return undefined as never; // unreachable
}

export async function* nestWith<T, S>(
  generator: AsyncIterable<T>,
  generator2: (item: T) => AsyncIterable<S>
): AsyncIterable<S> {
  for await (const item of generator) {
    for await (const item2 of generator2(item)) {
      yield item2;
    }
  }
}
