const chromiumOptions = [
  "--disable-accelerated-2d-canvas",
  "--disable-accelerated-video-decode",
  "--disable-background-networking",
  "--disable-client-side-phishing-detection",
  "--disable-breakpad",
  "--disable-default-apps",
  "--disable-extensions",
  "--disable-gpu",
  "--disable-sync",
  "--disable-translate",
  "--font-cache-shared-handle",
  "--incognito",
  "--metrics-recording-only",
  "--mute-audio",
  "--no-default-browser-check",
  "--no-first-run",
  "--no-sandbox",
  "--safebrowsing-disable-auto-update"
];

const uaLogLevels = ["error", "warning"];

const getRenderedContent = async (
  browser,
  url,
  evaluate = undefined,
  waitUntil = undefined
) => {
  const page = await browser.newPage();
  const errors = [];
  page.on("console", message => {
    if (uaLogLevels.includes(message.type())) {
      errors.push({
        type: consoleMessage.type(),
        text: message.text(),
        location: message.location()
      });
    }
  });
  page.on("pageerror", err => {
    errors.push(err.toString());
  });
  try {
    let response = await page.goto(url, { waitUntil });
    if (evaluate) {
      let response = await page.evaluate(evaluate);
    }
    return await getContent(page, response, errors);
  } finally {
    setImmediate(async () => {
      await page.close();
    });
  }
};

const isContentTypeHTML = contentType => {
  const htmlContentTypes = ["text/html", "application/xhtml+xml"];
  return htmlContentTypes.some(htmlContentType => {
    return contentType.startsWith(htmlContentType);
  });
};

const getContent = async (page, response, errors) => {
  const headers = Object.assign({}, response.headers());
  if (isContentTypeHTML(headers["content-type"])) {
    const script = () => document.documentElement.outerHTML;
    const textHTML = await page.evaluate(script);
    return new Response(headers, Buffer.from(textHTML), errors);
  }
  return new Response(headers, await response.buffer(), errors);
};

class Response {
  constructor(headers, body, errors) {
    this.headers = headers;
    this.body = body;
    this.errors = errors;
  }
}

module.exports = {
  chromiumOptions,
  getRenderedContent,
  isContentTypeHTML
};
