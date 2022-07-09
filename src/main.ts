#!/usr/bin/env node
import yargs from 'yargs';
import { serverMain as serverMain } from './server';
import { cliMain as cliMain } from './cli';
import type { WaitUntil } from './utils';

export async function main(): Promise<void> {
  yargs
    .command(
      'cli [url]',
      'CLi mode',
      (builder) => {
        return builder
          .option('u', {
            alias: 'waitUntil',
            default: 'load',
            choices: [
              'load',
              'domcontentloaded',
              'networkidle0',
              'networkidle2',
            ],
          })
          .option('e', { alias: 'evaluate', default: '', type: 'string' })
          .positional('url', { type: 'string', demandOption: true });
      },
      async (args) => {
        await cliMain(args.url, args.u as WaitUntil, args.e);
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
        await serverMain(args.p);
      }
    )
    .demandCommand(1)
    .help().argv;
}

if (require.main === module) {
  main();
}
