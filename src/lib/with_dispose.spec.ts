import { withDispose } from './with_dispose';

class Resource {
  name: string;
  disposed = false;
  constructor(name: string) {
    this.name = name;
    this.disposed = false;
  }
  async dispose() {
    this.disposed = true;
  }
}

describe('withDispose', () => {
  test('dispose correctly', async () => {
    const resource1 = new Resource('one');
    const resource2 = new Resource('two');
    const resource3 = new Resource('three');
    const response = await withDispose(async (dispose) => {
      dispose(async () => await resource1.dispose());
      dispose(async () => await resource2.dispose());
      dispose(async () => await resource3.dispose());
      return resource3;
    });
    expect(resource1.disposed).toBe(true);
    expect(resource2.disposed).toBe(true);
    expect(resource3.disposed).toBe(true);
    expect(response.name).toBe('three');
  });

  test('dispose correctly 1', async () => {
    const resource1 = new Resource('one');
    const resource2 = new Resource('two');
    const resource3 = new Resource('three');
    try {
      await withDispose(async (dispose) => {
        dispose(async () => await resource1.dispose());
        // eslint-disable-next-line no-constant-condition
        if (1 + 1 === 2) {
          throw new Error('error');
        }
        dispose(async () => await resource2.dispose());
        dispose(async () => await resource3.dispose());
        return resource3;
      });
    } catch (e) {
      ('do nothing');
    }
    expect(resource1.disposed).toBe(true);
    expect(resource2.disposed).toBe(false);
    expect(resource3.disposed).toBe(false);
  });

  test('dispose correctly 2', async () => {
    const resource1 = new Resource('one');
    const resource2 = new Resource('two');
    const resource3 = new Resource('three');
    try {
      await withDispose(async (dispose) => {
        dispose(async () => await resource1.dispose());
        dispose(async () => await resource2.dispose());
        // eslint-disable-next-line no-constant-condition
        if (1 + 1 === 2) {
          throw new Error('error');
        }
        dispose(async () => await resource3.dispose());
        return resource3;
      });
    } catch (e) {
      ('do nothing');
    }
    expect(resource1.disposed).toBe(true);
    expect(resource2.disposed).toBe(true);
    expect(resource3.disposed).toBe(false);
  });

  test('dispose correctly 3', async () => {
    const resource1 = new Resource('one');
    const resource2 = new Resource('two');
    const resource3 = new Resource('three');
    try {
      await withDispose(async (dispose) => {
        dispose(async () => await resource1.dispose());
        dispose(async () => await resource2.dispose());
        dispose(async () => await resource3.dispose());
        // eslint-disable-next-line no-constant-condition
        if (1 + 1 === 2) {
          throw new Error('error');
        }
        return resource3;
      });
    } catch (e) {
      ('do nothing');
    }
    expect(resource1.disposed).toBe(true);
    expect(resource2.disposed).toBe(true);
    expect(resource3.disposed).toBe(true);
  });
});
