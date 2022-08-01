import * as chromium from './chromium';
import * as firefox from './firefox';
import { Browser } from 'puppeteer';

export async function getPuppeteer(): Promise<Browser> {
  const puppeteerProduct = process.env.PUPPETEER_PRODUCT;
  if (puppeteerProduct === 'firefox') {
    return await firefox.getPuppeteer();
  }
  return await chromium.getPuppeteer();
}
