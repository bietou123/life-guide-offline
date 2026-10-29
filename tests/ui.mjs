import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer-core';

const url = process.argv[2] || 'http://127.0.0.1:5201/';
const settle = () => new Promise((resolve) => setTimeout(resolve, 550));
const waitForAnswer = (page) => page.waitForFunction(() => {
  const body = [...document.querySelectorAll('.msg.ai .ai-body')].at(-1);
  return body && !body.hasAttribute('data-streaming') && !body.querySelector('.stream-wait, .stream-typing');
});
const chrome = process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const out = new URL('../validation/', import.meta.url);
await mkdir(out, { recursive: true });

async function expectChat(page) {
  try {
    await page.waitForSelector('#screen-chat.is-active', { timeout: 5000 });
  } catch (error) {
    const state = await page.evaluate(() => ({
      url: location.href, historyState: history.state, historyLength: history.length,
      chat: document.querySelector('#screen-chat').className,
      reader: document.querySelector('#screen-reader').className,
      drawerHidden: document.querySelector('#drawer').hidden,
      maskHidden: document.querySelector('#drawer-mask').hidden,
    }));
    console.error('Navigation state:', state);
    throw error;
  }
}

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
  await waitForAnswer(page);
  await settle();
  assert.match(await page.$eval('.msg.ai .ans-lead', (node) => node.textContent), /押金/);
  await page.screenshot({ path: fileURLToPath(new URL('mobile-answer.png', out)) });

  await page.click('.ans-actions .act-btn');
  await page.waitForSelector('#screen-reader.is-active #entry-1');
  await settle();
  assert.match(await page.$eval('#entry-1', (node) => node.textContent), /押金/);
  await page.screenshot({ path: fileURLToPath(new URL('mobile-original.png', out)) });

  await page.click('#btn-reader-back');
  await expectChat(page);
  await page.click('[data-mode="deep"]');
  await page.type('#input', '借条怎么写才有法律效力');
  await page.click('#btn-send');
  await waitForAnswer(page);
  assert.match(await page.$eval('.msg.ai:last-child', (node) => node.textContent), /原文依据/);

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
  await expectChat(page);
  await page.click('#btn-new');
  await page.click('#btn-menu');
  await settle();
  await page.click('#btn-open-history');
  assert.ok(await page.$$eval('.history-entry', (nodes) => nodes.length) >= 1);
  await page.click('.history-entry');
  assert.ok(await page.$$eval('.msg.ai', (nodes) => nodes.length) >= 2);

  await page.click('[data-mode="fast"]');
  await page.click('#btn-new');
  await page.type('#input', '怀孕了做哪些检查');
  await page.click('#btn-send');
  await waitForAnswer(page);
  assert.equal(await page.$$eval('.guide-point', (nodes) => nodes.length), 3);
  assert.match(await page.$eval('.guide-point .ref-link', (node) => node.textContent), /27\.2/);
  assert.equal(await page.$$eval('.guide-point .ans-sec', (nodes) => nodes.length), 0);
  await page.click('[data-mode="deep"]');
  assert.ok(await page.$$eval('.guide-point .ans-sec', (nodes) => nodes.length) >= 2);
  await page.click('.guide-point .ref-link');
  await page.waitForSelector('#screen-reader.is-active #entry-2');
  assert.match(await page.$eval('#entry-2', (node) => node.textContent), /母子健康手册|产检/);
  assert.equal(await page.$eval('#reader-search-input', (node) => node.value), '');
  await page.click('#btn-reader-back');
  await page.waitForSelector('#screen-chat.is-active');

  await page.click('#btn-menu');
  await page.waitForFunction(() => !document.querySelector('#drawer').hidden);
  await settle();
  if (await page.$eval('#history-list', (node) => node.hidden)) await page.click('#btn-open-history');
  await page.waitForFunction(() => !document.querySelector('#history-list').hidden);
  const oldCount = await page.$$eval('.history-row', (nodes) => nodes.length);
  assert.ok(oldCount >= 2);
  page.once('dialog', (dialog) => dialog.accept());
  await page.click('.history-row:last-child .history-delete');
  await page.waitForFunction((count) => document.querySelectorAll('.history-row').length === count - 1, {}, oldCount);
  assert.equal(await page.$$eval('.history-row', (nodes) => nodes.length), oldCount - 1);
  const outside = await page.evaluate(() => ({
    x: (document.querySelector('#drawer').getBoundingClientRect().right + innerWidth) / 2,
    y: innerHeight / 2,
  }));
  await page.mouse.click(outside.x, outside.y);
  try {
    await page.waitForFunction(() => document.querySelector('#drawer').hidden && document.querySelector('#screen-chat').classList.contains('is-active'), { timeout: 5000 });
  } catch (error) {
    console.error('Drawer close state:', await page.evaluate(() => ({
      historyState: history.state, url: location.href,
      chat: document.querySelector('#screen-chat').className,
      reader: document.querySelector('#screen-reader').className,
      drawerHidden: document.querySelector('#drawer').hidden,
      maskHidden: document.querySelector('#drawer-mask').hidden,
    })));
    throw error;
  }

  await page.setViewport({ width: 1366, height: 900, deviceScaleFactor: 1 });
  await settle();
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
