// 检索质量回归测试：node scripts/test_search.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const items = JSON.parse(fs.readFileSync(path.join(root, 'public/data/items.json'), 'utf8'));
const idx = JSON.parse(fs.readFileSync(path.join(root, 'public/data/index.json'), 'utf8'));

const { setData, search, tokenize } = await import(pathToFileURL(path.join(root, 'src/search.js')).href);
const { analyze } = await import(pathToFileURL(path.join(root, 'src/analyze.js')).href);
setData(items, idx);

const CASES = [
  ['被公司辞退了该拿多少钱', [19]],
  ['公司不给加班费怎么办', [19]],
  ['租房押金房东不退', [15]],
  ['上班路上被车撞算工伤吗', [19]],
  ['刚确诊糖尿病要做什么', [16, 24]],
  ['医院挂号看病流程', [24]],
  ['老人摔倒了怎么办', [13, 17]],
  ['家里人去世了要办哪些手续', [25]],
  ['被电信诈骗了钱能追回来吗', [8, 13]],
  ['借条怎么写才有法律效力', [8]],
  ['开个小店需要办什么证', [12]],
  ['网站上线要备案吗', [26]],
  ['出国旅游要注意什么', [21]],
  ['结婚彩礼能要回来吗', [10]],
  ['怀孕了要做哪些检查', [27]],
  ['孩子出生后要办哪些证', [20, 27]],
  ['学什么技能工资涨得快', [23]],
  ['减肥节食靠谱吗', [28]],
  ['手机账号被盗了怎么办', [14]],
  ['长期失眠怎么调整', [3, 22, 4]],
  ['体检发现结节要紧吗', [2, 24]],
  ['发烧了要不要吃抗生素', [34]],
  ['没钱了怎么活下去', [7]],
  ['被裁员后社保怎么办', [19]],
  ['试用期最长多久', [19]],
  ['离婚财产怎么分', [10]],
  ['交通事故对方全责怎么赔', [8, 13, 9]],
  ['租房子签合同要注意什么', [15]],
  ['大学选什么专业好', [23, 31, 30]],
  ['公司让我调岗降薪不同意', [19]],
];

let pass = 0;
for (const [q, expect] of CASES) {
  const res = search(q, { topK: 5 });
  const top = res.items[0];
  const chs = res.items.map((x) => x.item.ch);
  const hit = top && expect.includes(top.item.ch);
  if (hit) pass++;
  console.log(`${hit ? 'OK  ' : 'MISS'} ${q}`);
  if (!hit) {
    console.log(`     期望章节 ${expect.join('/')}  实际 top1=${top ? top.item.ch + ':' + top.item.t.slice(0, 40) : '无'}`);
  } else {
    console.log(`     → ${top.item.ch}.${top.item.num} ${top.item.t.slice(0, 46)}  (${top.score.toFixed(2)})`);
  }
  if (process.env.VERBOSE) {
    for (const r of res.items.slice(1, 4)) console.log(`       · ${r.item.ch}.${r.item.num} ${r.item.t.slice(0, 40)} ${r.score.toFixed(2)}`);
  }
}

console.log(`\n命中 ${pass}/${CASES.length} = ${((pass / CASES.length) * 100).toFixed(1)}%`);

// 抽查答案生成
console.log('\n===== 答案样本 =====');
for (const q of ['被公司辞退了该拿多少钱', '租房押金不退怎么办']) {
  const res = search(q, { topK: 12 });
  const a = analyze(q, res, { tokenize, mode: 'fast', items });
  console.log(`\nQ: ${q}\ntype=${a.type} grade=${a.grade}`);
  console.log('lead:', a.lead);
  console.log('intro:', (a.intro || '').slice(0, 90));
  for (const s of a.sections || []) console.log(` [${s.title}]`, (s.kind === 'steps' ? s.items.slice(0, 3).join(' | ') : s.kind === 'numbers' ? s.items.map((n) => n.v).join(',') : s.text).slice(0, 150));
  console.log(' related:', (a.related || []).map((r) => r.ch + '.' + r.num).join(' '));
}
