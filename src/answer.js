import { getItems, search, tokenize } from './search.js';

function excerpt(value, max = 190) {
  const text = (value || '').trim();
  if (text.length <= max) return text;
  const head = text.slice(0, max);
  const end = Math.max(head.lastIndexOf('。'), head.lastIndexOf('；'), head.lastIndexOf('！'));
  return end >= max * 0.5 ? head.slice(0, end + 1) : `${head.trimEnd()}…`;
}

export function answerQuestion(question, mode = 'fast', previousQuestion = '') {
  let results = search(question, { context: previousQuestion, topK: 12 });
  // Short follow-ups often have no topic words of their own.
  if (results.top < 22 && previousQuestion && /那|然后|接下来|具体|怎么办|多少钱|风险|怎么做/.test(question)) {
    results = search(`${previousQuestion} ${question}`, { topK: 12 });
  }

  const core = question.replace(/是什么|是啥|怎么办|怎么|什么|应该|可以|请问|帮我|一下|发现|要紧|调整|改进|解决|多少|好吗|好不好|[吗呢？?！!。，,、；;：]/g, ' ').trim();
  const keywords = [...new Set(tokenize(core))];
  const specificTopics = core.split(/\s+/).filter((part) => part.length >= 2);
  const matches = results.items.map((result) => {
    const title = new Set(tokenize(result.item.t));
    const summary = new Set(tokenize(`${result.item.t} ${result.item.plain}`));
    const inTitle = keywords.filter((word) => title.has(word)).length;
    const inSummary = keywords.filter((word) => summary.has(word)).length;
    const coverage = keywords.length ? inSummary / keywords.length : 0;
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
  const missingSpecificTopic = specificTopics.length >= 2 && specificTopics.every((part) => part.length <= 3)
    && specificTopics.some((part) => !primaryText.includes(part)) && results.top < 50;
  const supported = winner && (
    (results.domains.includes(winner.item.ch) && winner.score >= 12) ||
    (winner.score >= 22 && (winner.coverage >= 0.5 || winner.inTitle > 0))
  );
  if (!supported || missingSpecificTopic) {
    return {
      found: false,
      lead: '这本指南里暂时找不到能直接回答这个问题的条目。',
      detail: '换一个更具体的关键词试试，或打开目录按主题浏览。不会用不相关的条目编造结论。',
      related: [],
    };
  }

  let primary = winner.item;
  // A general dismissal question does not establish the unlawful-termination condition for 2N.
  if (primary.ch === 19 && /被裁|裁员|被辞退|被公司.{0,5}辞退|被开除/.test(question)
    && !/违法|非法|无故|无理由|2n|二倍|双倍/i.test(question)) {
    primary = getItems().find((item) => item.ch === 19 && item.num === 4) || primary;
  }
  const related = results.items.filter(({ item, score }) =>
    item.id !== primary.id && score >= results.top * 0.46 && item.ch === primary.ch
  ).slice(0, mode === 'deep' ? 3 : 2).map(({ item }) => item);

  return {
    found: true,
    item: primary,
    mode,
    lead: excerpt(primary.plain || primary.t, 330),
    action: primary.t,
    cost: excerpt(primary.cost, mode === 'deep' ? 280 : 150),
    benefit: mode === 'deep' ? excerpt(primary.gain, 290) : '',
    caution: mode === 'deep' ? excerpt(primary.note, 270) : '',
    related,
  };
}
