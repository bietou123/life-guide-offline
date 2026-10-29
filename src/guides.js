// Broad questions need several book entries; the references below are pinned to the bundled edition.
export const GUIDES = [
  {
    id: 'immediate-help',
    match: (q) => /想自杀|想死|不想活|轻生|结束生命|伤害自己/.test(q),
    lead: '先处理眼前的安全和求助，原文还有可以立即联系的渠道。',
    refs: [[1, 25], [29, 11]],
    askNext: '你现在身边有人可以陪你吗？',
  },
  {
    id: 'prenatal-checks',
    match: (q) => /怀孕|孕期|产检|孕妇/.test(q) && /检查|产检|筛查|查什么|查哪些/.test(q)
      && !/报销|生育保险|生育津贴/.test(q),
    lead: '原文明确提到下面几个产检节点；这不是完整的个人产检计划。',
    refs: [[27, 2], [27, 3], [27, 6]],
    askNext: '你现在怀孕多少周？具体检查请和产科医生确认。',
  },
  {
    id: 'child-fever',
    match: (q) => /孩子|小孩|宝宝|婴儿|儿童|幼儿/.test(q) && /发烧|发热|高烧|退烧/.test(q)
      && !/抽搐|惊厥|癫痫/.test(q),
    lead: '原文只涉及儿童退烧药的用药安全，以及不满 3 个月婴儿发热的就医界限；不能凭这些条目判断病因或给出个人剂量。',
    refs: [[34, 2], [20, 8]],
    askNext: '孩子多大、体温多少？用药剂量请咨询儿科医生或药师。',
  },
  {
    id: 'kindergarten-start',
    match: (q) => /幼儿园|入园|幼小衔接/.test(q),
    lead: '原文没有专门讲幼儿园入园的条目；能直接对上的只有屏幕时间、户外活动和窝沟封闭这几条。',
    refs: [[30, 5], [30, 4], [30, 13]],
    askNext: '孩子多大了？入园体检和接种证的具体要求，以当地幼儿园通知为准。',
  },
  {
    id: 'job-loss-insurance',
    match: (q) => /被裁|裁员|辞退|失业|离职/.test(q) && /社保|医保|断缴|续缴|养老保险/.test(q),
    lead: '离职后的参保和补偿是两笔账。关于社保，原文先看断缴影响，再看接下来怎么参保。',
    refs: [[7, 18], [31, 11], [7, 1]],
    askNext: '你现在有没有新单位？医保是职工医保还是居民医保？',
  },
  {
    id: 'adult-mental-health',
    match: (q) => /抑郁|情绪低落|心理问题|心情很差/.test(q)
      && !/孩子|小孩|青少年|未成年|学生|儿童|婴儿/.test(q),
    lead: '先看能联系到谁、是否需要就医；运动是辅助选项，不能代替诊断和治疗。',
    refs: [[29, 11], [22, 6], [1, 25]],
    askNext: '你是想找人谈谈，还是症状已经影响到日常生活？',
  },
  {
    id: 'medical-visit',
    match: (q) => /挂号|看病流程|怎么去医院看病|去医院看病/.test(q)
      && !/慢性病|线上|互联网医院|续方|复诊/.test(q),
    lead: '普通就医、转诊和急重症走的入口不同；原文分别列了做法。',
    refs: [[24, 1], [24, 3], [24, 7]],
    askNext: '你是常见病就诊，还是现在有急重症症状？',
  },
  {
    id: 'divorce-property',
    match: (q) => /离婚|夫妻/.test(q) && /财产|房子怎么分|分钱|共同财产/.test(q),
    lead: '先区分个人财产和夫妻共同财产；原文另谈了父母出资和转移共同财产的情况。',
    refs: [[10, 10], [10, 11], [10, 22]],
    askNext: '你要分的是婚前财产、婚后收入，还是父母出资买的房？',
  },
  {
    id: 'overseas-travel',
    match: (q) => /出国|境外|旅游|旅行/.test(q) && /注意|安全|准备|带什么|行前/.test(q)
      && !/留学|打工|移民/.test(q),
    lead: '出发前可以按原文逐项核对安全提醒、紧急联系方式、保险和证件。',
    refs: [[21, 1], [21, 2], [21, 4], [21, 7]],
    askNext: '你准备去哪个国家？当地提醒和入境规定请以出发时的官方信息为准。',
  },
  {
    id: 'newborn-paperwork',
    match: (q) => /孩子出生|新生儿|宝宝出生|刚生完/.test(q)
      && /办.*(证|户口|医保)|哪些证|手续|落户/.test(q),
    lead: '这几件事原文分别有条目：出生医学证明、居民医保和出生登记。',
    refs: [[27, 12], [27, 14], [27, 15]],
    askNext: '出生医学证明办好了吗？',
  },
  {
    id: 'dismissal-pay',
    match: (q) => /被裁|裁员|被辞退|被开除|公司辞退|解除劳动合同/.test(q)
      && /赔|补偿|钱|算|多少/.test(q)
      && !/社保|医保|违法|非法|无故|无理由|2n|二倍|双倍/i.test(q),
    lead: '先核对解除原因。经济补偿 N、特定情形的额外一个月工资、违法解除赔偿不能不分条件地套用。',
    refs: [[19, 4], [19, 5], [19, 6]],
    askNext: '公司给你的书面解除理由是什么？工作了多久？',
  },
];

export function findGuide(question, items) {
  const guide = GUIDES.find((entry) => entry.match(question));
  if (!guide) return null;
  const refs = guide.refs.map(([ch, num]) => items.find((item) => item.ch === ch && item.num === num));
  return refs.every(Boolean) ? { guide, refs } : null;
}
