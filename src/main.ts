#!/usr/bin/env node
import yargs from 'yargs'
import { cli, server } from './'
import { type SelectableBrowsers, selectableBrowsers } from './browser'
import { ensureURLStartsWithProtocolScheme } from './lib/url'
import { type LifecycleEvent, lifeCycleEvents } from './render'

const usageErrorExitCode = 2
const runtimeErrorExitCode = 1

export class CliUsageError extends Error {
  readonly exitCode = usageErrorExitCode

  constructor(message: string) {
    super(message)
    this.name = 'CliUsageError'
  }
}

export function validateURLArgument(url: string): string {
  const normalizedURL = ensureURLStartsWithProtocolScheme(url)
  try {
    new URL(normalizedURL)
  } catch {
    throw new CliUsageError(`Invalid URL: ${url}`)
  }
  return url
}

function handleYargsFailure(
  message: string | null,
  error: Error | null,
): never {
  throw yargsFailureError(message, error)
}

function yargsFailureError(message: string | null, error: Error | null): Error {
  if (error instanceof CliUsageError) {
    return error
  }
  if (!message) {
    return error ?? new CliUsageError('Invalid CLI arguments')
  }
  return new CliUsageError(message)
}

export function getCliExitCode(error: unknown): number {
  if (error instanceof CliUsageError) {
    return error.exitCode
  }
  return runtimeErrorExitCode
}

function errorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }
  return String(error)
}

export function formatCliError(error: unknown): string {
  const label = error instanceof CliUsageError ? 'Usage error' : 'Error'
  return `rendering-proxy: ${label}: ${errorMessage(error)}`
}

export function handleMainError(error: unknown): never {
  console.error(formatCliError(error))
  process.exit(getCliExitCode(error))
}

export async function main(args = process.argv.slice(2)): Promise<void> {
  await yargs(args)
    .scriptName('rendering-proxy')
    .version()
    .exitProcess(false)
    .fail(handleYargsFailure)
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
            coerce: validateURLArgument,
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
      },
      async (argv) => {
        await server.main({
          port: argv.port,
          name: argv.browser as SelectableBrowsers,
        })
      },
    )
    .demandCommand(1, 'You need at least one command before moving on')
    .strictCommands()
    .help()
    .parseAsync()
}

if (require.main === module) {
  main().catch(handleMainError)
}
