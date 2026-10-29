// 界面文案与英文提问映射。原文内容始终是中文，英文模式只翻译界面与回答骨架。
const PREF_KEY = 'life-guide-lang-v1';
const SYSTEM = 'system';

const STRINGS = {
  zh: {
    'app.title': '指南',
    'app.menu': '菜单',
    'app.new': '新对话',
    'boot.loading': '正在装载 767 条指南…',
    'boot.fail': '本地内容加载失败，请重新打开应用',
    'boot.retry': '重试',
    'welcome.title': '有什么想弄明白的？',
    'welcome.sub': '从《高性价比人生指南》767 条建议里找答案<br/>离线可用 · 可回到每条原文',
    'lucky.title': '随便来一条',
    'lucky.sub': '从 767 条建议里随机抽一条',
    'lucky.chip': '随便一条',
    'mode.label': '回答模式',
    'mode.fast': '检索',
    'mode.deep': '分析',
    'mode.hint': '完全离线',
    'composer.placeholder': '问点什么…',
    'composer.attach': '打开原文目录',
    'composer.send': '发送',
    'reader.back': '返回',
    'reader.title': '原文',
    'reader.search': '搜索原文',
    'reader.searchPh': '搜索原文内容…',
    'reader.all': '全部指南',
    'reader.chapter': '第 {n} 章',
    'reader.readChapter': '阅读本章全文',
    'reader.askThis': '问这一条',
    'reader.askThisValue': '关于「{t}」，我应该怎么做？',
    'search.hits': '找到 {n}{more} 条相关指南',
    'search.none': '没有匹配的条目，试试其他关键词',
    'catalog.title': '高性价比人生指南',
    'catalog.meta': '{chapters} 章 · {items} 条建议',
    'catalog.original': '原著 eternity4719',
    'catalog.adapted': '本地改编',
    'catalog.entries': '{n} 条指南',
    'drawer.sub': '离线实证生活决策助手',
    'drawer.reader': '原文与全部目录',
    'drawer.chapters': '{n} 章',
    'drawer.history': '历史对话',
    'drawer.random': '随便来一条',
    'drawer.clear': '清空本地记录',
    'drawer.lang': '语言',
    'drawer.langSystem': '跟随系统',
    'drawer.langZh': '中文',
    'foot.original': '原著',
    'foot.license': '原文',
    'foot.adapted': '本应用为改编 · 全部计算在本机完成',
    'foot.privacy': '隐私政策',
    'history.empty': '还没有对话记录',
    'history.delete': '删除这段对话',
    'history.deleteNamed': '删除对话：{t}',
    'history.confirm': '删除「{t}」？',
    'history.cleared': '本地对话已清空',
    'history.clearConfirm': '清空本机保存的所有对话？原文不会被删除。',
    'store.full': '本机存储空间不足，本次对话无法保存',
    'ans.who': '指南',
    'ans.metaGuide': '{n} 条原文 · {kind}',
    'ans.kindDeep': '分析',
    'ans.kindFast': '要点',
    'ans.metaDeepText': '基于原文的整理',
    'ans.metaFastText': '原文检索',
    'ans.browseAll': '浏览全部目录',
    'ans.costShort': '投入',
    'ans.boundShort': '边界',
    'ans.grade': '证据 {g}',
    'ans.gradeLong': '原文证据等级 {g}',
    'ans.sourceRef': '{ref} 原文',
    'ans.copySummary': '复制摘要',
    'ans.copied': '已复制',
    'ans.copyFail': '复制失败，请检查剪贴板权限',
    'ans.steps': '可以这么做',
    'ans.numbers': '关键数字',
    'ans.basis': '原文依据',
    'ans.cost': '要付出什么',
    'ans.caution': '注意与边界',
    'ans.related': '同章相关条目',
    'ans.relCh': '第 {n} 章 · {t}',
    'ans.readSource': '读这条原文',
    'ans.copy': '复制',
    'ans.sourceToggle': '原始出处与备注',
    'ans.note': '原文备注：{n}',
    'ans.sourceLabel': '原文：',
    'link.fail': '无法打开链接，请检查网络连接',
  },
  en: {
    'app.title': 'Life Guide',
    'app.menu': 'Menu',
    'app.new': 'New chat',
    'boot.loading': 'Loading 767 entries…',
    'boot.fail': 'Local content failed to load — please reopen the app',
    'boot.retry': 'Retry',
    'welcome.title': 'What do you want to figure out?',
    'welcome.sub': 'Answers drawn from 767 entries of “A High-Value Guide to Life”<br/>Works fully offline · The source text is Chinese',
    'lucky.title': 'Surprise me',
    'lucky.sub': 'Draw one entry at random from all 767',
    'lucky.chip': 'Random',
    'mode.label': 'Answer mode',
    'mode.fast': 'Look up',
    'mode.deep': 'Analyze',
    'mode.hint': 'Fully offline',
    'composer.placeholder': 'Ask anything…',
    'composer.attach': 'Open the original text',
    'composer.send': 'Send',
    'reader.back': 'Back',
    'reader.title': 'Text',
    'reader.search': 'Search the text',
    'reader.searchPh': 'Search the original text…',
    'reader.all': 'All entries',
    'reader.chapter': 'Chapter {n}',
    'reader.readChapter': 'Read the whole chapter',
    'reader.askThis': 'Ask about this',
    'reader.askThisValue': 'What should I do about “{t}”?',
    'search.hits': 'Found {n}{more} matching entries',
    'search.none': 'No matching entry — try other keywords',
    'catalog.title': 'A High-Value Guide to Life',
    'catalog.meta': '{chapters} chapters · {items} entries',
    'catalog.original': 'Original by eternity4719',
    'catalog.adapted': 'locally adapted',
    'catalog.entries': '{n} entries',
    'drawer.sub': 'An offline, evidence-based guide to life decisions',
    'drawer.reader': 'Original text and contents',
    'drawer.chapters': '{n} chapters',
    'drawer.history': 'History',
    'drawer.random': 'Surprise me',
    'drawer.clear': 'Clear local data',
    'drawer.lang': 'Language',
    'drawer.langSystem': 'System',
    'drawer.langZh': '中文',
    'foot.original': 'Original',
    'foot.license': 'Text',
    'foot.adapted': 'Adapted from the original · everything runs on this device',
    'foot.privacy': 'Privacy policy',
    'history.empty': 'No conversations yet',
    'history.delete': 'Delete this conversation',
    'history.deleteNamed': 'Delete conversation: {t}',
    'history.confirm': 'Delete “{t}”?',
    'history.cleared': 'Local conversations cleared',
    'history.clearConfirm': 'Clear all conversations saved on this device? The original text stays.',
    'store.full': 'Not enough local storage — this conversation was not saved',
    'ans.who': 'Guide',
    'ans.metaGuide': '{n} sources · {kind}',
    'ans.kindDeep': 'Analysis',
    'ans.kindFast': 'Key points',
    'ans.metaDeepText': 'Compiled from the Chinese original',
    'ans.metaFastText': 'Quoted from the Chinese original',
    'ans.browseAll': 'Browse all entries',
    'ans.costShort': 'Cost',
    'ans.boundShort': 'Limits',
    'ans.grade': 'Evidence {g}',
    'ans.gradeLong': 'Evidence grade {g}',
    'ans.sourceRef': 'Source {ref}',
    'ans.copySummary': 'Copy summary',
    'ans.copied': 'Copied',
    'ans.copyFail': 'Copy failed — check clipboard permission',
    'ans.steps': 'What you can do',
    'ans.numbers': 'Key numbers',
    'ans.basis': 'From the original text',
    'ans.cost': 'What it costs',
    'ans.caution': 'Cautions and limits',
    'ans.related': 'Related in this chapter',
    'ans.relCh': 'Chapter {n} · {t}',
    'ans.readSource': 'Read the source',
    'ans.copy': 'Copy',
    'ans.sourceToggle': 'Source and notes',
    'ans.note': 'Note: {n}',
    'ans.sourceLabel': 'Source: ',
    'link.fail': 'Could not open the link — check your connection',
  },
};

// 英文提问 → 中文问句。原文索引是中文的，关键词串过不了答案的门槛，所以映射成完整问句。
// 介词、助动词容易误伤（will / rent / rest / fire），能加词边界的一律加。
const TOPICS = [
  { re: /lay\s?off|laid off|redundan|fired|sacked|severance|n\s?\+?\s?1|pink slip/i, q: '被裁员了赔偿怎么算' },
  { re: /\bunpaid\b|\bwages?\b|\bsalary\b|overtime pay|paycheck|withheld/i, q: '公司拖欠工资和加班费怎么办' },
  { re: /quit smoking|stop smoking|smoking cessation|\bvape/i, q: '怎么戒烟' },
  { re: /\bquit\b|resign|notice period/i, q: '想辞职应该注意什么' },
  { re: /social insurance|pension|five insurances|housing fund|provident fund/i, q: '社保断缴有什么影响' },
  { re: /work injury|injured at work|occupational disease/i, q: '上班受伤怎么做工伤认定' },
  { re: /probation|employment contract|labou?r contract|double pay/i, q: '试用期不签劳动合同怎么办' },
  { re: /labou?r arbitration|sue (my|the) (boss|company|employer)|tribunal/i, q: '怎么申请劳动仲裁' },
  { re: /\brent\b|renting|rental|\bdeposit\b|landlord|\btenant\b|\blease\b|sublet|evict/i, q: '租房押金不退怎么办' },
  { re: /buy (a )?(house|apartment|flat)|mortgage|down payment|pre-?sale/i, q: '买房交首付要注意什么' },
  { re: /hospital|doctor|clinic|see a doctor|outpatient|medical (bill|insurance)/i, q: '去医院看病的流程是什么' },
  { re: /chronic|diagnos|long-?term medication/i, q: '慢性病长期吃药要注意什么' },
  { re: /medicine|medication|\bdrugs?\b|side effect|antibiotic|painkiller|supplement/i, q: '吃药前要看说明书哪些内容' },
  { re: /elderly|nursing home|care for (my )?(parents|mother|father)|bedridden/i, q: '老人独居要注意什么' },
  { re: /quit smoking|stop smoking|smoking cessation|\bvape/i, q: '怎么戒烟' },
  { re: /death|funeral|inherit|testament|last will|write (a )?will|cremation/i, q: '亲人去世后要办哪些手续' },
  { re: /scam|fraud|phishing|transferred money|pig butchering/i, q: '被诈骗了应该做什么' },
  { re: /car (accident|crash)|traffic accident|hit (me|by a car)|collision|\bbike\b/i, q: '交通事故责任认定' },
  { re: /\bfire\b|gas leak|drown|chok|poison|electric shock|first aid/i, q: '家里着火或有人溺水怎么急救逃生' },
  { re: /\bfight\b|assault|beaten|beats me|domestic violence|\babuse\b/i, q: '被人打了怎么办' },
  { re: /rumou?r|defam|slander|online abuse|harass|reputation/i, q: '被造谣诽谤怎么办' },
  { re: /drunk driv|drink.?driv|drink driving|\bDUI\b/i, q: '酒驾醉驾有什么后果' },
  { re: /quit smoking|stop smoking|smoking cessation|\bvape/i, q: '怎么戒烟' },
  { re: /refund|return (the )?(goods|item|product)|complaint|consumer rights|12315/i, q: '想退货退款商家不给怎么办' },
  { re: /\blend\b|borrow|\biou\b|debt collect|\bowe(s)? me\b|loan shark/i, q: '借条怎么写才有法律效力' },
  { re: /contract|sign(ed)? an agreement|breach of contract|earnest money/i, q: '签合同要注意哪些条款' },
  { re: /start (a )?(business|company|shop)|open(ing)? (a |an )?(\w+ )?(store|shop|business)|business licen|licen[cs]e for (a )?(shop|store)|self-?employ|\bstall\b/i, q: '想开个小店需要办什么证' },
  { re: /website|\bapps?\b|\bicp\b|filing|register (a )?domain|content review/i, q: '网站或小程序要不要备案' },
  { re: /programmer|developer|open source|non-?compete|software engineer|\bcode\b/i, q: '程序员跳槽要注意竞业限制吗' },
  { re: /abroad|travel|passport|\bvisa\b|overseas|\bflight|customs/i, q: '出国旅游要注意什么' },
  { re: /study abroad|university application|ielts|toefl|scholarship/i, q: '出国留学要准备什么' },
  { re: /marriage|marry|betrothal|bride price|prenup/i, q: '结婚前彩礼和财产要注意什么' },
  { re: /divorce|property split/i, q: '离婚财产怎么分' },
  { re: /dating|break ?up|girlfriend|boyfriend|\brelationship/i, q: '谈恋爱时的转账和礼物要注意什么' },
  { re: /pregnan|prenatal|give birth|childbirth|abortion|maternity/i, q: '怀孕了要做哪些产检' },
  { re: /\bbaby\b|newborn|infant|childcare/i, q: '孩子出生后要办哪些证' },
  { re: /vaccin|kindergarten/i, q: '孩子要打哪些疫苗' },
  { re: /\bschool\b|\bexam|college entrance|gaokao|major choice|tutor|education/i, q: '高考志愿怎么填' },
  { re: /learn (a )?skill|career change|switch career|\btraining\b|certificate|\bdegree\b/i, q: '想转行应该学什么技能' },
  { re: /anxiety|anxious|depress|mental health|panic|therapy|hopeless/i, q: '抑郁或焦虑了该怎么办' },
  { re: /insomnia|can'?t sleep|\bsleep\b|stay up late|fatigue|exhausted/i, q: '长期失眠怎么调整' },
  { re: /\bweight\b|\bdiet\b|fasting|fat loss|\bgym\b|exercise|cosmetic surgery|plastic surgery/i, q: '减肥节食要注意什么' },
  { re: /password|hacked|account security|privacy|data leak|two-?factor/i, q: '密码和账号怎么防泄露' },
  { re: /\bsav(e|ing|ings)\b|installment|credit card|online loan|\binterest\b/i, q: '省钱要注意哪些陷阱' },
  { re: /\bbroke\b|no money|in debt|bankrupt/i, q: '没钱了怎么活下去' },
  { re: /insurance|claim|coverage|policy/i, q: '买保险要注意什么' },
  { re: /disab|wheelchair|amputee|handicap/i, q: '伤残鉴定和补贴怎么办' },
  { re: /gambl|addict|drug abuse|alcohol|drinking problem/i, q: '赌博上瘾怎么办' },
  { re: /check-?up|screening|prevention|physical exam/i, q: '体检要查哪些项目' },
  { re: /\bsafe\b|safety|danger|emergency|rescue|\b911\b|\b110\b|\b120\b/i, q: '遇到危险怎么急救' },
  { re: /\brest\b|relax|entertainment|meditat|hobby|vacation/i, q: '怎么休息才能真正恢复精力' },
  { re: /time management|procrastinat|focus|productiv/i, q: '总是拖延怎么办' },
  { re: /burnout|overwork|inner conflict|no energy/i, q: '精力透支怎么恢复' },
  { re: /buy (a )?car|vehicle|driving licen/i, q: '买车要注意什么' },
  { re: /neighbou?r|noise|property management|dispute with/i, q: '物业不管事怎么办' },
  { re: /dog bite|stray dog|rabies|\bpet\b/i, q: '被狗咬了怎么办' },
  { re: /food poisoning|foodborne|expired|spoiled|rotten/i, q: '食物中毒怎么办' },
  { re: /invest(ment|ing|ed|or)?\b|\bstocks?\b|\bfunds?\b|financial freedom|get rich/i, q: '普通人该不该投资理财' },
];

const SAMPLES = {
  zh: [
    { label: '被裁员了，赔偿该怎么算？', query: '被裁员了，赔偿该怎么算？' },
    { label: '租房押金不退怎么办？', query: '租房押金不退怎么办？' },
    { label: '长期失眠怎么调整？', query: '长期失眠怎么调整？' },
    { label: '发现自己被骗了该做什么？', query: '发现自己被骗了该做什么？' },
  ],
  en: [
    { label: 'I got laid off — how much compensation should I get?', query: '被裁员了，赔偿该怎么算？' },
    { label: 'My landlord won’t return the deposit', query: '租房押金不退怎么办？' },
    { label: 'How do I fix long-term insomnia?', query: '长期失眠怎么调整？' },
    { label: 'I think I got scammed — what now?', query: '发现自己被骗了该做什么？' },
  ],
};

let pref = SYSTEM;
let lang = 'zh';

function detect() {
  const list = navigator.languages?.length ? navigator.languages : [navigator.language || 'zh'];
  return /^zh\b/i.test(list[0] || 'zh') ? 'zh' : 'en';
}

export function getLang() {
  return lang;
}

export function getPref() {
  return pref;
}

export function initLang() {
  try { pref = localStorage.getItem(PREF_KEY) || SYSTEM; } catch { pref = SYSTEM; }
  if (![SYSTEM, 'zh', 'en'].includes(pref)) pref = SYSTEM;
  lang = pref === SYSTEM ? detect() : pref;
  document.documentElement.lang = lang === 'en' ? 'en' : 'zh-CN';
  document.documentElement.dataset.lang = lang;
}

export function setPref(value) {
  pref = [SYSTEM, 'zh', 'en'].includes(value) ? value : SYSTEM;
  try { localStorage.setItem(PREF_KEY, pref); } catch { /* 存不下就只在本次生效 */ }
  lang = pref === SYSTEM ? detect() : pref;
}

export function t(key, vars) {
  const table = STRINGS[lang] || STRINGS.zh;
  let text = table[key] ?? STRINGS.zh[key] ?? key;
  if (vars) text = text.replace(/\{(\w+)\}/g, (_, name) => (vars[name] ?? ''));
  return text;
}

export function samples() {
  return SAMPLES[lang] || SAMPLES.zh;
}

// 英文提问映射成中文检索词；中文提问、或完全没命中主题时原样返回
export function toQuery(text) {
  if (lang !== 'en' || /[一-鿿]/.test(text)) return text;
  const hit = TOPICS.find((topic) => topic.re.test(text));
  return hit ? hit.q : text;
}

export function applyI18n(root = document) {
  for (const node of root.querySelectorAll('[data-i18n]')) node.textContent = t(node.dataset.i18n);
  for (const node of root.querySelectorAll('[data-i18n-html]')) node.innerHTML = t(node.dataset.i18nHtml);
  for (const node of root.querySelectorAll('[data-i18n-aria]')) {
    const label = t(node.dataset.i18nAria);
    node.setAttribute('aria-label', label);
    if (node.hasAttribute('title')) node.setAttribute('title', label);
  }
  for (const node of root.querySelectorAll('[data-i18n-ph]')) node.setAttribute('placeholder', t(node.dataset.i18nPh));
  document.title = t('app.title');
}
