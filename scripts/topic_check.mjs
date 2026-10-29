// 英文提问映射自检：node scripts/topic_check.mjs
import { readFileSync } from 'node:fs';
import { setData } from '../src/search.js';
import { answerQuestion } from '../src/answer.js';
import { setPref, toQuery } from '../src/i18n.js';

const items = JSON.parse(readFileSync(new URL('../public/data/items.json', import.meta.url), 'utf8'));
const index = JSON.parse(readFileSync(new URL('../public/data/index.json', import.meta.url), 'utf8'));
setData(items, index);
setPref('en');

const QUESTIONS = [
  'I got laid off, how much compensation do I get?',
  'My landlord won\'t return my rent deposit',
  'How do I fix long-term insomnia?',
  'I think I got scammed, what should I do?',
  'My company owes me two months of unpaid wages',
  'I want to quit my job, what notice do I need?',
  'I was injured at work, what do I do?',
  'How do I buy a house without being cheated on the down payment?',
  'My father is elderly and lives alone, what should I prepare?',
  'How do I write a will?',
  'A car hit me on my bike, what now?',
  'My baby was just born, which documents do I need?',
  'I am anxious and depressed, where do I get help?',
  'I want to lose weight, is fasting safe?',
  'I share the same password everywhere, am I at risk?',
  'I have no money and a lot of debt',
  'Do I need insurance for my parents?',
  'I am opening a small shop, what licence do I need?',
  'How much money should I save each month?',
  'My neighbour keeps making noise at night',
  'Should I invest in stocks?',
  'What should I do if my food was expired?',
  'I can\'t sleep because of stress',
  'My husband beats me, what can I do?',
];

let flagged = 0;
for (const question of QUESTIONS) {
  const query = toQuery(question);
  const answer = answerQuestion(query, 'fast');
  const lead = (answer.lead || answer.action || '').slice(0, 34);
  const refs = answer.points ? answer.points.map((p) => `${p.item.ch}.${p.item.num}`).join(',') : `${answer.item?.ch}.${answer.item?.num}`;
  const miss = !answer.found ? '  <-- 未命中' : '';
  if (!answer.found) flagged += 1;
  console.log(`${question}\n   → ${query}\n   ← ${refs} ${lead}${miss}\n`);
}
console.log(`未命中 ${flagged} / ${QUESTIONS.length}`);
