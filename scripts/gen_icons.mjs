// 生成 Android 启动图标（黑底白星），输出到 res/mipmap-*
import puppeteer from 'puppeteer-core';
import fs from 'node:fs';
import path from 'node:path';

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const RES = path.resolve('android/app/src/main/res');
const STAR = 'M32 4 40.6 23.4 60 32 40.6 40.6 32 60 23.4 40.6 4 32 23.4 23.4Z';

const page_html = ({ size, bg, starScale }) => {
  const s = starScale;
  return `<!doctype html><html><head><meta charset="utf-8"><style>
    html,body{margin:0;width:${size}px;height:${size}px;background:transparent}
    .box{position:relative;width:${size}px;height:${size}px;background:${bg};
         border-radius:${bg === '#000' ? 0 : 0}px;display:grid;place-items:center}
    svg{width:${s * 100}%;height:${s * 100}%;display:block}
  </style></head><body><div class="box">
    <svg viewBox="0 0 64 64"><path d="${STAR}" fill="#fff"/></svg>
  </div></body></html>`;
};

const legacy = { mdpi: 48, hdpi: 72, xhdpi: 96, xxhdpi: 144, xxxhdpi: 192 };
const adaptive = { mdpi: 108, hdpi: 162, xhdpi: 216, xxhdpi: 324, xxxhdpi: 432 };

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'new',
  args: ['--disable-gpu', '--no-sandbox', '--force-device-scale-factor=1'],
});
const page = await browser.newPage();

async function render(size, bg, starScale, file) {
  await page.setViewport({ width: size, height: size, deviceScaleFactor: 1 });
  await page.setContent(page_html({ size, bg, starScale }), { waitUntil: 'load' });
  await page.screenshot({ path: file, omitBackground: true, clip: { x: 0, y: 0, width: size, height: size } });
}

for (const [dens, size] of Object.entries(legacy)) {
  const dir = path.join(RES, `mipmap-${dens}`);
  fs.mkdirSync(dir, { recursive: true });
  await render(size, '#000', 0.62, path.join(dir, 'ic_launcher.png'));
  await render(size, '#000', 0.62, path.join(dir, 'ic_launcher_round.png'));
}

for (const [dens, size] of Object.entries(adaptive)) {
  const dir = path.join(RES, `mipmap-${dens}`);
  fs.mkdirSync(dir, { recursive: true });
  // 自适应图标前景只占中间 66/108 安全区
  await render(size, '#000000', 0.42, path.join(dir, 'ic_launcher_foreground.png'));
}

await browser.close();
console.log('icons written');
