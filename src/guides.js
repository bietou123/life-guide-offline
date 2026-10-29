// Broad questions need several book entries; the references below are pinned to the bundled edition.
// 文案在 i18n.js 的 guide.<id> / guide.<id>.next。
export const GUIDES = [
  {
    id: 'immediate-help',
    match: (q) => /想自杀|想死|不想活|轻生|结束生命|伤害自己/.test(q),
    refs: [[1, 25], [29, 11]],
  },
  {
    id: 'prenatal-checks',
    match: (q) => /怀孕|孕期|产检|孕妇/.test(q) && /检查|产检|筛查|查什么|查哪些/.test(q)
      && !/报销|生育保险|生育津贴/.test(q),
    refs: [[27, 2], [27, 3], [27, 6]],
  },
  {
    id: 'child-fever',
    match: (q) => /孩子|小孩|宝宝|婴儿|儿童|幼儿/.test(q) && /发烧|发热|高烧|退烧/.test(q)
      && !/抽搐|惊厥|癫痫/.test(q),
    refs: [[34, 2], [20, 8]],
  },
  {
    id: 'kindergarten-start',
    match: (q) => /幼儿园|入园|幼小衔接/.test(q)
      && /屏幕|看电视|户外|近视|视力|牙齿|蛀牙|窝沟/.test(q),
    refs: [[30, 5], [30, 4], [30, 13]],
  },
  {
    id: 'job-loss-insurance',
    match: (q) => /被裁|裁员|辞退|失业|离职/.test(q) && /社保|医保|断缴|续缴|养老保险/.test(q),
    refs: [[7, 18], [31, 11], [7, 1]],
  },
  {
    id: 'adult-mental-health',
    match: (q) => /抑郁|情绪低落|心理问题|心情很差/.test(q)
      && !/孩子|小孩|青少年|未成年|学生|儿童|婴儿/.test(q),
    refs: [[29, 11], [22, 6], [1, 25]],
  },
  {
    id: 'medical-visit',
    match: (q) => /挂号|看病流程|怎么去医院看病|去医院看病/.test(q)
      && !/慢性病|线上|互联网医院|续方|复诊/.test(q),
    refs: [[24, 1], [24, 3], [24, 7]],
  },
  {
    id: 'divorce-property',
    match: (q) => /离婚|夫妻/.test(q) && /财产|房子怎么分|分钱|共同财产/.test(q),
    refs: [[10, 10], [10, 11], [10, 22]],
  },
  {
    id: 'overseas-travel',
    match: (q) => /出国|境外|旅游|旅行/.test(q) && /注意|安全|准备|带什么|行前/.test(q)
      && !/留学|打工|移民/.test(q),
    refs: [[21, 1], [21, 2], [21, 4], [21, 7]],
  },
  {
    id: 'newborn-paperwork',
    match: (q) => /孩子出生|新生儿|宝宝出生|刚生完/.test(q)
      && /办.*(证|户口|医保)|哪些证|手续|落户/.test(q),
    refs: [[27, 12], [27, 14], [27, 15]],
  },
  {
    id: 'dismissal-pay',
    match: (q) => /被裁|裁员|被辞退|被开除|公司辞退|解除劳动合同/.test(q)
      && /赔|补偿|钱|算|多少/.test(q)
      && !/社保|医保|违法|非法|无故|无理由|2n|二倍|双倍/i.test(q),
    refs: [[19, 4], [19, 5], [19, 6]],
  },
];

export function findGuide(question, items) {
  const guide = GUIDES.find((entry) => entry.match(question));
  if (!guide) return null;
  const refs = guide.refs.map(([ch, num]) => items.find((item) => item.ch === ch && item.num === num));
  return refs.every(Boolean) ? { guide, refs } : null;
}
