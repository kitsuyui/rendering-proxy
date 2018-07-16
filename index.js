const neodoc = require('neodoc');
const { main: serverMain } = require('./server');
const { main: cliMain } = require('./cli');

const main = async () => {
  const args = neodoc.run(`
Usage:
  fetcher [--help]
  fetcher cli [--help] [--waitUntil=<wait-until>] [--evaluate=<script>] <url>
  fetcher server [--help] [--port=<port>]

Options:
  --waitUntil=<wait-until> [default: "load"]
  --evaluate=<script>      [default: ""]
  --port=<port>            [default: 8080]
`, { smartOptions: true });
  if (args.cli) {
    await cliMain(args['<url>'], args['--waitUntil'], args['--evaluate']);
  } else if (args.server) {
    await serverMain(port=args['--port']);
  }
}

if (require.main === module) {
  main();
}
