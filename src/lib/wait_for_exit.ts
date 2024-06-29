export async function waitForProcessExit() {
  await new Promise((resolve) => {
    process.on('exit', resolve)
  })
}
