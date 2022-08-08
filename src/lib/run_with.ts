// Like Python's with statement
export async function runWith<T, S>(
  generator: AsyncIterable<T>,
  fn: (item: T) => Promise<S>
): Promise<S> {
  for await (const item of generator) {
    return await fn(item);
  }
  // unreachable
  return undefined as never;
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
