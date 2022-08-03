#!/usr/bin/env node
import { server, cli } from './';
import yargs from 'yargs';

export async function main(): Promise<void> {
  yargs
    .command(
      'cli [url]',
      'CLi mode',
      (builder) => {
        return builder.positional('url', {
          type: 'string',
          demandOption: true,
        });
      },
      async (args) => {
        await cli.main(args.url);
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
