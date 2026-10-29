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
    ['没钱了怎么活下去', 7],
  ]) {
    const reply = answerQuestion(question, 'deep');
    assert.equal(reply.found, true, question);
    assert.equal(reply.item.ch, chapter, question);
    assert.ok((reply.lead?.length || 0) + (reply.point?.length || 0) > 0);
    assert.ok(reply.item.src.length > 0);
  }
});

test('analysis only quotes data belonging to the chosen entry', () => {
  const reply = answerQuestion('租房押金不退怎么办', 'deep');
  assert.equal(reply.kind, 'direct');
  if (reply.lead) assert.ok(reply.item.plain.includes(reply.lead.slice(0, 20)) || reply.item.t === reply.lead);
  if (reply.point) assert.ok(reply.item.plain.includes(reply.point) || reply.item.t === reply.point);
  for (const step of reply.steps || []) {
    assert.ok([reply.item.plain, reply.item.cost, reply.item.note].some((field) => field.includes(step)));
  }
  assert.ok(reply.item.cost.startsWith(reply.cost.slice(0, 10)));
  assert.ok(reply.item.gain.includes(reply.benefit.slice(0, 20)));
  assert.ok(reply.related.every((item) => item.ch === reply.item.ch));
});

test('broad questions synthesize only matching original entries', () => {
  for (const [question, expected] of [
    ['被裁员后社保怎么办', ['7.18', '31.11', '7.1']],
    ['怀孕了做哪些检查', ['27.2', '27.3', '27.6']],
    ['抑郁了怎么办', ['29.11', '22.6', '1.25']],
    ['医院挂号看病流程', ['24.1', '24.3', '24.7']],
    ['离婚财产怎么分', ['10.10', '10.11', '10.22']],
    ['出国旅游要注意什么', ['21.1', '21.2', '21.4', '21.7']],
    ['孩子出生后要办哪些证', ['27.12', '27.14', '27.15']],
    ['被公司辞退了该拿多少钱', ['19.4', '19.5', '19.6']],
  ]) {
    const reply = answerQuestion(question, 'deep');
    assert.equal(reply.kind, 'guide', question);
    assert.deepEqual(reply.points.map(({ item }) => `${item.ch}.${item.num}`), expected, question);
    for (const point of reply.points) {
      assert.ok(point.item.plain.startsWith(point.summary.slice(0, 35)), question);
      assert.ok(point.item.cost.startsWith(point.cost.slice(0, 15)), question);
      assert.ok(point.item.src, `Missing citation: ${question}`);
    }
  }
});

test('short follow-ups keep their original topic over multiple turns', () => {
  const context = '被裁员后社保怎么办';
  const first = answerQuestion('那养老保险呢', 'fast', context);
  const second = answerQuestion('那具体要怎么交', 'deep', context);
  assert.equal(first.guideId, 'job-loss-insurance');
  assert.equal(second.guideId, 'job-loss-insurance');
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

test('common care and dispute questions do not point to a different situation', () => {
  const fever = answerQuestion('孩子发烧怎么办');
  assert.equal(fever.guideId, 'child-fever');
  assert.deepEqual(fever.points.map(({ item }) => `${item.ch}.${item.num}`), ['34.2', '20.8']);
  assert.equal(answerQuestion('孩子高烧抽搐怎么办').item?.num, 16);
  assert.equal(answerQuestion('房东押金不退怎么办').item?.num, 1);
  assert.equal(answerQuestion('借钱不还怎么办').item?.num, 19);
  assert.equal(answerQuestion('借条怎么写才有效').item?.num, 18);
});

test('kindergarten paperwork is not answered with unrelated child health entries', () => {
  assert.equal(answerQuestion('幼儿园报名要准备什么材料').found, false);
  assert.equal(answerQuestion('幼小衔接怎么准备').found, false);
  assert.equal(answerQuestion('幼儿园孩子户外活动怎么安排').guideId, 'kindergarten-start');
});

test('key numbers leave out citation dates and incidental counts', () => {
  assert.deepEqual(answerQuestion('被诈骗了怎么办').numbers, []);
  assert.deepEqual(answerQuestion('房东押金不退怎么办').numbers, []);
  const overtime = answerQuestion('公司不给加班费怎么办').numbers.map(({ v }) => v);
  assert.deepEqual(overtime.slice(0, 3), ['1.5倍', '2倍', '3倍']);
  assert.ok(!overtime.includes('三档'));
});

test('uncovered queries do not invent an answer', () => {
  for (const question of [
    '体检发现结节要紧吗', '蜥蜴的饮食偏好是什么', '大学选什么专业好',
    '量子纠缠是什么', '苹果手机值得买吗',
  ]) {
    assert.equal(answerQuestion(question).found, false, question);
  }
});

test('book markdown renders text without executing embedded HTML', () => {
  const html = renderMarkdown('# 标题\n<script>alert(1)</script>\n[危险](javascript:alert(1))');
  assert.match(html, /<h1>标题<\/h1>/);
  assert.doesNotMatch(html, /<script>|href="javascript:/);
  assert.match(html, /&lt;script&gt;/);
});
