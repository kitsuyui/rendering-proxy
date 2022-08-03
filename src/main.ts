#!/usr/bin/env node
import { lifeCycleEvents, LifecycleEvent } from './render';
import { server, cli } from './';
import yargs from 'yargs';

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
          .positional('url', { type: 'string', demandOption: true });
      },
      async (args) => {
        const url = args.url;
        const waitUntil = args.u as LifecycleEvent;
        await cli.main({ url, waitUntil });
      }
    )
    .command(
      'server',
      'Server mode',
      (builder) => {
        return builder.option('p', {
          alias: 'port',
          type: 'number',
          default: 8080,
        });
      },
      async (args) => {
        await server.main({ port: args.p });
      }
    )
    .demandCommand(1)
    .help().argv;
}

if (require.main === module) {
  main();
}
