import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer-core';

const url = process.argv[2] || 'http://127.0.0.1:5201/';
const settle = () => new Promise((resolve) => setTimeout(resolve, 550));
const chrome = process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const out = new URL('../validation/', import.meta.url);
await mkdir(out, { recursive: true });

const browser = await puppeteer.launch({ executablePath: chrome, headless: true, args: ['--no-sandbox'] });
try {
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
  await page.setRequestInterception(true);
  page.on('request', (request) => request.url().startsWith(url.replace(/\/$/, '')) ? request.continue() : request.abort());
  await page.goto(url, { waitUntil: 'networkidle2' });
  await page.waitForSelector('#app:not([hidden])');
  await settle();
  assert.equal(await page.$$eval('.suggest-card', (nodes) => nodes.length), 4);
  await page.screenshot({ path: fileURLToPath(new URL('mobile-home.png', out)) });

  await page.click('.suggest-card:nth-child(2)');
  await page.waitForSelector('.msg.ai .ans-lead');
  await settle();
  assert.match(await page.$eval('.msg.ai .ans-lead', (node) => node.textContent), /押金/);
  await page.screenshot({ path: fileURLToPath(new URL('mobile-answer.png', out)) });

  await page.click('.ans-actions .act-btn');
  await page.waitForSelector('#screen-reader.is-active #entry-1');
  await settle();
  assert.match(await page.$eval('#entry-1', (node) => node.textContent), /押金/);
  await page.screenshot({ path: fileURLToPath(new URL('mobile-original.png', out)) });

  await page.click('#btn-reader-back');
  await page.waitForSelector('#screen-chat.is-active');
  await page.click('[data-mode="deep"]');
  await page.type('#input', '借条怎么写才有法律效力');
  await page.click('#btn-send');
  assert.match(await page.$eval('.msg.ai:last-child', (node) => node.textContent), /收益依据/);

  await page.click('#btn-attach');
  await page.waitForSelector('#screen-reader.is-active .ch-card');
  assert.equal(await page.$$eval('.ch-card', (nodes) => nodes.length), 34);
  await page.click('.ch-card');
  assert.ok(await page.$$eval('.chapter-entries:not([hidden]) .chapter-entry', (nodes) => nodes.length) > 10);
  await page.click('#btn-reader-search');
  await page.type('#reader-search-input', '押金');
  assert.ok(await page.$$eval('.search-result', (nodes) => nodes.length) >= 2);

  const layout = await page.evaluate(() => ({ viewport: innerWidth, document: document.documentElement.scrollWidth,
    buttons: [...document.querySelectorAll('.screen.is-active button')].filter((b) => b.offsetParent && b.getBoundingClientRect().right > innerWidth + 1).length }));
  assert.ok(layout.document <= layout.viewport + 1, JSON.stringify(layout));
  assert.equal(layout.buttons, 0);
  await page.click('#btn-reader-back');
  await page.waitForSelector('#screen-chat.is-active');
  await page.click('#btn-new');
  await page.click('#btn-menu');
  await settle();
  await page.click('#btn-open-history');
  assert.ok(await page.$$eval('.history-entry', (nodes) => nodes.length) >= 1);
  await page.click('.history-entry');
  assert.ok(await page.$$eval('.msg.ai', (nodes) => nodes.length) >= 2);

  await page.setViewport({ width: 1366, height: 900, deviceScaleFactor: 1 });
  await page.click('#btn-new');
  await settle();
  await page.screenshot({ path: fileURLToPath(new URL('desktop-home.png', out)) });
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
  await page.setViewport({ width: 320, height: 568, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
  await settle();
  await page.screenshot({ path: fileURLToPath(new URL('compact-home.png', out)) });
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
  assert.ok(await page.$eval('.welcome-title', (node) => {
    const rect = node.getBoundingClientRect();
    return rect.top >= 50 && rect.top < innerHeight - 100;
  }), 'empty chat title should remain visible on a compact screen');
  assert.deepEqual(errors, []);
  console.log('Mobile/desktop, offline assets, answers, sources, catalog, search and history: OK');
} finally {
  await browser.close();
}
