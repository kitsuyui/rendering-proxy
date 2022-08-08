// Like Python's with statement
export async function runWith<T, S>(
  generator: AsyncGenerator<T>,
  fn: (item: T) => Promise<S>
): Promise<void> {
  for await (const item of generator) {
    await fn(item);
  }
}
