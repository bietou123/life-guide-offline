// 中英文界面自检：node scripts/i18n_check.mjs
import puppeteer from 'puppeteer-core';
import path from 'node:path';

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const url = process.argv[2] || 'http://127.0.0.1:5201/';

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'new',
  args: ['--disable-gpu', '--no-sandbox', '--hide-scrollbars'],
});
const page = await browser.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
await page.setViewport({ width: 430, height: 900, deviceScaleFactor: 2, isMobile: true, hasTouch: true });

async function ready() {
  await page.waitForFunction(() => !document.querySelector('#app').hidden, { timeout: 20000 });
  await new Promise((r) => setTimeout(r, 400));
}

await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
await ready();

const zh = await page.evaluate(() => ({
  lang: document.documentElement.lang,
  title: document.querySelector('.welcome-title').textContent,
  lucky: document.querySelector('.lucky-text').textContent,
  placeholder: document.querySelector('#input').placeholder,
  sug: document.querySelector('.sug-text')?.textContent,
  docTitle: document.title,
}));
console.log('ZH', JSON.stringify(zh));

// 抽屉里切到英文
await page.click('#btn-menu');
await page.waitForFunction(() => !document.querySelector('#drawer').hidden, { timeout: 5000 });
const drawer = await page.evaluate(() => ({
  langLabel: document.querySelector('.lang-label').textContent,
  chips: [...document.querySelectorAll('.lang-chip')].map((c) => `${c.textContent}${c.classList.contains('is-on') ? '*' : ''}`),
  reader: document.querySelector('#btn-open-reader span').textContent,
  chapters: document.querySelector('#drawer-chapters').textContent,
}));
console.log('DRAWER-ZH', JSON.stringify(drawer));

await Promise.all([
  page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 30000 }),
  page.click('.lang-chip[data-lang="en"]'),
]);
await ready();

const en = await page.evaluate(() => ({
  lang: document.documentElement.lang,
  title: document.querySelector('.welcome-title').textContent,
  sub: document.querySelector('.welcome-sub').innerText.replace(/\n/g, ' | '),
  lucky: document.querySelector('.lucky-text').textContent,
  chips: [...document.querySelectorAll('.mode-chip')].map((c) => c.textContent),
  placeholder: document.querySelector('#input').placeholder,
  sug: [...document.querySelectorAll('.sug-text')].map((n) => n.textContent),
  hint: document.querySelector('.mode-hint').textContent,
  pref: localStorage.getItem('life-guide-lang-v1'),
  docTitle: document.title,
}));
console.log('EN', JSON.stringify(en));

await page.screenshot({ path: path.resolve('shots/store/07-welcome-en.png') });

// 英文提问 → 应能映射到中文原文
await page.click('#input');
await page.type('#input', 'My landlord will not return my rent deposit', { delay: 5 });
await page.waitForFunction(() => !document.querySelector('#btn-send').disabled, { timeout: 5000 });
await page.click('#btn-send');
await page.waitForFunction(() => {
  const body = document.querySelector('.msg.ai:last-of-type .ai-body');
  return !!body && !body.dataset.streaming && !body.querySelector('.typing');
}, { timeout: 30000, polling: 100 });

const answer = await page.evaluate(() => ({
  bubble: document.querySelector('.msg.user .bubble-user')?.textContent,
  meta: document.querySelector('.msg.ai:last-of-type .ai-meta')?.innerText.replace(/\n/g, ' '),
  lead: document.querySelector('.msg.ai:last-of-type .ans-lead')?.textContent.slice(0, 70),
  points: document.querySelectorAll('.msg.ai:last-of-type .guide-point').length,
  steps: document.querySelectorAll('.msg.ai:last-of-type .steps li').length,
  sections: [...document.querySelectorAll('.msg.ai:last-of-type .ans-sec-h')].map((n) => n.textContent),
  actions: [...document.querySelectorAll('.msg.ai:last-of-type .act-btn span')].map((n) => n.textContent),
}));
console.log('EN-ANSWER', JSON.stringify(answer));

await page.screenshot({ path: path.resolve('shots/store/08-answer-en.png') });

// 恢复跟随系统，避免影响后续手动使用
await page.evaluate(() => document.querySelector('.lang-chip[data-lang="system"]').click());
await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 30000 });

console.log('errors:', errors.length ? errors : 'none');
await browser.close();
