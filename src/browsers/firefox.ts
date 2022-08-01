import puppeteer from 'puppeteer';
import { Browser } from 'puppeteer';

export async function getPuppeteer(): Promise<Browser> {
  const executablePath = process.env.FIREFOX_EXECUTABLE;
  const browser = await puppeteer.launch({
    product: 'firefox',
    executablePath,
    args: ['-wait-for-browser'],
  });
  return browser;
}
