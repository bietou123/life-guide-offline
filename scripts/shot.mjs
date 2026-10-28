// 截图与布局自检：node scripts/shot.mjs [url] [name]
import puppeteer from 'puppeteer-core';
import path from 'node:path';
import fs from 'node:fs';

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const OUT = path.resolve('shots');
fs.mkdirSync(OUT, { recursive: true });

const url = process.argv[2] || 'http://127.0.0.1:5188/';
const name = process.argv[3] || 'shot';
const full = process.argv.includes('--full');

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'new',
  args: ['--disable-gpu', '--no-sandbox', '--hide-scrollbars'],
});
const page = await browser.newPage();
await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
await new Promise((r) => setTimeout(r, 1200));

// 布局自检
const diag = await page.evaluate(() => {
  const r = (sel) => {
    const el = document.querySelector(sel);
    if (!el) return null;
    const b = el.getBoundingClientRect();
    return { w: Math.round(b.width), l: Math.round(b.left), r: Math.round(b.right) };
  };
  return {
    vw: window.innerWidth,
    docW: document.documentElement.scrollWidth,
    bodyW: document.body.scrollWidth,
    app: r('#app'),
    thread: r('.thread'),
    grid: r('.suggest-grid'),
    card: r('.suggest-card'),
    composer: r('.composer'),
    overflow: [...document.querySelectorAll('*')]
      .filter((e) => e.getBoundingClientRect().right > window.innerWidth + 1)
      .slice(0, 6)
      .map((e) => e.className || e.tagName),
  };
});
console.log(JSON.stringify(diag, null, 1));

if (process.argv.includes('--top')) {
  await page.evaluate(() => {
    document.querySelector('.thread')?.scrollTo(0, 0);
    document.querySelector('.reader-body')?.scrollTo(0, 0);
  });
  await new Promise((r) => setTimeout(r, 400));
}

await page.screenshot({ path: path.join(OUT, `${name}.png`), fullPage: full });
await browser.close();
console.log('saved', path.join(OUT, `${name}.png`));
