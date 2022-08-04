#!/usr/bin/env node
import yargs from 'yargs';

import { SelectableBrowsers, selectableBrowsers } from './browser';
import { LifecycleEvent, lifeCycleEvents } from './render';

import { cli, server } from './';

export async function main(): Promise<void> {
  yargs
    .command(
      'cli [url]',
      'CLi mode',
      (builder) => {
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
      },
      async (args) => {
        const url = args.url;
        const waitUntil = args.u as LifecycleEvent;
        const browser = args.b as SelectableBrowsers;
        await cli.main({ url, waitUntil, name: browser });
      }
    )
    .command(
      'server',
      'Server mode',
      (builder) => {
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
      },
      async (args) => {
        const browser = args.b as SelectableBrowsers;
        const port = args.p as number;
        await server.main({ port, name: browser });
      }
    )
    .demandCommand(1)
    .help().argv;
}

if (require.main === module) {
  main();
}
