const puppeteer = require("puppeteer");
const { parse: urlParse } = require("url");
const { chromiumOptions, getRenderedContent } = require("./utils");

const main = async (url, waitUntil, evaluate) => {
  process.on("unhandledRejection", err => {
    console.error(err);
    process.exit(1);
  });
  const executablePath = process.env.CHROMIUM_EXECUTABLE;
  const browser = await puppeteer.launch({
    executablePath,
    args: chromiumOptions
  });
  const filledUrl = fillURLProtocolScheme(url);
  const result = await getRenderedContent(
    browser,
    filledUrl,
    evaluate,
    waitUntil
  );
  process.stdout.setEncoding("binary");
  process.stdout.write(result.body);
  browser.close();
  process.exit();
};

const fillURLProtocolScheme = (url, scheme = "http://") => {
  if (urlParse(url).protocol) {
    return url;
  }
  return scheme + url;
};

module.exports = { main };
