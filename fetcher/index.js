const fetch = require('node-fetch');
const minimist = require('minimist');
const puppeteer = require('puppeteer');

const DEFAULT_CHROMIUM_DEBUGGER_ADDRESS = '127.0.0.1';
const DEFAULT_CHROMIUM_DEBUGGER_PORT = 9222;

const getInitialContext = () => {
  const args = minimist(process.argv.slice(2));
  const urls = args._;
  const waitUntil = args.wait;
  const evaluate = args.evaluate;
  const debuggerHost = process.env.CHROMIUM_DEBUGGER_ADDRESS || DEFAULT_CHROMIUM_DEBUGGER_ADDRESS;
  const debuggerPort = process.env.CHROMIUM_DEBUGGER_PORT || DEFAULT_CHROMIUM_DEBUGGER_PORT;
  return {
    urls,
    waitUntil,
    evaluate,
    debuggerHost,
    debuggerPort,
  }
}

const main = async () => {
  const {
    urls, waitUntil, evaluate,
    debuggerHost, debuggerPort,
  } = getInitialContext();
  const browserWSEndpoint = await remoteDebuggerUrlFromHostPort(debuggerHost, debuggerPort);
  const browser = await puppeteer.connect({browserWSEndpoint});
  for (const url of urls) {
    const result = await getRenderedDom(browser, url, evaluate, waitUntil);
    process.stdout.write(result);
  }
  process.exit();
}

const remoteDebuggerUrlFromHostPort = async (
  host = DEFAULT_CHROMIUM_DEBUGGER_ADDRESS,
  port = DEFAULT_CHROMIUM_DEBUGGER_PORT,
) => {
  const remoteDebuggerUrl = `http://${host}:${port}/json/version`;
  const response = await fetch(remoteDebuggerUrl);
	const json = await response.json();
  return json.webSocketDebuggerUrl;
}

const getRenderedDom = async (
  browser, url,
  evaluate = undefined,
  waitUntil = undefined,
) => {
  const page = await browser.newPage();
  const getCurrentDom = () => document.documentElement.outerHTML;
  try {
    await page.goto(url, {waitUntil});
    if (evaluate) {
      await page.evaluate(evaluate);
    }
    return await page.evaluate(getCurrentDom);
  } finally {
    await page.close();
  }
}

if (require.main === module) {
  (async () => main())();
}
