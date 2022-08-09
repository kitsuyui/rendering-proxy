import { nestWith, runWith } from './run_with';

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

async function* withSomeResource(resource: Resource): AsyncIterable<Resource> {
  try {
    yield resource;
  } finally {
    await resource.dispose();
  }
}

describe('runWith', () => {
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

describe('nestWith', () => {
  it('dispose will be called', async () => {
    const resource = new Resource('something');
    const resource2 = new Resource('something');
    await runWith(
      nestWith(withSomeResource(resource), () => {
        return withSomeResource(resource2);
      }),
      async () => {
        'do nothing';
      }
    );
    expect(resource.disposed).toBe(true);
    expect(resource2.disposed).toBe(true);
  });

  it('dispose will be called even if error occured', async () => {
    const resource = new Resource('something');
    const resource2 = new Resource('something');
    try {
      await runWith(
        nestWith(withSomeResource(resource), () => {
          return withSomeResource(resource2);
        }),
        async () => {
          throw new Error('something');
        }
      );
    } catch (err) {
      expect(err.message).toBe('something');
    }
    expect(resource.disposed).toBe(true);
    expect(resource2.disposed).toBe(true);
  });
});
