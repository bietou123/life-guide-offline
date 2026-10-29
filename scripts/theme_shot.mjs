// 双主题截图与对比度检查：node scripts/theme_shot.mjs
import puppeteer from 'puppeteer-core';
import path from 'node:path';
import fs from 'node:fs';

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const OUT = path.resolve('shots');
fs.mkdirSync(OUT, { recursive: true });
const url = process.argv[2] || 'http://127.0.0.1:5201/';

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'new',
  args: ['--disable-gpu', '--no-sandbox', '--hide-scrollbars'],
});

async function shot(scheme) {
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  await page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: scheme }]);
  await page.evaluateOnNewDocument(() => { try { localStorage.clear(); } catch { /* blank origin */ } });
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
  await new Promise((r) => setTimeout(r, 900));
  const probe = await page.evaluate(() => {
    const css = getComputedStyle(document.documentElement);
    const val = (name) => css.getPropertyValue(name).trim();
    const pick = (sel) => {
      const node = document.querySelector(sel);
      if (!node) return null;
      const s = getComputedStyle(node);
      return { color: s.color, bg: s.backgroundColor };
    };
    return {
      scheme: CSS.supports('color-scheme', 'light dark'),
      bg: val('--bg'), ink: val('--ink'),
      body: pick('body'), lucky: pick('.lucky-btn'), chip: pick('.lucky-chip'),
      composer: pick('.composer'), card: pick('.suggest-card'),
    };
  });
  console.log(scheme, JSON.stringify(probe));
  await page.screenshot({ path: path.join(OUT, `theme-${scheme}-welcome.png`) });

  // 点随机按钮，验证抽签动画与流式回答
  await page.click('#btn-lucky');
  const spun = await page.evaluate(() => document.querySelector('#btn-lucky').classList.contains('is-shuffling'));
  await page.waitForFunction(() => {
    const body = document.querySelector('.msg.ai:last-of-type .ai-body');
    return !!body && !body.dataset.streaming && !body.querySelector('.typing');
  }, { timeout: 20000, polling: 100 });
  const info = await page.evaluate((spun) => ({
    anim: spun,
    q: document.querySelector('.msg.user .bubble-user')?.textContent.trim().slice(0, 40),
    lead: document.querySelector('.msg.ai .ans-lead')?.textContent.trim().slice(0, 60),
  }), spun);
  console.log(scheme, JSON.stringify(info));
  await new Promise((r) => setTimeout(r, 400));
  const h = await page.evaluate(() => {
    const t = document.querySelector('#thread');
    t.scrollTop = t.scrollHeight;
    return t.scrollHeight;
  });
  await page.setViewport({ width: 390, height: Math.max(844, Math.min(h + 140, 3000)), deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await new Promise((r) => setTimeout(r, 350));
  await page.screenshot({ path: path.join(OUT, `theme-${scheme}-answer.png`) });
  console.log(scheme, 'errors:', errors.length ? errors : 'none');
  await page.close();
}

await shot('light');
await shot('dark');
await browser.close();
