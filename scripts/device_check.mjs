// 通过 CDP 直连手机 WebView，检查渲染状态
import puppeteer from 'puppeteer-core';
import path from 'node:path';

const port = Number(process.argv[2] || 9333);
const tag = process.argv[3] || 'dev';

const browser = await puppeteer.connect({ browserURL: `http://127.0.0.1:${port}`, defaultViewport: null });
const pages = await browser.pages();
const page = pages.find((p) => p.url().includes('localhost')) || pages[0];

const errors = [];
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));

const info = await page.evaluate(() => ({
  url: location.href,
  title: document.title,
  appHidden: document.querySelector('#app')?.hidden,
  cards: document.querySelectorAll('.suggest-card').length,
  bootVisible: !!document.querySelector('.boot') && getComputedStyle(document.querySelector('.boot')).display !== 'none',
  itemsReady: typeof window.__ready !== 'undefined',
  bodyText: document.body.innerText.slice(0, 120),
  w: innerWidth,
  h: innerHeight,
}));
const withShot = process.argv.includes('--shot');
const shot = async (name) => {
  if (!withShot) return;
  try { await page.screenshot({ path: path.resolve('shots', name) }); }
  catch (e) { console.log('screenshot skipped:', e.message.split('\n')[0]); }
};

console.log(JSON.stringify(info, null, 1));
await shot(`${tag}-0.png`);

await page.evaluate(() => document.querySelector('.suggest-card')?.click());
await new Promise((r) => setTimeout(r, 1600));
const answer = await page.evaluate(() => ({
  lead: document.querySelector('.ans-lead')?.textContent?.trim(),
  meta: document.querySelector('.msg.ai .ai-meta')?.textContent?.trim(),
  sections: [...document.querySelectorAll('.ans-sec-h')].map((e) => e.textContent.trim()),
  bodyLen: document.querySelector('.msg.ai .ai-body')?.innerText?.length,
}));
console.log(JSON.stringify(answer, null, 1));
await shot(`${tag}-1.png`);

console.log('console errors:', errors.length ? errors : 'none');
browser.disconnect();
