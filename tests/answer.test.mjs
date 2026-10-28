import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { setData } from '../src/search.js';
import { answerQuestion } from '../src/answer.js';
import { renderMarkdown } from '../src/markdown.js';

const items = JSON.parse(readFileSync(new URL('../public/data/items.json', import.meta.url), 'utf8'));
const index = JSON.parse(readFileSync(new URL('../public/data/index.json', import.meta.url), 'utf8'));
const book = JSON.parse(readFileSync(new URL('../public/data/book.json', import.meta.url), 'utf8'));
setData(items, index);

test('the local package contains the complete book and index', () => {
  assert.equal(items.length, 767);
  assert.equal(book.length, 34);
  assert.equal(index.N, items.length);
  for (const chapter of book) {
    const entries = items.filter((item) => item.ch === chapter.n);
    assert.equal((chapter.md.match(/^### /gm) || []).length, entries.length, chapter.t);
  }
});

test('answers stay attached to their original chapters', () => {
  for (const [question, chapter] of [
    ['租房押金不退怎么办', 15],
    ['被裁员了怎么拿赔偿', 19],
    ['借条怎么写才有法律效力', 8],
    ['失眠怎么调整', 3],
    ['安全带有用吗', 1],
    ['被诈骗了怎么办', 8],
  ]) {
    const reply = answerQuestion(question, 'deep');
    assert.equal(reply.found, true, question);
    assert.equal(reply.item.ch, chapter, question);
    assert.ok(reply.lead.length > 0);
    assert.ok(reply.item.src.length > 0);
  }
});

test('analysis only quotes data belonging to the chosen entry', () => {
  const reply = answerQuestion('租房押金不退怎么办', 'deep');
  assert.ok(reply.item.plain.startsWith(reply.lead.slice(0, 30)));
  assert.ok(reply.item.cost.startsWith(reply.cost.slice(0, 10)));
  assert.ok(reply.item.gain.startsWith(reply.benefit.slice(0, 20)));
  assert.ok(reply.related.every((item) => item.ch === reply.item.ch));
});

test('follow-up queries inherit previous topic', () => {
  const reply = answerQuestion('那接下来怎么办？', 'fast', '租房押金不退怎么办');
  assert.equal(reply.item?.ch, 15);
});

test('ordinary layoffs are not labeled as unlawful dismissal', () => {
  const ordinary = answerQuestion('被裁员了怎么拿赔偿');
  const unlawful = answerQuestion('公司违法解除合同赔多少');
  assert.equal(ordinary.item?.num, 4);
  assert.equal(unlawful.item?.num, 6);
});

test('uncovered queries do not invent an answer', () => {
  for (const question of ['体检发现结节要紧吗', '蜥蜴的饮食偏好是什么', '大学选什么专业好']) {
    assert.equal(answerQuestion(question).found, false, question);
  }
});

test('book markdown renders text without executing embedded HTML', () => {
  const html = renderMarkdown('# 标题\n<script>alert(1)</script>\n[危险](javascript:alert(1))');
  assert.match(html, /<h1>标题<\/h1>/);
  assert.doesNotMatch(html, /<script>|href="javascript:/);
  assert.match(html, /&lt;script&gt;/);
});
