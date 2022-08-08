#!/usr/bin/env node
import yargs from 'yargs';

import { SelectableBrowsers, selectableBrowsers } from './browser';
import { LifecycleEvent, lifeCycleEvents } from './render';

import { cli, server } from './';

type ParsedArgs =
  | {
      [x: string]: unknown;
      u: string;
      url: string;
      p: number;
      b: string;
      _: (string | number)[];
      $0: string;
    }
  | {
      [x: string]: unknown;
      u: string;
      url: string;
      p: number;
      b: string;
      _: (string | number)[];
      $0: string;
    };

export async function parseArgs(args: string[]): Promise<ParsedArgs> {
  return await yargs(args)
    .command('cli [url]', 'CLi mode', (builder) => {
      return builder
        .option('u', {
          alias: 'waitUntil',
          default: 'networkidle',
          choices: lifeCycleEvents,
        })
        .option('b', {
          alias: 'browser',
          default: 'chromium',
          choices: selectableBrowsers,
        })
        .positional('url', { type: 'string', demandOption: true });
    })
    .command('server', 'Server mode', (builder) => {
      return builder
        .option('p', {
          alias: 'port',
          type: 'number',
          default: 8080,
        })
        .option('b', {
          alias: 'browser',
          default: 'chromium',
          choices: selectableBrowsers,
        });
    })
    .demandCommand(1)
    .help().argv;
}

export async function main(): Promise<void> {
  const argv = await parseArgs(process.argv.slice(2));
  if (argv._[0] === 'cli') {
    await cli.main({
      url: argv.url,
      waitUntil: argv.u as LifecycleEvent,
      name: argv.b as SelectableBrowsers,
    });
  } else if (argv._[0] === 'server') {
    await server.main({
      port: argv.p,
      name: argv.b as SelectableBrowsers,
    });
  }
}

if (require.main === module) {
  main();
}
