// 交互端到端自检：点建议卡 → 提问 → 抽屉 → 原文
import puppeteer from 'puppeteer-core';
import path from 'node:path';
import fs from 'node:fs';

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const OUT = path.resolve('shots');
fs.mkdirSync(OUT, { recursive: true });
const url = process.argv[2] || 'http://127.0.0.1:5188/';
const tag = process.argv[3] || 'ui';

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'new',
  args: ['--disable-gpu', '--no-sandbox', '--hide-scrollbars'],
});
const page = await browser.newPage();
const errors = [];
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
await sleep(1500);

const shot = async (n) => {
  await sleep(450);
  await page.screenshot({ path: path.join(OUT, `${tag}-${n}.png`) });
};

const count = await page.$$eval('.suggest-card', (n) => n.length).catch(() => 0);
console.log('suggest cards:', count);

if (count) {
  await page.click('.suggest-card');
  await sleep(1400);
  await shot('1-answer');
  const meta = await page.$eval('.msg.ai .ai-meta', (e) => e.textContent.trim()).catch(() => null);
  console.log('answer meta:', meta);
  const lead = await page.$eval('.ans-lead', (e) => e.textContent.trim()).catch(() => null);
  console.log('answer lead:', lead);
}

await page.click('#btn-menu').catch(() => {});
await sleep(500);
await shot('2-drawer');

const readerBtn = await page.$('#btn-open-reader, [data-action="catalog"], .drawer-item');
if (readerBtn) { await readerBtn.click(); await sleep(900); await shot('3-reader'); }

console.log('console errors:', errors.length ? errors : 'none');
await browser.close();

function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }
