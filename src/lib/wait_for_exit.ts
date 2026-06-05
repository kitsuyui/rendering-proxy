export async function waitForProcessExit() {
  await new Promise<void>((resolve) => {
    const onSignal = () => {
      process.off('SIGTERM', onSignal)
      process.off('SIGINT', onSignal)
      resolve()
    }
    process.once('SIGTERM', onSignal)
    process.once('SIGINT', onSignal)
  })
}
