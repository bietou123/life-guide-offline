// 按问题内容提问并截图：node scripts/ask_shot.mjs <url> <tag> <问题>
import puppeteer from 'puppeteer-core';
import path from 'node:path';
import fs from 'node:fs';

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const OUT = path.resolve('shots');
fs.mkdirSync(OUT, { recursive: true });
const url = process.argv[2] || 'http://127.0.0.1:5188/';
const tag = process.argv[3] || 'ask';
const question = process.argv[4] || '租房押金不退怎么办';

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'new',
  args: ['--disable-gpu', '--no-sandbox', '--hide-scrollbars'],
});
const page = await browser.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
await sleep(1500);

await page.click('#input');
await page.type('#input', question, { delay: 8 });
await page.keyboard.press('Enter');
await page.waitForFunction(() => {
  const body = document.querySelector('.msg.ai:last-of-type .ai-body');
  return !!body && !body.dataset.streaming && !body.querySelector('.typing');
}, { timeout: 20000, polling: 100 });
await sleep(400);

const summary = await page.evaluate(() => {
  const body = document.querySelector('.msg.ai:last-of-type .ai-body') || document.querySelector('.msg.ai .ai-body');
  return {
    meta: body?.querySelector('.ai-meta')?.textContent?.trim(),
    points: [...document.querySelectorAll('.ans-point')].map((e) => e.textContent.trim()),
    title: body?.querySelector('.ans-lead')?.textContent?.trim(),
    body: [...document.querySelectorAll('.msg.ai .ans-p')].map((e) => e.textContent.trim()),
    secs: [...document.querySelectorAll('.msg.ai .ans-sec-h')].map((e) => e.textContent.trim()),
    steps: [...document.querySelectorAll('.msg.ai .steps li')].map((e) => e.textContent.trim()),
    nums: [...document.querySelectorAll('.msg.ai .num')].map((e) => e.textContent.replace(/\s+/g, ' ').trim()),
    guide: [...document.querySelectorAll('.msg.ai .guide-title')].map((e) => e.textContent.trim()),
    next: document.querySelector('.msg.ai .guide-next')?.textContent?.trim(),
  };
});
console.log(JSON.stringify(summary, null, 1));

const h = await page.evaluate(() => {
  const t = document.querySelector('#thread');
  t.scrollTop = t.scrollHeight;
  return t.scrollHeight;
});
await page.setViewport({ width: 390, height: Math.max(844, Math.min(h + 140, 3000)), deviceScaleFactor: 2, isMobile: true, hasTouch: true });
await sleep(400);
await page.screenshot({ path: path.join(OUT, `${tag}.png`) });

console.log('errors:', errors.length ? errors : 'none');
await browser.close();

function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }
