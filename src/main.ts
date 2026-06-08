#!/usr/bin/env node
import yargs from 'yargs'
import { cli, server } from './'
import { type SelectableBrowsers, selectableBrowsers } from './browser'
import { type LifecycleEvent, lifeCycleEvents } from './render'

function validateMaxConcurrentRenders(argv: {
  'max-concurrent-renders': unknown
}): true {
  const m = argv['max-concurrent-renders'] as number
  if (!Number.isInteger(m) || m < 0) {
    throw new Error('--max-concurrent-renders must be a non-negative integer')
  }
  return true
}

export async function main(): Promise<void> {
  yargs(process.argv.slice(2))
    .command(
      'cli',
      'Render a page from the command line',
      (yargs) => {
        return yargs
          .option('url', {
            alias: 'u',
            type: 'string',
            description: 'URL to render',
            demandOption: true,
          })
          .option('waitUntil', {
            alias: 'w',
            type: 'string',
            description: 'Wait until the page is loaded',
            choices: lifeCycleEvents,
            default: 'load',
          })
          .option('browser', {
            alias: 'b',
            type: 'string',
            description: 'Browser to use',
            choices: selectableBrowsers,
            default: 'chromium',
          })
          .option('evaluate', {
            alias: 'e',
            type: 'array',
            description: 'Evaluate JavaScript in the page',
            default: [],
          })
      },
      async (argv) => {
        await cli.main({
          url: argv.url,
          waitUntil: argv.waitUntil as LifecycleEvent,
          name: argv.browser as SelectableBrowsers,
          evaluates: argv.evaluate as string[],
        })
      },
    )
    .command(
      'server',
      'Start a rendering proxy server',
      (yargs) => {
        return yargs
          .option('port', {
            alias: 'p',
            type: 'number',
            description: 'Port to listen',
            default: 8080,
          })
          .option('browser', {
            alias: 'b',
            type: 'string',
            description: 'Browser to use',
            choices: selectableBrowsers,
            default: 'chromium',
          })
          .option('max-concurrent-renders', {
            alias: 'm',
            type: 'number',
            description: 'Maximum number of concurrent render requests',
            default: 10,
          })
          .check(validateMaxConcurrentRenders)
      },
      async (argv) => {
        await server.main({
          port: argv.port,
          name: argv.browser as SelectableBrowsers,
          maxConcurrentRenders: argv['max-concurrent-renders'] as number,
        })
      },
    )
    .demandCommand(1, 'You need at least one command before moving on')
    .help().argv
}

if (require.main === module) {
  main()
}
