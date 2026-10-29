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
    'ans.noneLead': '这本指南里暂时找不到能直接回答这个问题的条目。',
    'ans.noneDetail': '换一个更具体的关键词试试，或打开目录按主题浏览。不会用不相关的条目编造结论。',
    'ans.kgLead': '这本指南没有覆盖幼儿园入园或幼小衔接的具体要求。',
    'ans.kgDetail': '报名材料、体检和接种证明等请以当地教育部门及幼儿园通知为准。',
    'chat.hi': '在。想了解什么？可以直接问，比如「被辞退了该拿多少钱」「租房押金不退怎么办」。',
    'chat.who': '我是「指南」——一个完全离线的生活决策助手。\n\n我的全部知识来自开源项目《高性价比人生指南》的 34 章、767 条实证建议，每条都标了证据等级和原始出处。我不联网、不调用任何模型，答案都是原文里抽出来并按结构重组的。',
    'chat.help': '你可以问我：\n\n· 具体处境怎么办——「公司不给加班费」「租房押金不退」「刚被裁了」\n· 划不划算——「要不要考公」「养孩子花多少钱」\n· 具体数字——「工伤十级赔多少」「试用期最长多久」\n\n回答会给出：结论、要做的事、关键数字、证据等级和原文出处。想看全文点左上角菜单里的「阅读原文全文」。',
    'chat.thanks': '不客气。还有想问的直接说。',
    'chat.bye': '好，需要的时候再来。',
    'guide.immediate-help': '先处理眼前的安全和求助，原文还有可以立即联系的渠道。',
    'guide.immediate-help.next': '你现在身边有人可以陪你吗？',
    'guide.prenatal-checks': '原文明确提到下面几个产检节点；这不是完整的个人产检计划。',
    'guide.prenatal-checks.next': '你现在怀孕多少周？具体检查请和产科医生确认。',
    'guide.child-fever': '原文只涉及儿童退烧药的用药安全，以及不满 3 个月婴儿发热的就医界限；不能凭这些条目判断病因或给出个人剂量。',
    'guide.child-fever.next': '孩子多大、体温多少？用药剂量请咨询儿科医生或药师。',
    'guide.kindergarten-start': '原文没有专门讲幼儿园入园的条目；能直接对上的只有屏幕时间、户外活动和窝沟封闭这几条。',
    'guide.kindergarten-start.next': '孩子多大了？入园体检和接种证的具体要求，以当地幼儿园通知为准。',
    'guide.job-loss-insurance': '离职后的参保和补偿是两笔账。关于社保，原文先看断缴影响，再看接下来怎么参保。',
    'guide.job-loss-insurance.next': '你现在有没有新单位？医保是职工医保还是居民医保？',
    'guide.adult-mental-health': '先看能联系到谁、是否需要就医；运动是辅助选项，不能代替诊断和治疗。',
    'guide.adult-mental-health.next': '你是想找人谈谈，还是症状已经影响到日常生活？',
    'guide.medical-visit': '普通就医、转诊和急重症走的入口不同；原文分别列了做法。',
    'guide.medical-visit.next': '你是常见病就诊，还是现在有急重症症状？',
    'guide.divorce-property': '先区分个人财产和夫妻共同财产；原文另谈了父母出资和转移共同财产的情况。',
    'guide.divorce-property.next': '你要分的是婚前财产、婚后收入，还是父母出资买的房？',
    'guide.overseas-travel': '出发前可以按原文逐项核对安全提醒、紧急联系方式、保险和证件。',
    'guide.overseas-travel.next': '你准备去哪个国家？当地提醒和入境规定请以出发时的官方信息为准。',
    'guide.newborn-paperwork': '这几件事原文分别有条目：出生医学证明、居民医保和出生登记。',
    'guide.newborn-paperwork.next': '出生医学证明办好了吗？',
    'guide.dismissal-pay': '先核对解除原因。经济补偿 N、特定情形的额外一个月工资、违法解除赔偿不能不分条件地套用。',
    'guide.dismissal-pay.next': '公司给你的书面解除理由是什么？工作了多久？',
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
    'ans.noneLead': 'The guide has nothing that directly answers this question yet.',
    'ans.noneDetail': 'Try more specific keywords, or browse the contents by topic. It will not stitch an answer together from unrelated entries.',
    'ans.kgLead': 'The guide does not cover kindergarten admission or the transition to primary school.',
    'ans.kgDetail': 'Enrolment documents, health checks and vaccination certificates depend on your local education authority and the kindergarten.',
    'chat.hi': "I'm here. What would you like to look into? Just ask — for example, “How much should I get if I'm laid off?” or “My landlord won't return my deposit.”",
    'chat.who': 'I am “Guide” — a fully offline assistant for life decisions.\n\nAll my knowledge comes from the open-source book “A High-Value Guide to Life”: 34 chapters, 767 evidence-based entries, each tagged with an evidence grade and its original location. I don’t go online and I don’t call any model — every answer is pulled from the text and reassembled into a structure.',
    'chat.help': 'You can ask things like:\n\n· What to do in a specific situation — “My company won’t pay overtime”, “My landlord won’t return the deposit”, “I just got laid off”\n· Whether something is worth it — “Should I go for the civil service exam”, “How much does raising a child cost”\n· Concrete numbers — “How much for a grade-10 work injury”, “How long can probation last”\n\nEach answer gives you: the conclusion, what to do, key numbers, the evidence grade and the original source. To read the full text, open the menu at the top left and choose “Original text and contents”.',
    'chat.thanks': 'You’re welcome. Ask anything else whenever you like.',
    'chat.bye': 'Alright — come back whenever you need me.',
    'guide.immediate-help': 'Deal with immediate safety and getting help first; the text also lists channels you can contact right away.',
    'guide.immediate-help.next': 'Is there someone with you right now?',
    'guide.prenatal-checks': 'The text names the checkpoints below; this is not a complete personal prenatal plan.',
    'guide.prenatal-checks.next': 'How many weeks pregnant are you? Confirm the specific checks with your obstetrician.',
    'guide.child-fever': 'The text only covers the safety of children’s fever medicine and the threshold for a doctor visit when a baby under 3 months has a fever; it cannot determine the cause or give a personal dose.',
    'guide.child-fever.next': 'How old is the child, and what is the temperature? Ask a paediatrician or pharmacist about dosing.',
    'guide.kindergarten-start': 'The text has no entry specifically about starting kindergarten; the only entries that line up are screen time, outdoor activity and dental sealants.',
    'guide.kindergarten-start.next': 'How old is the child? Health-check and vaccination requirements depend on the local kindergarten’s notice.',
    'guide.job-loss-insurance': 'Keeping social insurance going and getting compensation are two separate matters. On social insurance, the text looks first at what a gap in contributions means, then at how to keep paying in.',
    'guide.job-loss-insurance.next': 'Do you have a new employer yet? Is your medical insurance employee-based or resident-based?',
    'guide.adult-mental-health': 'Start with who you can reach and whether you need medical care; exercise is a supplement, not a replacement for diagnosis and treatment.',
    'guide.adult-mental-health.next': 'Are you looking for someone to talk to, or are the symptoms already affecting daily life?',
    'guide.medical-visit': 'Routine visits, referrals and emergencies use different entry points; the text lays out each of them.',
    'guide.medical-visit.next': 'Is this a routine visit for a common illness, or do you have emergency symptoms right now?',
    'guide.divorce-property': 'First separate personal property from marital property; the text also covers contributions from parents and hiding marital assets.',
    'guide.divorce-property.next': 'What needs dividing: premarital property, income earned during the marriage, or a home bought with parents’ money?',
    'guide.overseas-travel': 'Before you leave, use the text to check safety reminders, emergency contacts, insurance and documents one by one.',
    'guide.overseas-travel.next': 'Which country are you going to? Local warnings and entry rules depend on official information at the time of travel.',
    'guide.newborn-paperwork': 'These are separate entries in the text: the birth certificate, resident medical insurance and birth registration.',
    'guide.newborn-paperwork.next': 'Have you got the birth certificate yet?',
    'guide.dismissal-pay': 'Check the stated reason for termination first. Statutory severance (N), the extra month of pay in specific cases, and compensation for unlawful dismissal cannot be applied without regard to the conditions.',
    'guide.dismissal-pay.next': 'What reason did the company give you in writing? How long did you work there?',
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
