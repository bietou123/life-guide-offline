import { getItems, search, tokenize, termDf } from './search.js';
import { findGuide } from './guides.js';
import { t } from './i18n.js';

function excerpt(value, max = 190) {
  const text = (value || '').trim();
  if (text.length <= max) return text;
  const head = text.slice(0, max);
  const end = Math.max(head.lastIndexOf('。'), head.lastIndexOf('；'), head.lastIndexOf('！'));
  return end >= max * 0.5 ? head.slice(0, end + 1) : `${head.trimEnd()}…`;
}

/* ---------- 从原文里抽「能照着做的事」 ---------- */

const ACT_STRONG = /(提交|申请|准备|保留|保存|截图|拍照|录音|复印|备份|留存|签署|签订|填写|携带|核对|确认|咨询|联系|预约|缴纳|缴费|办理|登记|备案|公证|投诉|举报|报警|起诉|仲裁|鉴定|索赔|领取|开具|索要|收集|整理|记录|拍下|录下|记下|写下|找律师|找公司|找单位|打电话)/;
const ACT_WEAK = /[去找打写签留存拍截备填交报查问催拒带核办录]/;
const CMD_START = /^(先|再|然后|接着|之后|别|不要|记得|一定|务必|必须|把|去|找|打|写|签|留|存|拍|截|备|填|交|申请|提交|投诉|起诉|鉴定|办理|登记|查|问|催|拒|报警|拍照|录音|复印|保存|备份|联系|咨询|预约|缴纳|缴费|建档|备案|公证|仲裁|举报|索要|开具|领取|准备|带|核对|确认|优先|尽量|第一件事|马上|立刻|当天|平时|遇到|发现)/;
const BAD_START = /^(难在|是不是|会不会|什么|怎么算|如何|可能|如果|因为|所以|但|不过|其实|这意味着|这说明|要知道|一般来说|通常|大多数|有的人|有些|很多|大部分|少数|其中|被|同一页|原文|本书|另外|还列)/;
const VAGUE = /(要看|取决于|视.{0,8}而定|不一定|根据具体情况|因人而异)/;
const DESCRIPTIVE = /(按.+给|属于|是指|分为|包括|有以下|作为一种|在.{0,12}情况下)/;
const CMD_MARK = /(先|再|然后|接着|别|不要|记得|必须|务必|一定|最好|应该|需要|就去|赶紧|尽快|马上)/;

function splitSentences(text) {
  if (!text) return [];
  return text
    .replace(/([。！？；])/g, '$1\n')
    .split('\n')
    .map((s) => s.trim())
    .filter((s) => s.length > 6);
}

function similar(a, b) {
  const A = new Set(a);
  const B = new Set(b);
  let inter = 0;
  for (const c of A) if (B.has(c)) inter++;
  return inter / Math.max(1, Math.min(A.size, B.size));
}

function overlaps(a, b) {
  if (!a || !b) return false;
  return similar(a, b) > 0.55 || a.includes(b) || b.includes(a);
}

// 动作句优先按原文先后顺序取，正文在前、费用和注意事项在后
function pickSteps(item, max = 5, avoid = '') {
  const pool = [
    ...splitSentences(item.plain).map((s) => [s, 0]),
    ...splitSentences(item.cost).map((s) => [s, 1]),
    ...splitSentences(item.note).map((s) => [s, 1]),
  ];

  const out = [];
  for (const [raw, loose] of pool) {
    // 「……，见第 12 节第 5 条。」这种交叉引用不是要做的事
    const s = raw.replace(/[，,；;]?\s*见第\s*[\d一二三四五六七八九十百]+\s*[节条][^。]{0,24}。?$/, '').trim();
    if (s.length < 11 || s.length > 82) continue;
    if (BAD_START.test(s)) continue;
    if (overlaps(s, item.t) || overlaps(s, avoid)) continue;
    const isCmd = CMD_START.test(s);
    const strong = ACT_STRONG.test(s);
    if (s !== raw && !isCmd && !strong) continue;
    if (/^再看第\s*\d+\s*条/.test(s)) continue;
    if (VAGUE.test(s) && !isCmd) continue;
    if (DESCRIPTIVE.test(s) && !isCmd) continue;

    const hasWeak = ACT_WEAK.test(s);
    // 正文句必须是明确的动作，费用和注意事项里的实操句条件放宽
    if (!loose && !isCmd && !strong) continue;
    let score = 0;
    if (isCmd) score += 3;
    if (strong) score += 2;
    if (hasWeak) score += 1;
    if (CMD_MARK.test(s)) score += 1;
    if (score < 2) continue;

    if (out.some((o) => overlaps(o, s))) continue;
    out.push(s);
    if (out.length >= max) break;
  }
  return out;
}

/* ---------- 从原文里抽「关键数字」 ---------- */

const NUM_RE = /\d+(?:\.\d+)?\s*(?:[-~至到]\s*\d+(?:\.\d+)?\s*)?(?:倍|%|天|日|个月|月|小时|分钟|万元|元|个工作日|工作日|次|份|级|档)/g;
const CN_NUM_RE = /[一二三四五六七八九十百千万两半]+\s*(?:个)?(?:倍|天|日|个月|月|年|小时|分钟|工作日|万元|元|次|份|级|档|周)/g;
const CN_NOISE = /^(一|两)(个|些|种|般|定|直|起|样|部分|方面|切|共|系列)/;
const CN_YEAR = /^[一二三四五六七八九〇零十]{4}年$/;
const UNIT_RANK = [
  [/(倍|万元|元)$/, 5],
  [/(个月|工作日|月|年|天|日|小时|分钟|周)$/, 4],
  [/(%|级|档)$/, 3],
  [/(次|份)$/, 1],
];

const CN_DIGIT = { 一: '1', 二: '2', 两: '2', 三: '3', 四: '4', 五: '5', 六: '6', 七: '7', 八: '8', 九: '9', 十: '10', 百: '100' };
const numKey = (v) => v.replace(/[一二两三四五六七八九十百]/g, (c) => CN_DIGIT[c]).replace(/\s+/g, '');

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
    if (/档$/.test(m[0])) continue;
    // 「第二天」「第一次」是序数，不是时长和次数
    if (txt[m.index - 1] === '第') continue;
    hits.push({ at: m.index, v: m[0] });
  }

  const sentOf = (idx) => {
    let s = idx;
    let e = idx;
    while (s > 0 && !/[。；！？\n]/.test(txt[s - 1])) s--;
    while (e < txt.length && !/[。；！？\n]/.test(txt[e])) e++;
    return { s, e };
  };

  const titleEnd = item.t.length;
  const ANECDOTE = /(案例|判例|判决|索赔|报道|新闻|采访)/;
  const bySent = new Map();
  for (const { at, v: raw } of hits) {
    const v = raw.replace(/\s+/g, '');
    if (/^(19|20)\d{2}年$/.test(v)) continue;
    if (/^([一二三四五六七八九十百千万两半]+|\d+(?:\.\d+)?)月$/.test(v)
      && /年\s*$/.test(txt.slice(Math.max(0, at - 7), at))) continue;
    if (/^[一二三四五六七八九十百千万两半]+(?:次|份|级|档)$/.test(v)) continue;
    // 标题里的数字排在最前，但不再重复一遍标题当说明
    const inTitle = at < titleEnd;
    const { s, e } = sentOf(at);
    if (!inTitle && ANECDOTE.test(txt.slice(s, e))) continue;
    const key = inTitle ? `T:${at}` : `${s}:${e}`;
    let rank = 0;
    for (const [re, r] of UNIT_RANK) if (re.test(v)) { rank = r; break; }
    if (inTitle) rank += 6;
    const prev = bySent.get(key);
    if (!prev || rank > prev.rank) bySent.set(key, { rank, at, v, s, e, inTitle });
  }

  const ranked = [...bySent.values()].sort((a, b) => b.rank - a.rank || a.at - b.at);
  const found = [];
  const seen = new Set();
  let titleCount = 0;
  let bodyCount = 0;
  for (const { v, at, s, e, inTitle } of ranked) {
    const key = numKey(v);
    if (seen.has(key)) continue;
    if (inTitle ? titleCount >= 3 : bodyCount >= 3) continue;
    seen.add(key);
    if (inTitle) {
      titleCount++;
      found.push({ v, ctx: '' });
      continue;
    }
    bodyCount++;
    const ws = Math.max(s, at - 20);
    const we = Math.min(e, at + 22);
    const head = ws > s ? '…' : '';
    const tail = we < e ? '…' : '';
    found.push({ v, ctx: `${head}${txt.slice(ws, we).replace(/\s+/g, ' ').trim()}${tail}` });
  }
  return found;
}

// 一句话结论：优先用原文里最短的定性判断，退回到正文首句
function pickPoint(item, avoid = '') {
  const cands = splitSentences(item.plain)
    .filter((s) => s.length >= 10 && s.length <= 60)
    .filter((s) => !overlaps(s, avoid));
  const judge = cands.find((s) => /(就是|相当于|等于|一律|必须|不得|应当|可以要求|按.{0,6}算|属于)/.test(s));
  return judge || cands[0] || '';
}

export function isFollowUp(question) {
  return question.trim().length <= 24 &&
    /^(那|这|如果|然后|接下来|具体|还有|要多久|多少钱|怎么做|怎么办|费用|风险|多久|下一步|需要|要准备)/.test(question.trim());
}

export function answerQuestion(question, mode = 'fast', previousQuestion = '') {
  const followUp = previousQuestion && isFollowUp(question);
  const query = followUp ? `${previousQuestion} ${question}` : question;
  if (/幼儿园|入园|幼小衔接/.test(query)
    && /报名|材料|手续|体检|准备|幼小衔接/.test(query)
    && !/屏幕|看电视|户外|近视|视力|牙齿|蛀牙|窝沟/.test(query)) {
    return {
      found: false,
      lead: t('ans.kgLead'),
      detail: t('ans.kgDetail'),
      related: [],
    };
  }
  const guided = findGuide(query, getItems());
  if (guided) {
    const { guide, refs } = guided;
    return {
      found: true,
      kind: 'guide',
      guideId: guide.id,
      item: refs[0],
      lead: t(`guide.${guide.id}`),
      action: refs[0].t,
      points: refs.map((item) => ({
        item,
        summary: excerpt(item.plain, mode === 'deep' ? 185 : 100),
        cost: mode === 'deep' ? excerpt(item.cost, 105) : '',
        caution: mode === 'deep' ? excerpt(item.note, 130) : '',
      })),
      askNext: t(`guide.${guide.id}.next`),
      related: refs.slice(1),
    };
  }

  let results = search(query, { context: followUp ? '' : previousQuestion, topK: 12 });
  // Short follow-ups often have no topic words of their own.
  if (results.top < 22 && previousQuestion && /那|然后|接下来|具体|怎么办|多少钱|风险|怎么做/.test(question)) {
    results = search(`${previousQuestion} ${question}`, { topK: 12 });
  }

  const core = question.replace(/是什么|是啥|怎么办|怎么|什么|应该|可以|请问|帮我|一下|发现|要紧|调整|改进|解决|多少|好吗|好不好|[吗呢？?！!。，,、；;：]/g, ' ').trim();
  const keywords = [...new Set(tokenize(core))];
  const specificTopics = core.split(/\s+/).filter((part) => part.length >= 2);
  const corpusN = getItems().length;
  const idfOf = (t) => {
    const df = termDf(t);
    return Math.log(1 + (corpusN - df + 0.5) / (df + 0.5));
  };
  const keywordIdf = new Map(keywords.map((word) => [word, idfOf(word)]));
  const idfTotal = keywords.reduce((sum, word) => sum + keywordIdf.get(word), 0) || 1;
  const matches = results.items.map((result) => {
    const title = new Set(tokenize(result.item.t));
    const summary = new Set(tokenize(`${result.item.t} ${result.item.plain}`));
    const inTitle = keywords.filter((word) => title.has(word)).length;
    // 泛词（商家、孩子）命中再多也说明不了主题，按 IDF 加权
    const covered = keywords.filter((word) => summary.has(word));
    const coverage = covered.reduce((sum, word) => sum + keywordIdf.get(word), 0) / idfTotal;
    return { ...result, inTitle, coverage, rank: result.score * (1 + 0.35 * coverage + 0.2 * inTitle) };
  }).filter((result) => {
    const inDomain = results.domains.includes(result.item.ch);
    return result.score >= Math.max(inDomain ? 12 : 22, results.top * 0.55)
      && (result.inTitle > 0 || result.coverage >= 0.65 || inDomain);
  });
  matches.sort((a, b) => b.rank - a.rank);
  const domainMatch = matches.find(({ item, score }) =>
    results.domains.includes(item.ch) && score >= results.top * 0.75
  );
  const directMatch = matches.find(({ inTitle, score }) =>
    inTitle > 0 && score >= results.top * 0.7
  );
  const winner = directMatch && (!domainMatch || directMatch.rank >= domainMatch.rank * 0.8)
    ? directMatch
    : domainMatch && !results.domains.includes(matches[0]?.item.ch) ? domainMatch : matches[0];
  const primaryText = winner ? `${winner.item.t} ${winner.item.plain}` : '';
  // A domain hint alone cannot answer an unrelated specific topic, e.g. a nodule found at a checkup.
  const hasUncoveredTopic = results.top < 50 && specificTopics.length >= 2
    && specificTopics.every((part) => part.length === 2)
    && specificTopics.some((part) => !primaryText.includes(part));
  const domainEvidence = winner && results.domains.includes(winner.item.ch) && winner.score >= 12;
  const subject = specificTopics[0] && tokenize(specificTopics[0])[0];
  const subjectCovered = !subject || new Set(tokenize(primaryText)).has(subject);
  const textualEvidence = winner && winner.score >= 22 &&
    subjectCovered && (winner.coverage >= 0.5 || winner.inTitle > 0);
  if ((!domainEvidence && !textualEvidence) || hasUncoveredTopic) {
    return {
      found: false,
      lead: t('ans.noneLead'),
      detail: t('ans.noneDetail'),
      related: [],
    };
  }

  let primary = winner.item;
  if (/押金/.test(question) && /房东|房租|租房|退租/.test(question)
    && /不退|不还|被扣|乱扣|退还|扣了|纠纷/.test(question)) {
    primary = getItems().find((item) => item.ch === 15 && item.num === 1) || primary;
  }
  if (/借钱不还|欠钱不还|欠款不还|借出去的钱.*不还/.test(question)
    && !/我借.*不还|我欠.*不还|还不起|还不上|无力偿还/.test(question)) {
    primary = getItems().find((item) => item.ch === 8 && item.num === 19) || primary;
  }
  // A general dismissal question does not establish the unlawful-termination condition for 2N.
  if (primary.ch === 19 && /被裁|裁员|被辞退|被公司.{0,5}辞退|被开除/.test(question)
    && !/违法|非法|无故|无理由|2n|二倍|双倍/i.test(question)) {
    primary = getItems().find((item) => item.ch === 19 && item.num === 4) || primary;
  }
  const related = results.items.filter(({ item, score }) =>
    item.id !== primary.id && score >= results.top * 0.46 && item.ch === primary.ch
  ).slice(0, mode === 'deep' ? 3 : 2).map(({ item }) => item);

  const numbers = extractNumbers(primary);
  let point = pickPoint(primary);
  if (point && similar(point, primary.t) > 0.5) point = '';
  const steps = pickSteps(primary, mode === 'deep' ? 6 : 4, point);
  // 正文里去掉已经单独展示的标题句、结论句和动作句，避免同一句话出现三遍
  const kept = splitSentences(primary.plain)
    .filter((s) => !overlaps(s, primary.t))
    .filter((s) => !point || !overlaps(s, point))
    .filter((s) => !steps.some((step) => overlaps(step, s)))
    .join('');
  let lead = excerpt(kept, mode === 'deep' ? 300 : 190);
  if (lead && (similar(lead, primary.t) > 0.75 || lead.includes(primary.t))) lead = '';

  // 依据只留还没在前面出现过的句子，否则就是把结论再念一遍；第一句是这条的权威结论，始终保留
  const basis = splitSentences(primary.gain)
    .filter((s, i) => i === 0
      || (!overlaps(s, primary.t)
        && (!point || !overlaps(s, point))
        && (!lead || !overlaps(s, lead))
        && !steps.some((step) => overlaps(step, s))))
    .join('');

  return {
    found: true,
    kind: 'direct',
    item: primary,
    mode,
    point,
    lead,
    action: primary.t,
    steps,
    numbers,
    cost: excerpt(primary.cost, mode === 'deep' ? 280 : 150),
    benefit: excerpt(basis || primary.gain, mode === 'deep' ? 290 : 170),
    caution: mode === 'deep' ? excerpt(primary.note, 270) : '',
    related,
  };
}
