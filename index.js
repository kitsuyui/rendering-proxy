const { parse: urlParse } = require('url');
const minimist = require('minimist');
const puppeteer = require('puppeteer');

const getInitialContext = () => {
  const args = minimist(process.argv.slice(2));
  const url = args._[0];
  const waitUntil = args.wait;
  const evaluate = args.evaluate;;
  return {
    url,
    waitUntil,
    evaluate,
  };
}

const chromiumOptions = [
  '--disable-accelerated-2d-canvas',
  '--disable-accelerated-video-decode',
  '--disable-background-networking',
  '--disable-client-side-phishing-detection',
  '--disable-breakpad',
  '--disable-default-apps',
  '--disable-extensions',
  '--disable-gpu',
  '--disable-sync',
  '--disable-translate',
  '--font-cache-shared-handle',
  '--incognito',
  '--metrics-recording-only',
  '--mute-audio',
  '--no-default-browser-check',
  '--no-first-run',
  '--no-sandbox',
  '--safebrowsing-disable-auto-update',
];

const htmlContentTypes = [
  'text/html',
  'application/xhtml+xml',
];

const main = async () => {
  const { url, waitUntil, evaluate } = getInitialContext();
  process.on('unhandledRejection', (err) => {
    console.error(err);
    process.exit(1);
  });
  const executablePath = process.env.CHROMIUM_EXECUTABLE;
  const browser = await puppeteer.launch({
    executablePath,
    args: chromiumOptions,
  });
  const filledUrl = fillURLProtocolScheme(url);
  const result = await getRenderedContent(browser, filledUrl, evaluate, waitUntil);
  process.stdout.setEncoding('binary');
  process.stdout.write(result);
  browser.close();
  process.exit();
}

const getRenderedContent = async (
  browser, url,
  evaluate = undefined,
  waitUntil = undefined,
) => {
  const page = await browser.newPage();
  try {
    let response = await page.goto(url, { waitUntil });
    if (evaluate) {
      let response = await page.evaluate(evaluate);
    }
    return await getContent(page, response);
  } finally {
    await page.close();
  }
}

const fillURLProtocolScheme = (url, scheme='http://') => {
  if (urlParse(url).protocol) {
    return url;
  }
  return scheme + url;
}

const getContent = async (page, response) => {
  const contentType = response.headers['content-type'];
  if (htmlContentTypes.includes(contentType)) {
    const script = () => document.documentElement.outerHTML;
    const textHTML = await page.evaluate(script);
    return Buffer.from(textHTML);
  }
  return response.buffer();
}

if (require.main === module) {
  main();
}
