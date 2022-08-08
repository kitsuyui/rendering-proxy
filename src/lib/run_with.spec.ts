import { runWith } from './run_with';

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

async function* withSomeResource(resource: Resource): AsyncGenerator<Resource> {
  try {
    yield resource;
  } finally {
    await resource.dispose();
  }
}

describe('withContext', () => {
  it('dispose will be called', async () => {
    const resource = new Resource('something');
    await runWith(withSomeResource(resource), async (resource) => {
      expect(resource.name).toBe('something');
    });
    expect(resource.disposed).toBe(true);
  });

  it('dispose will be called even if error occured', async () => {
    const resource = new Resource('something');
    try {
      await runWith(withSomeResource(resource), async () => {
        throw new Error('something');
      });
    } catch (err) {
      expect(err.message).toBe('something');
    }
    expect(resource.disposed).toBe(true);
  });
});
