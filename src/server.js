const http = require("http");
const https = require("https");
const accesslog = require("access-log");
const puppeteer = require("puppeteer");
const { chromiumOptions, getRenderedContent } = require("./utils");

const CERTIFICATE_DOWNLOAD_HOSTNAME = "mitm";

const main = async port => {
  const executablePath = process.env.CHROMIUM_EXECUTABLE;
  const browser = await puppeteer.launch({
    executablePath,
    args: chromiumOptions
  });

  const httpServer = http.createServer(async (req, res) => {
    const evaluate = undefined;
    const waitUntil = undefined;
    const url = req.url.slice(1);
    accesslog(req, res);
    const result = await getRenderedContent(browser, url, evaluate, waitUntil);
    for (const key of Object.keys(result.headers)) {
      if (ignoreHeaders.includes(key.toLowerCase())) {
        continue;
      }
      res.setHeader(key, result.headers[key]);
    }
    res.write(result.body);
    res.end();
  });
  httpServer.listen(port);
};

const ignoreHeaders = [
  "accept-ranges",
  "content-length",
  "transfer-encoding",
  "connection",
  "content-encoding"
];

module.exports = { main };
