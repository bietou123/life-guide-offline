// 离线检查回答结构：node scripts/answer_preview.mjs [问题...]
import { readFileSync } from 'node:fs';
import { setData } from '../src/search.js';
import { answerQuestion } from '../src/answer.js';

const items = JSON.parse(readFileSync(new URL('../public/data/items.json', import.meta.url), 'utf8'));
const index = JSON.parse(readFileSync(new URL('../public/data/index.json', import.meta.url), 'utf8'));
setData(items, index);

const DEFAULT = [
  '租房押金不退怎么办',
  '公司不给加班费怎么办',
  '被裁员了怎么拿赔偿',
  '借条怎么写才有法律效力',
  '失眠怎么调整',
  '体检发现结节要紧吗',
  '被诈骗了怎么办',
  '没钱了怎么活下去',
  '老人摔倒了怎么办',
  '手机被盗刷怎么办',
  '孩子发烧怎么办',
  '和邻居闹矛盾怎么办',
];

const questions = process.argv.slice(2).length ? process.argv.slice(2) : DEFAULT;
const mode = process.env.MODE || 'fast';

for (const q of questions) {
  const a = answerQuestion(q, mode);
  console.log(`\n=== ${q}`);
  if (!a.found) { console.log('  (未命中)', a.lead); continue; }
  if (a.kind === 'guide') {
    console.log(`  [指南] ${a.lead}`);
    for (const p of a.points) console.log(`  · ${p.item.ch}.${p.item.num} ${p.item.t}\n    ${p.summary}`);
    continue;
  }
  console.log(`  [直接] ${a.item.ch}.${a.item.num} ${a.action}  (${a.item.grade})`);
  if (a.point) console.log(`  结论: ${a.point}`);
  if (a.lead) console.log(`  正文: ${a.lead}`);
  a.steps.forEach((s, i) => console.log(`  步${i + 1}: ${s}`));
  if (!a.steps.length) console.log('  步: ——');
  console.log(`  数: ${a.numbers.map((n) => n.v).join(' / ') || '——'}`);
  console.log(`  依据: ${a.benefit.slice(0, 70)}`);
}
