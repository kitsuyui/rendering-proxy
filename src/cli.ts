import puppeteer from "puppeteer";
import { parse as urlParse } from "url";
import { chromiumOptions, getRenderedContent } from "./utils";
import type { WaitUntil } from "./utils";

export async function main(url: string, waitUntil: WaitUntil, evaluate = undefined): Promise<void> {
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
    {evaluate, waitUntil}
  );
  if (result) {
    process.stdout.setEncoding("binary");
    process.stdout.write(result.body);
  }
  browser.close();
  process.exit();
};

export function fillURLProtocolScheme(url: string, scheme: string = "http://"): string {
  if (urlParse(url).protocol) {
    return url;
  }
  return scheme + url;
};
