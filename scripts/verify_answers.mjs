import assert from 'node:assert/strict';
import fs from 'node:fs';
import { setData } from '../src/search.js';
import { answerQuestion } from '../src/answer.js';

const items = JSON.parse(fs.readFileSync('public/data/items.json', 'utf8'));
const index = JSON.parse(fs.readFileSync('public/data/index.json', 'utf8'));
const chapters = JSON.parse(fs.readFileSync('public/data/book.json', 'utf8'));
setData(items, index);
assert.equal(chapters.length, 34);
assert.equal(items.length, 767);

for (const [question, chapter] of [
  ['租房押金不退怎么办', 15],
  ['试用期最长多久', 19],
  ['失眠怎么调整', 3],
  ['没钱了怎么活下去', 7],
]) {
  const result = answerQuestion(question, 'deep');
  assert.ok(result.found, `No answer to: ${question}`);
  assert.equal(result.item.ch, chapter, `Wrong chapter for: ${question}`);
  assert.ok(result.item.src.includes('http'), `Missing primary citation: ${question}`);
  console.log(`OK ${question}: ${result.item.ch}.${result.item.num}`);
}

for (const question of ['量子纠缠是什么', '南京明天温度', '苹果手机值得买吗']) {
  assert.equal(answerQuestion(question).found, false, `Off-topic question matched the book: ${question}`);
  console.log(`OK out of scope: ${question}`);
}

const generalLayoff = answerQuestion('被公司辞退了该拿多少钱');
assert.equal(generalLayoff.item?.num, 4, 'General dismissal must not assume unlawful termination (2N)');
const unlawfulLayoff = answerQuestion('公司违法辞退了，赔偿怎么算');
assert.equal(unlawfulLayoff.item?.num, 6, 'Unlawful dismissal should cite damages (2N)');
console.log('OK legal distinctions for dismissal');
