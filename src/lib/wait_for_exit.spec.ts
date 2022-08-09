// waitForProcessExit

import { waitForProcessExit } from './wait_for_exit';

describe('waitForProcessExit', () => {
  let called = false;
  jest.spyOn(process, 'exit').mockImplementation(() => {
    called = true;
    process.emit('exit');
  });

  it('wait for process.exit', async () => {
    setTimeout(() => {
      process.exit(0);
    }, 200);
    expect(called).toBe(false);
    await waitForProcessExit();
    expect(called).toBe(true);
  });
});
