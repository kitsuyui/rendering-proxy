import puppeteer from 'puppeteer';
import { Browser } from 'puppeteer';

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

export async function getPuppeteer(): Promise<Browser> {
  const executablePath = process.env.CHROMIUM_EXECUTABLE;
  const browser = await puppeteer.launch({
    product: 'chrome',
    executablePath,
    args: chromiumOptions,
  });
  return browser;
}
