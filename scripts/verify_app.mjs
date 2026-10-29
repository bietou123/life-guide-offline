import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import puppeteer from 'puppeteer-core';

const url = process.argv[2] || 'http://127.0.0.1:5199/';
const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: true,
  args: ['--no-sandbox'],
});
const shots = path.resolve('shots');
fs.mkdirSync(shots, { recursive: true });

try {
  for (const viewport of [{ width: 390, height: 844 }, { width: 1280, height: 800 }]) {
    const context = await browser.createBrowserContext();
    const page = await context.newPage();
    await page.setViewport({ ...viewport, deviceScaleFactor: 1, isMobile: viewport.width < 500 });
    const errors = [];
    const remoteRequests = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('request', (request) => {
      if (!request.url().startsWith(new URL(url).origin) && !request.url().startsWith('data:')) {
        remoteRequests.push(request.url());
      }
    });
    await page.goto(url, { waitUntil: 'networkidle0' });
    await page.waitForSelector('#app:not([hidden])');
    assert.equal(await page.$eval('#welcome', (node) => node.hidden), false);
    assert.equal(remoteRequests.length, 0, `Offline start requested: ${remoteRequests}`);

    await page.click('[data-mode="deep"]');
    await page.type('#input', '被裁员了，赔偿该怎么算？');
    await page.click('#btn-send');
    await page.waitForSelector('.msg.ai .ans-lead');
    await page.waitForFunction(() => {
      const body = document.querySelector('.msg.ai .ai-body');
      return body && !body.hasAttribute('data-streaming') && !body.querySelector('.stream-wait, .stream-typing');
    });
    assert.match(await page.$eval('.msg.ai .ans-lead', (node) => node.textContent), /被裁|补偿|辞退/);
    await page.click('.source-details summary');
    assert.ok(await page.$('.source-details[open] .src-link[href^="http"]'), 'Original citation link is missing');
    await page.click('.guide-point .ref-link');
    await page.waitForSelector('#screen-reader.is-active .entry-heading');
    const position = await page.evaluate(() => {
      const body = document.querySelector('#reader-body').getBoundingClientRect();
      const heading = document.querySelector('.entry-heading[id]')?.getBoundingClientRect();
      const selected = [...document.querySelectorAll('.entry-heading')].find((node) => {
        const r = node.getBoundingClientRect();
        return r.top >= body.top - 2 && r.top <= body.bottom;
      });
      return { bodyTop: body.top, firstTop: heading?.top, selectedId: selected?.id };
    });
    assert.ok(position.selectedId, 'Reader did not show an original entry');

    await page.click('#btn-reader-back');
    await page.waitForSelector('#screen-chat.is-active');
    await page.click('#btn-new');
    await page.type('#input', '租房押金不退怎么办？');
    await page.click('#btn-send');
    await page.click('#btn-menu');
    await page.click('#btn-open-history');
    assert.ok((await page.$$('.history-entry')).length >= 2, 'Conversation history was not saved');
    await page.click('.history-row:last-child .history-entry');
    assert.match(await page.$eval('.msg.user .bubble-user', (node) => node.textContent), /被裁员/);
    await page.reload({ waitUntil: 'networkidle0' });
    await page.waitForSelector('.msg.user .bubble-user');
    assert.match(await page.$eval('.msg.user .bubble-user', (node) => node.textContent), /被裁员|押金/);

    const size = await page.evaluate(() => ({
      viewport: innerWidth,
      document: document.documentElement.scrollWidth,
      inputVisible: !!document.querySelector('#composer')?.getClientRects().length,
    }));
    assert.ok(size.document <= size.viewport + 1, `Horizontal overflow: ${JSON.stringify(size)}`);
    assert.ok(size.inputVisible, 'Composer is missing');
    assert.deepEqual(errors, [], `Browser errors: ${errors.join('; ')}`);
    await page.screenshot({ path: path.join(shots, `verify-${viewport.width}.png`) });
    console.log(`OK ${viewport.width}x${viewport.height}: offline chat, citation, reader, history, layout`);
    await context.close();
  }
} finally {
  await browser.close();
}
