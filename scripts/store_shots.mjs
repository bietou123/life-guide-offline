// Google Play 手机截图：node scripts/store_shots.mjs
import puppeteer from 'puppeteer-core';
import path from 'node:path';
import fs from 'node:fs';

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const OUT = path.resolve('shots/store');
const url = process.argv[2] || 'http://127.0.0.1:5201/';
fs.mkdirSync(OUT, { recursive: true });

// 540x960 @2x = 1080x1920
const VIEW = { width: 540, height: 960, deviceScaleFactor: 2, isMobile: true, hasTouch: true };
const QUESTION = '被裁员了，赔偿该怎么算？';
const QUESTION_LIGHT = '长期失眠怎么调整？';

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'new',
  args: ['--disable-gpu', '--no-sandbox', '--hide-scrollbars'],
});

async function open(scheme) {
  const page = await browser.newPage();
  await page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: scheme }]);
  await page.evaluateOnNewDocument(() => { try { localStorage.clear(); } catch { /* blank origin */ } });
  await page.setViewport(VIEW);
  await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
  await page.evaluate(() => document.fonts?.ready);
  await new Promise((r) => setTimeout(r, 900));
  return page;
}

async function ask(page, mode = 'fast', question = QUESTION) {
  if (mode === 'deep') {
    await page.click('[data-mode="deep"]');
    await new Promise((r) => setTimeout(r, 200));
  }
  await page.click('#input');
  await page.type('#input', question, { delay: 6 });
  await page.waitForFunction(() => !document.querySelector('#btn-send').disabled, { timeout: 5000 });
  await page.click('#btn-send');
  await page.waitForFunction(() => {
    const body = document.querySelector('.msg.ai:last-of-type .ai-body');
    return !!body && !body.dataset.streaming && !body.querySelector('.typing');
  }, { timeout: 30000, polling: 100 });
  await new Promise((r) => setTimeout(r, 500));
  // 把这条回答顶到可视区上方，露出标题和正文开头
  await page.evaluate(() => {
    const thread = document.querySelector('#thread');
    const ai = document.querySelector('.msg.ai:last-of-type');
    thread.scrollTop = Math.max(0, ai.offsetTop - 74);
  });
  await new Promise((r) => setTimeout(r, 350));
}

const shots = [];

// 01 浅色首页
{
  const page = await open('light');
  await page.screenshot({ path: path.join(OUT, '01-welcome-light.png') });
  shots.push('01-welcome-light');
  await page.close();
}

// 02 深色首页
{
  const page = await open('dark');
  await page.screenshot({ path: path.join(OUT, '02-welcome-dark.png') });
  shots.push('02-welcome-dark');
  await page.close();
}

// 03 深色问答
{
  const page = await open('dark');
  await ask(page);
  await page.screenshot({ path: path.join(OUT, '03-answer-dark.png') });
  shots.push('03-answer-dark');
  await page.close();
}

// 04 浅色问答
{
  const page = await open('light');
  await ask(page, 'fast', QUESTION_LIGHT);
  await page.screenshot({ path: path.join(OUT, '04-answer-light.png') });
  shots.push('04-answer-light');
  await page.close();
}

// 05 浅色原文目录
{
  const page = await open('light');
  await page.click('#btn-attach');
  await page.waitForSelector('.ch-card', { timeout: 8000 });
  await new Promise((r) => setTimeout(r, 400));
  await page.screenshot({ path: path.join(OUT, '05-reader-light.png') });
  shots.push('05-reader-light');
  await page.close();
}

// 06 深色原文正文
{
  const page = await open('dark');
  await page.click('#btn-attach');
  await page.waitForSelector('.ch-card', { timeout: 8000 });
  await page.click('.ch-card');
  await page.waitForSelector('.chapter-read', { timeout: 5000 });
  await page.click('.chapter-read');
  await page.waitForSelector('.reader-body .md-body', { timeout: 8000 });
  await new Promise((r) => setTimeout(r, 500));
  await page.evaluate(() => { const b = document.querySelector('#reader-body'); b.scrollTop = 0; });
  await page.screenshot({ path: path.join(OUT, '06-chapter-dark.png') });
  shots.push('06-chapter-dark');
  await page.close();
}

await browser.close();
console.log('done:', shots.join(', '));
for (const name of shots) {
  const { size } = fs.statSync(path.join(OUT, `${name}.png`));
  console.log(`${name}.png ${(size / 1024).toFixed(0)} KB`);
}
