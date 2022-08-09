export async function withDispose<T>(
  fn: (dispose: (disporser: () => Promise<unknown>) => void) => T
): Promise<T> {
  const disporsers: (() => Promise<unknown>)[] = [];
  const dispose = (disporser: () => Promise<unknown>): void => {
    disporsers.push(disporser);
  };
  try {
    return await fn(dispose);
  } finally {
    for (const disporser of disporsers.reverse()) {
      await disporser();
    }
  }
}
