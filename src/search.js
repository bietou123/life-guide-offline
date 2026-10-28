// 本地检索：bigram BM25 + 领域同义词扩展 + 标题重排

const K1 = 1.45;
const B = 0.72;

let ITEMS = [];
let IDX = null;
let CH = null;
let ready = false;

export const getItems = () => ITEMS;
export const isReady = () => ready;

export async function loadData() {
  const [items, idx] = await Promise.all([
    fetch('data/items.json').then((r) => r.json()),
    fetch('data/index.json').then((r) => r.json()),
  ]);
  ITEMS = items;
  IDX = idx;
  buildChapterIndex();
  ready = true;
}

export function setData(items, idx) {
  ITEMS = items;
  IDX = idx;
  buildChapterIndex();
  ready = true;
}

// 章节级索引：34 个文档，用于把问题先定位到章，再在章内排序
function buildChapterIndex() {
  const docs = new Map();
  for (const it of ITEMS) {
    let d = docs.get(it.ch);
    if (!d) {
      d = { tf: new Map(), len: 0, title: it.chT };
      docs.set(it.ch, d);
    }
    const toks = tokenize(`${it.chT} ${it.chT} ${it.t}`);
    for (const t of toks) d.tf.set(t, (d.tf.get(t) || 0) + 1);
    d.len += toks.length;
  }
  const df = new Map();
  let total = 0;
  for (const [, d] of docs) {
    total += d.len;
    for (const t of d.tf.keys()) df.set(t, (df.get(t) || 0) + 1);
  }
  CH = { docs, df, N: docs.size, avg: total / Math.max(1, docs.size) };
}

function scoreChapters(qtokens) {
  const out = new Map();
  let max = 0;
  for (const [ch, d] of CH.docs) {
    let s = 0;
    for (const t of qtokens) {
      const tf = d.tf.get(t);
      if (!tf) continue;
      const df = CH.df.get(t) || 1;
      const idf = Math.log(1 + (CH.N - df + 0.5) / (df + 0.5));
      s += idf * ((tf * (K1 + 1)) / (tf + K1 * (1 - B + (B * d.len) / CH.avg)));
    }
    if (s > 0) {
      out.set(ch, s);
      if (s > max) max = s;
    }
  }
  if (max > 0) for (const [k, v] of out) out.set(k, v / max);
  return out;
}

/* ---------- 分词（与构建脚本一致） ---------- */
export function tokenize(text) {
  const s = (text || '').normalize('NFKC').toLowerCase();
  const out = [];
  const re = /[一-鿿]+|[a-z0-9]+(?:\.[0-9]+)?/g;
  let m;
  while ((m = re.exec(s))) {
    const seg = m[0];
    if (/^[a-z0-9]/.test(seg)) {
      if (seg.length > 1) out.push(seg);
    } else if (seg.length === 1) {
      out.push(seg);
    } else {
      for (let i = 0; i < seg.length - 1; i++) out.push(seg.slice(i, i + 2));
    }
  }
  return out;
}

/* ---------- 停用词 / 口语映射 ---------- */
const STOP = [
  '请问', '帮我', '我想', '我要', '我的', '我想问', '问一下', '咨询一下',
  '能不能', '可不可以', '是不是', '有没有', '要不要', '会不会', '该不该',
  '应该怎么办', '怎么办', '怎么做', '怎么样', '怎么弄', '如何是好',
  '你好', '谢谢', '麻烦了', '一下', '一些', '什么', '哪些', '哪个',
];

// 口语 → 原文用词。domain 为强相关章节，命中会小幅加权。
const EXPANSIONS = [
  { re: /被开|炒鱿鱼|被炒|裁员|被裁|辞退|被辞|优化掉|失业|解除合同|n\+1|赔偿金|经济补偿/, add: '辞退 解除劳动合同 经济补偿 赔偿金 劳动仲裁', domain: [19] },
  { re: /欠薪|拖欠|不发工资|不给工资|扣工资|加班费|工资条|克扣/, add: '工资 拖欠 加班费 劳动监察 仲裁', domain: [19] },
  { re: /社保|五险一金|医保|养老保险|工伤险|失业保险|公积金/, add: '社会保险 社保 医保 养老 缴费 补缴', domain: [19, 24] },
  { re: /工伤|上班受伤|干活受伤|职业病|尘肺|上下班路上|工亡/, add: '工伤认定 劳动能力鉴定 职业病 工伤保险 工亡', domain: [19] },
  { re: /试用期|转正|劳动合同|签合同|不签合同|双倍工资/, add: '试用期 书面劳动合同 双倍工资 无固定期限', domain: [19] },
  { re: /劳动仲裁|仲裁|打官司|起诉|告公司|维权/, add: '劳动仲裁 仲裁时效 证据 劳动监察 起诉', domain: [19, 9] },
  { re: /租房|租房子|房租|房东|中介|押金|二房东|合租|退租|转租|租约|租房合同/, add: '押金 房东 中介 租赁合同 违约金 退租 租金', domain: [15] },
  { re: /买房|首付|房贷|公摊|烂尾|预售|网签|公积金贷款/, add: '首付 贷款 公摊 预售 网签 定金 备案', domain: [15] },
  { re: /看病|挂号|门诊|住院|报销|医保卡|体检|检查|手术/, add: '挂号 门诊 住院 医保 报销 病历 处方', domain: [24] },
  { re: /生病|确诊|慢性病|高血压|糖尿病|癌症|肾病|长期吃药/, add: '慢性病 门诊 医保 长期用药 复查 病历', domain: [16, 24] },
  { re: /吃药|用药|药物|副作用|说明书|抗生素|止痛药|保健品/, add: '处方药 说明书 相互作用 肝肾 剂量 禁忌', domain: [34] },
  { re: /老人|爸妈|父母|养老|赡养|护理|失能|独居老人/, add: '养老 赡养 护理 跌倒 就医 遗嘱 监护', domain: [17] },
  { re: /去世|死了|身故|遗产|丧葬|后事|抚恤|公证|遗嘱/, add: '死亡 遗产 继承 丧葬 抚恤金 公证 注销', domain: [25] },
  { re: /被骗|诈骗|骗子|转账|刷单|杀猪盘|冒充|钓鱼/, add: '诈骗 报警 转账 冻结 止付 110', domain: [13, 8, 14] },
  { re: /车祸|交通事故|撞车|撞人|被撞|剐蹭/, add: '交通事故 交警 保险 责任认定 急救 120', domain: [13] },
  { re: /火灾|着火|起火|燃气泄漏|触电|溺水|窒息|中毒/, add: '火灾 逃生 急救 心肺复苏 120 119', domain: [13] },
  { re: /打架|被打|被人打|家暴|施暴|斗殴|伤人/, add: '报警 伤情鉴定 故意伤害 赔偿 110 家暴', domain: [13, 9] },
  { re: /借钱|欠钱|不还钱|借条|欠条|催债|老赖|诉讼时效/, add: '借条 欠条 诉讼时效 起诉 强制执行', domain: [8, 9] },
  { re: /合同|签协议|条款|违约|定金|订金/, add: '合同 条款 违约责任 定金 签字 效力', domain: [9, 15] },
  { re: /创业|开店|开个店|开个小店|摆摊|小生意|做生意|做买卖|铺子|个体户|营业执照|公司注册|税务|营业执照/, add: '营业执照 个体户 税务 注册资本 合伙 债务 经营', domain: [12] },
  { re: /网站|平台|app|小程序|备案|icp|上架/, add: '备案 ICP 许可 网站 平台 内容审核 合规', domain: [26] },
  { re: /程序员|开发|外包|代码|开源|竞业|技术人/, add: '程序员 竞业限制 劳动合同 加班 知识产权', domain: [11, 19] },
  { re: /出国|旅游|旅行|护照|签证|境外|海关|航班/, add: '护照 签证 保险 使馆 境外 安全 海关', domain: [21] },
  { re: /留学|出国读书|申请学校|雅思|托福/, add: '留学 签证 学校 中介 学费 保险', domain: [32] },
  { re: /结婚|彩礼|婚前|离婚|婚内|婚姻|领证/, add: '彩礼 婚前财产 离婚 婚姻 财产 协议', domain: [10] },
  { re: /恋爱|谈恋爱|相亲|分手|对象/, add: '恋爱 结婚 财产 分手 转账 赠与', domain: [10] },
  { re: /怀孕|产检|生孩子|分娩|流产|月子/, add: '怀孕 产检 生育保险 产假 分娩 建档', domain: [27] },
  { re: /孩子|宝宝|婴儿|新生儿|育儿|幼儿园|上学|学区|疫苗|户口/, add: '新生儿 疫苗 户口 幼儿园 学区 托管 抚养', domain: [18, 20, 30] },
  { re: /高考|志愿|上大学|中考|升学|专业选择/, add: '高考 志愿 专业 升学 学校 分数', domain: [30, 31] },
  { re: /学什么|技能|转行|培训|考证|学历|自考/, add: '技能 培训 证书 学历 转行 就业', domain: [23, 31] },
  { re: /焦虑|抑郁|崩溃|心理|情绪|压力大|想不开|绝望/, add: '心理 抑郁 求助 情绪 睡眠 热线', domain: [29, 22] },
  { re: /失眠|熬夜|作息|睡眠不足|累|疲劳/, add: '睡眠 作息 熬夜 疲劳 休息', domain: [4, 22] },
  { re: /减肥|节食|健身|体重|身材|整容|医美/, add: '体重 节食 运动 医美 手术风险', domain: [28] },
  { re: /密码|被盗号|账号|信息泄露|二次验证|隐私/, add: '密码 二次验证 账号 泄露 钓鱼 手机号', domain: [14] },
  { re: /省钱|花钱|消费|买贵|分期|信用卡|网贷|花呗/, add: '消费 分期 利息 借贷 信用卡 陷阱', domain: [5, 7] },
  { re: /没钱|缺钱|穷|负债|还不上|破产/, add: '负债 借钱 收入 支出 省钱 破产', domain: [7] },
  { re: /保险|投保|理赔|重疾险|医疗险/, add: '保险 理赔 条款 免责 保费', domain: [5, 16] },
  { re: /残疾|伤残|残障|失能|轮椅/, add: '残疾 伤残 鉴定 补贴 康复 无障碍', domain: [33] },
  { re: /继承|遗嘱|分家产|公证/, add: '继承 遗嘱 公证 遗产 法定继承', domain: [25] },
  { re: /吸毒|赌博|赌|酗酒|成瘾/, add: '成瘾 赌博 毒品 酒精 违法', domain: [8, 9] },
  { re: /体检|筛查|疫苗|打针|预防/, add: '体检 筛查 疫苗 预防 早发现', domain: [2] },
  { re: /安全|危险|保命|救命|急救/, add: '急救 危险 安全 120 逃生', domain: [1, 2, 13] },
  { re: /放松|休息|娱乐|玩|解压|冥想/, add: '放松 休息 娱乐 睡眠 散步', domain: [22] },
  { re: /时间管理|效率|拖延|专注/, add: '时间 精力 专注 拖延 效率', domain: [3, 4] },
  { re: /精力|疲惫|透支|内耗/, add: '精力 疲劳 内耗 休息 睡眠', domain: [3] },
];

function cleanQuestion(q) {
  let s = q;
  for (const w of STOP) s = s.split(w).join(' ');
  s = s.replace(/[？?！!。，,、；;：:"'“”‘’（）()【】\[\]]/g, ' ');
  return s.trim();
}

/* ---------- BM25 ---------- */
function scoreTerms(terms, baseScore) {
  const N = IDX.N;
  const avgdl = IDX.avgdl;
  const post = IDX.post;
  const lens = IDX.len;
  const scores = new Float64Array(N);
  const hitTitle = new Uint8Array(N);

  for (const [term, boost] of terms) {
    const plist = post[term];
    if (!plist) continue;
    const df = plist.length;
    const idf = Math.log(1 + (N - df + 0.5) / (df + 0.5));
    for (let k = 0; k < plist.length; k++) {
      const docId = plist[k][0];
      const tf = plist[k][1];
      const dl = lens[docId];
      const denom = tf + K1 * (1 - B + (B * dl) / avgdl);
      scores[docId] += boost * idf * ((tf * (K1 + 1)) / denom);
    }
  }
  return scores;
}

function termMap(text, boost) {
  const map = new Map();
  for (const t of tokenize(text)) {
    map.set(t, Math.max(map.get(t) || 0, boost));
  }
  return map;
}

/**
 * @param {string} question 用户问题
 * @param {object} opts { context: 上一轮问题, topK }
 * @returns {{items: Array, top: number, domains: number[]}}
 */
// 同领域里互斥的分支：问了左边，右边就不是这个问题的答案
const CONFLICTS = [
  [/租房|租约|房租|房东|押金/, /买房|新房|开发商|楼盘|交房|首付|房贷|公摊|预售|网签/],
  [/离婚/, /彩礼|结婚登记|婚礼/],
  [/被裁|辞退|被开除|失业/, /试用期|入职|招聘|求职|面试/],
];

function conflictPenalty(q, item) {
  const txt = item.t + ' ' + item.plain.slice(0, 80);
  for (const [a, b] of CONFLICTS) {
    if (a.test(q) && !b.test(q) && b.test(txt) && !a.test(txt)) return 0.5;
  }
  return 1;
}

export function search(question, opts = {}) {
  const ctx = opts.context || '';
  const topK = opts.topK || 24;

  const core = cleanQuestion(question);
  const terms = termMap(core, 1.0);

  // 同义词扩展
  const domains = new Map();
  const extra = new Map();
  for (const rule of EXPANSIONS) {
    if (rule.re.test(question)) {
      for (const t of tokenize(rule.add)) {
        if (!terms.has(t)) extra.set(t, Math.max(extra.get(t) || 0, 0.8));
      }
      if (rule.domain) for (const d of rule.domain) domains.set(d, (domains.get(d) || 0) + 1);
    }
  }
  // 上下文（追问）低权重
  if (ctx) {
    for (const t of tokenize(cleanQuestion(ctx))) {
      if (!terms.has(t) && !extra.has(t)) extra.set(t, Math.max(extra.get(t) || 0, 0.3));
    }
  }

  const all = new Map([...extra, ...terms]);
  let scores = scoreTerms(all, 0);

  // 章节级定位 + 领域加权重排
  const N = IDX.N;
  const qtokens = [...new Set(tokenize(core))];
  const qset = new Set(qtokens);
  const chScores = scoreChapters(qtokens);

  // 查询词的 IDF（区分度高的词权重更大，如「租房」压过「合同」）
  const idfOf = (t) => {
    const pl = IDX.post[t];
    const df = pl ? pl.length : 0;
    return Math.log(1 + (N - df + 0.5) / (df + 0.5));
  };
  const qidf = new Map();
  let qidfSum = 0;
  for (const t of qset) {
    const v = idfOf(t);
    qidf.set(t, v);
    qidfSum += v;
  }

  const ranked = [];
  let maxRaw = 0;
  for (let i = 0; i < N; i++) if (scores[i] > maxRaw) maxRaw = scores[i];

  for (let i = 0; i < N; i++) {
    let s = scores[i];
    if (s <= 0) continue;
    const it = ITEMS[i];

    const chS = chScores.get(it.ch) || 0;
    const dh = domains.get(it.ch) || 0;

    let factor = 1;
    factor += 0.62 * Math.pow(chS, 1.6);
    factor += 0.35 * Math.min(dh, 2);

    // 标题加权覆盖
    const tt = new Set(tokenize(it.t));
    let hitW = 0;
    for (const t of qset) if (tt.has(t)) hitW += qidf.get(t);
    factor += 0.6 * (hitW / qidfSum || 0);

    // 全文加权覆盖（抑制长篇大论者占便宜）
    const ds = new Set(tokenize(it.t + ' ' + it.plain));
    let covW = 0;
    for (const t of qset) if (ds.has(t)) covW += qidf.get(t);
    const covR = covW / (qidfSum || 1);
    factor += 1.1 * covR * covR;

    // 极弱匹配的条目不要被章节加成抬上来
    if (s < maxRaw * 0.06) factor = Math.min(factor, 1.2);

    if (it.grade === 'A') factor += 0.02;

    factor *= conflictPenalty(question, it);

    s *= factor;
    ranked.push([i, s]);
  }
  ranked.sort((a, b) => b[1] - a[1]);

  // 同章限流
  const perCh = new Map();
  const out = [];
  for (const [i, s] of ranked) {
    const ch = ITEMS[i].ch;
    const c = perCh.get(ch) || 0;
    if (c >= 4) continue;
    perCh.set(ch, c + 1);
    out.push({ item: ITEMS[i], score: s });
    if (out.length >= topK) break;
  }

  return { items: out, top: out.length ? out[0].score : 0, domains: [...domains.keys()] };
}

// 全文关键词高亮用的简单匹配
export function textScore(q) {
  return search(q, { topK: 8 });
}
