// 答案生成：意图识别 + 原文抽取 + 结构化组织（全部本地规则，无模型调用）

const SMALLTALK = [
  { re: /^(你好|嗨|hi|hello|在吗|在不在)[!！。.~～\s]*$/i, reply: '在。想了解什么？可以直接问，比如「被辞退了该拿多少钱」「租房押金不退怎么办」。' },
  { re: /^(你是谁|你是什么|介绍下?你自己|你是干嘛的)/, reply: '我是「指南」——一个完全离线的生活决策助手。\n\n我的全部知识来自开源项目《高性价比人生指南》的 34 章、767 条实证建议，每条都标了证据等级和原始出处。我不联网、不调用任何模型，答案都是原文里抽出来并按结构重组的。' },
  { re: /^(你能做什么|你会什么|有什么功能|怎么用|帮助|help)/i, reply: '你可以问我：\n\n· 具体处境怎么办——「公司不给加班费」「租房押金不退」「刚被裁了」\n· 划不划算——「要不要考公」「养孩子花多少钱」\n· 具体数字——「工伤十级赔多少」「试用期最长多久」\n\n回答会给出：结论、要做的事、关键数字、证据等级和原文出处。想看全文点左上角菜单里的「阅读原文全文」。' },
  { re: /^(谢谢|感谢|多谢|thx|thanks)/i, reply: '不客气。还有想问的直接说。' },
  { re: /^(再见|拜拜|bye)/i, reply: '好，需要的时候再来。' },
  { re: /^(随便|随便来一条|来点啥|有什么推荐)/, special: 'random' },
];

const ACT_STRONG = /(提交|申请|准备|保留|保存|截图|拍照|录音|复印|备份|留存|签署|签订|填写|携带|核对|确认|咨询|联系|预约|缴纳|缴费|办理|登记|备案|公证|投诉|举报|报警|起诉|仲裁|鉴定|索赔|领取|开具|索要|收集|整理|记录|去医院|去银行|去法院|去社保|去公司|去派出所|去劳动|找律师|找公司|找单位|打电话|打 120|打 110)/;
const ACT_WEAK = /[去找打写签留存拍截备填交报查问要催拒带核办留录]/;
const NEG_ACTION = /(第[一二三四五六七八九十百零\d]+条|条例|办法|规定|通知|解释|批复|复函|见第)/;

const NUM_RE = /\d+(?:\.\d+)?\s*(?:[-~至到]\s*\d+(?:\.\d+)?\s*)?(?:倍|%|天|日|个月|月|小时|分钟|万元|元|个工作日|工作日|次|份|级|档)/g;
const CN_NUM_RE = /[一二三四五六七八九十百千万两半]+\s*(?:个)?(?:倍|天|日|个月|月|年|小时|分钟|工作日|万元|元|次|份|级|档|周)/g;
const CN_NOISE = /^(一|两)(个|些|种|般|定|直|起|样|部分|方面|切|共|系列)/;
const CN_YEAR = /^[一二三四五六七八九〇零十]{4}年$/;
// 单位的信息量：钱/倍数/期限优先，计数类靠后
const UNIT_RANK = [
  [/(倍|万元|元)$/, 5],
  [/(个月|工作日|月|年|天|日|小时|分钟|周)$/, 4],
  [/(%|级|档)$/, 3],
  [/(次|份)$/, 1],
];

const LISTY = /(注意|哪些|有什么|清单|都要|准备什么|注意什么|几件事|一共|怎么算|标准是什么|有哪些)/;
const ASK_AMOUNT = /(多少|几倍|几成|赔多少|能拿|拿多少|多少钱|费用|花多少|标准)/;
const ASK_LEGAL = /(违法|合法|能不能|可以吗|能不能拒|有权|应该吗|算不算)/;
const ASK_DEADLINE = /(多久|期限|时效|什么时候|几号|过期|多长时间)/;
const ASK_RISK = /(坑|风险|注意什么|陷阱|会上当|危险|骗)/;
const ASK_WHO = /(找谁|哪个部门|去哪|打什么电话|投诉到|在哪里办)/;

/* ---------- 句子工具 ---------- */
function splitSentences(text) {
  if (!text) return [];
  return text
    .replace(/([。！？；])/g, '$1\n')
    .split('\n')
    .map((s) => s.trim())
    .filter((s) => s.length > 6);
}

const CMD_START = /^(先|再|然后|接着|之后|别|不要|记得|一定|务必|必须|把|去|找|打|写|签|留|存|拍|截|备|填|交|申请|提交|投诉|起诉|鉴定|办理|登记|查|问|催|拒|报警|拍照|录音|复印|保存|备份|联系|咨询|预约|缴纳|缴费|建档|备案|公证|仲裁|举报|索要|开具|领取|准备|带|核对|确认|优先|尽量|第一件事|马上|立刻|当天|平时|遇到|发现)/;
const BAD_START = /^(难在|是不是|会不会|什么|怎么算|如何|可能|如果|因为|所以|但|不过|其实|这意味着|这说明|要知道|一般来说|通常|大多数|有的人|有些|很多|大部分|少数|其中|被)/;
const VAGUE = /(要看|取决于|视.{0,8}而定|不一定|根据具体情况|因人而异)/;
const DESCRIPTIVE = /(按.+给|属于|是指|分为|包括|有以下|作为一种|在.{0,12}情况下)/;
const CMD_MARK = /(先|再|然后|接着|别|不要|记得|必须|务必|一定|最好|应该|需要|要|就去|赶紧|尽快|马上)/;

function similar(a, b) {
  const A = new Set(a);
  const B = new Set(b);
  let inter = 0;
  for (const c of A) if (B.has(c)) inter++;
  return inter / Math.max(1, Math.min(A.size, B.size));
}

function pickSteps(item, max = 5) {
  // 只从「成本 / 说人话 / 备注」抽动作；「收益」是法条原文，留给依据模块
  const pool = [];
  for (const s of splitSentences(item.cost)) pool.push(s);
  for (const s of splitSentences(item.plain)) pool.push(s);
  for (const s of splitSentences(item.note)) pool.push(s);

  const strong = [];
  const mid = [];
  const weak = [];
  for (const s of pool) {
    if (s.length < 11 || s.length > 82) continue;
    if (NEG_ACTION.test(s) && s.length > 55) continue;
    if (BAD_START.test(s)) continue;
    if (VAGUE.test(s) && !CMD_START.test(s)) continue;
    if (DESCRIPTIVE.test(s) && !CMD_START.test(s)) continue;
    // 结论已经单独展示了，别再重复一遍
    if (similar(s, item.t) > 0.6) continue;

    const isCmd = CMD_START.test(s);
    const hasStrong = ACT_STRONG.test(s);
    const hasWeak = ACT_WEAK.test(s);
    const hasMark = CMD_MARK.test(s);

    if (isCmd && (hasStrong || hasWeak)) strong.push(s);
    else if (hasMark && hasStrong) mid.push(s);
    else if (hasMark && hasWeak) weak.push(s);
  }

  const out = [];
  const push = (s) => {
    if (out.length >= max) return;
    if (out.some((o) => similar(o, s) > 0.6)) return;
    out.push(s);
  };
  strong.forEach(push);
  if (out.length < 3) mid.forEach(push);
  if (out.length < 3) weak.forEach(push);
  return out;
}

function extractNumbers(item) {
  const txt = `${item.t}。${item.gain}`;
  const hits = [];
  let m;
  NUM_RE.lastIndex = 0;
  while ((m = NUM_RE.exec(txt))) hits.push({ at: m.index, v: m[0] });
  CN_NUM_RE.lastIndex = 0;
  while ((m = CN_NUM_RE.exec(txt))) {
    if (CN_NOISE.test(m[0])) continue;
    if (CN_YEAR.test(m[0].replace(/\s+/g, ''))) continue;
    hits.push({ at: m.index, v: m[0] });
  }
  hits.sort((a, b) => a.at - b.at);

  // 同一句里只留信息量最大的那个
  const sentOf = (idx) => {
    let s = idx;
    let e = idx;
    while (s > 0 && !/[。；！？\n]/.test(txt[s - 1])) s--;
    while (e < txt.length && !/[。；！？\n]/.test(txt[e])) e++;
    return { s, e };
  };

  const bySent = new Map();
  for (const { at, v: raw } of hits) {
    const v = raw.replace(/\s+/g, '');
    if (/^(19|20)\d{2}年$/.test(v)) continue;
    const { s, e } = sentOf(at);
    const key = `${s}:${e}`;
    let rank = 0;
    for (const [re, r] of UNIT_RANK) if (re.test(v)) { rank = r; break; }
    const prev = bySent.get(key);
    if (!prev || rank > prev.rank) bySent.set(key, { rank, at, v, s, e });
  }
  const ranked = [...bySent.values()];
  ranked.sort((a, b) => b.rank - a.rank || a.at - b.at);

  const found = [];
  const seen = new Set();
  for (const { v, at, s, e } of ranked) {
    if (found.length >= 4) break;
    if (seen.has(v)) continue;
    seen.add(v);
    const ws = Math.max(s, at - 16);
    const we = Math.min(e, at + 18);
    found.push({ v, ctx: clipPlain(txt.slice(ws, we), 44) });
  }
  return found;
}

function clipPlain(text, max) {
  const t = text.replace(/\s+/g, ' ').trim();
  return t.length <= max ? t : `${t.slice(0, max)}…`;
}

function shortTitle(t, max = 46) {
  if (t.length <= max) return t;
  const cut = t.slice(0, max);
  const p = Math.max(cut.lastIndexOf('，'), cut.lastIndexOf('、'), cut.lastIndexOf('；'));
  if (p > max * 0.55) return cut.slice(0, p);
  return cut + '…';
}

function clip(text, max) {
  if (!text) return '';
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const p = Math.max(cut.lastIndexOf('。'), cut.lastIndexOf('；'), cut.lastIndexOf('，'));
  return (p > max * 0.5 ? cut.slice(0, p + 1) : cut + '…');
}

function coverage(question, item, tokenize) {
  const qs = new Set(tokenize(question.replace(/[？?！!。，,、；;：:"'“”‘’（）()【】\[\]\s]/g, ' ')));
  if (!qs.size) return 0;
  const ds = new Set(tokenize(item.t + ' ' + item.chT + ' ' + item.plain));
  let hit = 0;
  for (const t of qs) if (ds.has(t)) hit++;
  return hit / qs.size;
}

/* ---------- 主入口 ---------- */
export function analyze(question, res, opts = {}) {
  const { tokenize, mode = 'fast', items = [], history = [] } = opts;
  const q = question.trim();

  for (const s of SMALLTALK) {
    if (s.re.test(q)) {
      if (s.special === 'random') return { type: 'random' };
      return { type: 'smalltalk', text: s.reply };
    }
  }

  if (!res || !res.items.length) return notFound(q, items);

  const best = res.items[0];
  const cov = coverage(q, best.item, tokenize);
  if (cov < 0.18 && best.score < 3.2) return notFound(q, items);

  const listy = LISTY.test(q);
  const top = res.items.slice(0, mode === 'deep' ? 6 : 3);
  const isList = listy && top.length >= 2 && top[0].score > 0 && top[1].score / top[0].score > 0.42;

  return isList ? buildList(q, top, opts) : buildDetail(q, best.item, top, opts);
}

function notFound(q, allItems) {
  return { type: 'notfound', question: q };
}

function buildList(q, top, opts) {
  const main = top[0].item;
  const entries = top.map(({ item }) => ({
    item,
    one: shortOneLine(item),
  }));
  return {
    type: 'list',
    lead: `关于「${main.chT}」，原文里直接相关的有 ${entries.length} 条`,
    intro: clip(main.intro || main.plain, 130),
    entries,
    topic: main.chT,
    grade: main.grade,
    source: '',
    related: top.slice(0, 4).map(({ item }) => item),
    chapter: { num: main.ch, title: main.chT },
  };
}

function shortOneLine(item) {
  const s = splitSentences(item.plain).find((x) => x.length > 10) || item.t;
  return clip(s, 62);
}

function buildDetail(q, item, top, opts) {
  const { mode = 'fast' } = opts;
  const wantAmount = ASK_AMOUNT.test(q);
  const wantLegal = ASK_LEGAL.test(q);
  const wantDeadline = ASK_DEADLINE.test(q);
  const wantRisk = ASK_RISK.test(q);

  const steps = pickSteps(item, mode === 'deep' ? 6 : 4);
  const nums = extractNumbers(item);

  const sections = [];
  if (wantAmount && nums.length) sections.push({ kind: 'numbers', title: '关键数字', items: nums.slice(0, 5) });
  if (steps.length >= 2) sections.push({ kind: 'steps', title: wantLegal ? '具体规定和做法' : '可以这么做', items: steps });
  else if (item.cost) sections.push({ kind: 'tip', title: '要付出什么', text: clip(item.cost, 200) });
  if (!wantAmount && nums.length) sections.push({ kind: 'numbers', title: '关键数字', items: nums.slice(0, 4) });
  if (item.gain) sections.push({ kind: 'quote', title: '原文依据', text: clip(item.gain, 180) });
  if (wantDeadline && item.note) sections.push({ kind: 'tip', title: '时效和注意事项', text: clip(item.note, 200) });
  if (wantRisk && item.note && !wantDeadline) sections.push({ kind: 'tip', title: '要留意', text: clip(item.note, 180) });

  const related = top
    .slice(1)
    .filter(({ item: it }) => it.id !== item.id)
    .slice(0, mode === 'deep' ? 5 : 3)
    .map(({ item: it }) => it);

  // deep 模式：代价对比
  let compare = null;
  if (mode === 'deep' && top.length >= 3) {
    compare = top.slice(0, 5).map(({ item: it }) => ({
      t: shortTitle(it.t, 30),
      cost: it.cost ? clip(it.cost, 40) : '—',
      tag: it.tag || {},
    }));
  }

  return {
    type: 'detail',
    lead: item.t,
    intro: clip(item.plain, 320),
    sections,
    grade: item.grade || '—',
    source: item.src || '',
    note: item.note || '',
    cost: item.cost || '',
    related,
    compare,
    chapter: { num: item.ch, title: item.chT },
    item,
  };
}
