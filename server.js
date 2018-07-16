const http = require('http');
const https = require('https');
const puppeteer = require('puppeteer');
const { chromiumOptions, getRenderedContent } = require('./utils');

const CERTIFICATE_DOWNLOAD_HOSTNAME = 'mitm';

const main = async (port) => {
  const executablePath = process.env.CHROMIUM_EXECUTABLE;
  const browser = await puppeteer.launch({
    executablePath,
    args: chromiumOptions,
  });

  const httpServer = http.createServer(async (req, res) => {
    const evaluate = undefined;
    const waitUntil = undefined;
    const url = req.url.slice(1);
    const result = await getRenderedContent(browser, url, evaluate, waitUntil);
    for (const key of Object.keys(result.headers)) {
      res.setHeader(key, result.headers[key]);
    }
    res.end(await result.body);
  });
  httpServer.listen(port);;
};

module.exports = { main };
