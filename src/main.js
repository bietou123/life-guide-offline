import './style.css';
import { App } from '@capacitor/app';
import { Browser } from '@capacitor/browser';
import { Capacitor } from '@capacitor/core';
import { createIcons, Menu, SquarePen, ArrowLeft, ArrowUp, BookOpen, Search, History, Shuffle, Trash2, Copy, ChevronRight, ArrowUpRight } from 'lucide';
import { loadData, getItems, search } from './search.js';
import { answerQuestion, isFollowUp } from './answer.js';
import { renderMarkdown } from './markdown.js';
import { initLang, getPref, setPref, applyI18n, t, samples, toQuery } from './i18n.js';

const $ = (selector) => document.querySelector(selector);
const ICONS = { Menu, SquarePen, ArrowLeft, ArrowUp, BookOpen, Search, History, Shuffle, Trash2, Copy, ChevronRight, ArrowUpRight };
const STORE_KEY = 'life-guide-conversations-v1';
const ACTIVE_KEY = 'life-guide-active-conversation-v1';
const SOURCE = 'https://github.com/eternity4719/HowToLiveBetter';

initLang();
applyI18n();

let book = [];
let items = [];
let conversations = [];
let activeId = null;
let mode = 'fast';
let route = { screen: 'chat' };
let searchOpen = false;
let toastTimer;

function icon(name) {
  const node = document.createElement('i');
  node.dataset.lucide = name;
  return node;
}

function icons() {
  createIcons({ icons: ICONS, attrs: { width: 19, height: 19, 'stroke-width': 1.8 } });
}

function el(tag, className, value) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (value !== undefined) node.textContent = value;
  return node;
}

function button(className, label, iconName, action) {
  const node = el('button', className);
  node.type = 'button';
  if (iconName) node.append(icon(iconName));
  node.append(el('span', '', label));
  node.addEventListener('click', action);
  return node;
}

function toast(message) {
  let node = $('.toast');
  if (!node) {
    node = el('div', 'toast');
    node.setAttribute('role', 'status');
    document.body.append(node);
  }
  node.textContent = message;
  node.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => node.classList.remove('show'), 2400);
}

function readConversations() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORE_KEY) || '[]');
    if (Array.isArray(parsed)) {
      conversations = parsed.filter((c) => c && typeof c.id === 'string' && Array.isArray(c.turns))
        .slice(0, 20).map((c) => ({ ...c, turns: c.turns.filter((t) => t && typeof t.q === 'string').slice(-60) }));
      const savedId = localStorage.getItem(ACTIVE_KEY);
      activeId = savedId === '' ? null : conversations.some((c) => c.id === savedId)
        ? savedId : conversations[0]?.id || null;
    }
  } catch { conversations = []; }
}

function saveConversations() {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(conversations.slice(0, 20)));
    localStorage.setItem(ACTIVE_KEY, activeId || '');
  }
  catch { toast(t('store.full')); }
}

function currentConversation() {
  return conversations.find((c) => c.id === activeId);
}

function updateComposer() {
  const input = $('#input');
  input.style.height = 'auto';
  input.style.height = `${Math.min(input.scrollHeight, 132)}px`;
  $('#btn-send').disabled = !input.value.trim();
  $('#btn-send').classList.toggle('is-on', !!input.value.trim());
}

function navigate(next) {
  route = next;
  history.pushState({ guide: true, ...next }, '', location.pathname + location.search + (next.screen === 'reader' ? '#reader' : '#chat'));
  renderRoute();
}

function renderRoute() {
  $('#screen-chat').classList.toggle('is-active', route.screen === 'chat');
  $('#screen-reader').classList.toggle('is-active', route.screen === 'reader');
  if (route.screen === 'reader') renderReader();
  else requestAnimationFrame(scrollThread);
}

function back() {
  if (!$('#drawer').hidden) { closeDrawer(); return; }
  if (route.screen === 'reader') { history.back(); return; }
  if (Capacitor.isNativePlatform()) App.exitApp();
}

function openDrawer() {
  renderHistoryList();
  $('#drawer').hidden = false;
  $('#drawer-mask').hidden = false;
  icons();
}

function closeDrawer() {
  $('#drawer').hidden = true;
  $('#drawer-mask').hidden = true;
}

function openCatalog() {
  closeDrawer();
  searchOpen = false;
  $('#reader-search-input').value = '';
  navigate({ screen: 'reader', chapter: null });
}

function openEntry(item) {
  closeDrawer();
  const alreadyReading = route.screen === 'reader' && route.chapter === item.ch && !searchOpen;
  searchOpen = false;
  $('#reader-search-input').value = '';
  if (alreadyReading) {
    scrollToEntry(item.num);
  } else {
    navigate({ screen: 'reader', chapter: item.ch, entry: item.num });
  }
}

function renderSuggestions() {
  for (const sample of samples()) {
    const card = button('suggest-card', sample.label, 'arrow-up-right', () => sendQuestion(sample.label, sample.query));
    card.querySelector('svg, i').classList.add('sug-icon');
    card.querySelector('span').className = 'sug-text';
    $('#suggest-grid').append(card);
  }
  icons();
}

function scrollThread() {
  const thread = $('#thread');
  thread.scrollTop = currentConversation()?.turns.length ? thread.scrollHeight : 0;
}

function randomItem() {
  return items[Math.floor(Math.random() * items.length)];
}

// 抽签时标题先滚动几轮，再真正作答，按下去有反馈
let shuffling = false;
function shuffleEntry() {
  if (shuffling || !items.length) return;
  if (reducedMotion()) { sendQuestion(randomItem().t); return; }
  shuffling = true;
  const buttons = [$('#btn-lucky'), $('#btn-lucky-row')].filter(Boolean);
  const label = $('.lucky-text');
  buttons.forEach((node) => node.classList.add('is-shuffling'));
  let ticks = 0;
  const timer = setInterval(() => {
    const item = randomItem();
    if (label) label.textContent = item.t.length > 18 ? `${item.t.slice(0, 18)}…` : item.t;
    if (++ticks < 7) return;
    clearInterval(timer);
    buttons.forEach((node) => node.classList.remove('is-shuffling'));
    if (label) label.textContent = t('lucky.title');
    shuffling = false;
    sendQuestion(randomItem().t);
  }, 85);
}

let streamToken = 0;
const reducedMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

// 每段文字先藏起来，按队列逐段打字或淡入
function createStream(body, animate) {
  const steps = [];
  const on = !!animate && !reducedMotion();
  const add = (node, mode = 'type') => {
    if (!on) return node;
    node.classList.add('stream-wait');
    if (mode === 'type') {
      const text = node.textContent;
      node.textContent = '';
      steps.push({ node, text });
    } else {
      steps.push({ node });
    }
    return node;
  };
  return { body, steps, on, add };
}

function followScroll() {
  const thread = $('#thread');
  if (thread.scrollHeight - thread.scrollTop - thread.clientHeight < 220) thread.scrollTop = thread.scrollHeight;
}

function typeInto(node, text, token, size) {
  return new Promise((resolve) => {
    node.classList.remove('stream-wait');
    node.classList.add('stream-typing');
    const total = text.length;
    let shown = 0;
    const finish = () => {
      node.textContent = text;
      node.classList.remove('stream-typing');
      resolve();
    };
    const tick = () => {
      if (token !== streamToken) return finish();
      shown = Math.min(total, shown + size);
      node.textContent = text.slice(0, shown);
      followScroll();
      if (shown < total) setTimeout(tick, 15);
      else finish();
    };
    setTimeout(tick, 15);
  });
}

function flushStream(stream) {
  for (const step of stream.steps) {
    step.node.classList.remove('stream-wait', 'stream-typing');
    if (step.text !== undefined) step.node.textContent = step.text;
  }
  delete stream.body.dataset.streaming;
}

async function runStream(stream) {
  if (!stream.on) return;
  const token = ++streamToken;
  stream.body.dataset.streaming = '1';
  // 整段答案控制在两秒左右，长答案自动加快，不让用户干等
  const totalChars = stream.steps.reduce((sum, step) => sum + (step.text ? step.text.length : 0), 0);
  const budget = Math.min(2400, 600 + totalChars * 3);
  const size = Math.max(2, Math.ceil(totalChars / Math.max(1, Math.floor(budget / 15))));
  for (const step of stream.steps) {
    if (token !== streamToken) return flushStream(stream);
    if (step.text === undefined) {
      step.node.classList.remove('stream-wait');
      step.node.classList.add('stream-in');
      await new Promise((resolve) => setTimeout(resolve, 24));
    } else {
      await typeInto(step.node, step.text, token, size);
      await new Promise((resolve) => setTimeout(resolve, 14));
    }
  }
  delete stream.body.dataset.streaming;
}

function appendTurn(q, answer, answerMode, animate = false) {
  const user = el('div', 'msg user');
  user.append(el('div', 'bubble-user', q));
  $('#messages').append(user);

  const msg = el('article', 'msg ai');
  const avatar = el('div', 'ai-avatar', '✦');
  avatar.setAttribute('aria-hidden', 'true');
  const body = el('div', 'ai-body');
  const stream = createStream(body, animate);
  const meta = el('div', 'ai-meta');
  const metaText = answer.kind === 'guide'
    ? t('ans.metaGuide', { n: answer.points.length, kind: answerMode === 'deep' ? t('ans.kindDeep') : t('ans.kindFast') })
    : answerMode === 'deep' ? t('ans.metaDeepText') : t('ans.metaFastText');
  meta.append(el('span', 'who', t('ans.who')), el('span', 'dot'), el('span', '', metaText));
  body.append(meta);

  let thinking = null;
  if (stream.on) {
    thinking = el('div', 'typing');
    thinking.append(el('i'), el('i'), el('i'));
    body.append(thinking);
  }

  if (!answer.found) {
    body.append(stream.add(el('p', 'ans-lead', answer.lead)), stream.add(el('p', 'ans-p', answer.detail)));
    body.append(stream.add(button('act-btn', t('ans.browseAll'), 'book-open', openCatalog), 'reveal'));
  } else if (answer.kind === 'guide') {
    body.append(stream.add(el('h2', 'ans-lead', answer.lead)));
    const points = el('div', 'guide-points');
    for (const [index, point] of answer.points.entries()) {
      const block = stream.add(el('section', 'guide-point'), 'reveal');
      const heading = el('div', 'guide-heading');
      heading.append(el('span', 'guide-index', String(index + 1).padStart(2, '0')));
      heading.append(stream.add(el('h3', 'guide-title', point.item.t)));
      block.append(heading, stream.add(el('p', 'guide-summary', point.summary)));
      if (answerMode === 'deep') {
        if (point.cost) addSection(block, t('ans.costShort'), point.cost, stream);
        if (point.caution) addSection(block, t('ans.boundShort'), point.caution, stream);
      }
      const foot = el('div', 'guide-foot');
      if (point.item.grade) foot.append(el('span', `grade ${point.item.grade.toLowerCase()}`, t('ans.grade', { g: point.item.grade })));
      foot.append(button('ref-link', t('ans.sourceRef', { ref: `${point.item.ch}.${point.item.num}` }), 'arrow-up-right', () => openEntry(point.item)));
      block.append(stream.add(foot, 'reveal'));
      if (answerMode === 'deep') block.append(stream.add(createSourceDetails(point.item), 'reveal'));
      points.append(block);
    }
    body.append(points);
    if (answer.askNext) body.append(stream.add(el('p', 'guide-next', answer.askNext)));
    const actions = el('div', 'ans-actions');
    actions.append(button('act-btn', t('ans.copySummary'), 'copy', async () => {
      try {
        await navigator.clipboard.writeText(`${answer.lead}\n${answer.points.map((p) => `${p.item.ch}.${p.item.num} ${p.item.t}\n${p.summary}`).join('\n\n')}\n${t('ans.sourceLabel')}${SOURCE}`);
        toast(t('ans.copied'));
      } catch { toast(t('ans.copyFail')); }
    }));
    body.append(stream.add(actions, 'reveal'));
  } else {
    const item = answer.item;
    body.append(stream.add(el('h2', 'ans-lead', answer.action)));
    if (answer.point) body.append(stream.add(el('p', 'ans-point', answer.point)));
    if (answer.lead) body.append(stream.add(el('p', 'ans-p', answer.lead)));

    if (answer.steps && answer.steps.length >= 2) {
      const sec = el('div', 'ans-sec');
      sec.append(stream.add(el('div', 'ans-sec-h', t('ans.steps'))));
      const list = el('ol', 'steps');
      answer.steps.forEach((text, i) => {
        const li = stream.add(el('li', '', text));
        li.dataset.n = String(i + 1);
        list.append(li);
      });
      sec.append(list);
      body.append(sec);
    }

    if (answer.numbers && answer.numbers.length) {
      const sec = el('div', 'ans-sec');
      sec.append(stream.add(el('div', 'ans-sec-h', t('ans.numbers'))));
      const chips = answer.numbers.filter((num) => !num.ctx);
      const rows = answer.numbers.filter((num) => num.ctx);
      if (chips.length) {
        const strip = el('div', 'num-chips');
        for (const num of chips) strip.append(stream.add(el('span', 'num-chip', num.v), 'reveal'));
        sec.append(strip);
      }
      if (rows.length) {
        const wrap = el('div', 'nums');
        for (const num of rows) {
          const row = el('div', 'num');
          row.append(el('span', 'num-k', num.v), el('span', 'num-v', num.ctx));
          wrap.append(stream.add(row, 'reveal'));
        }
        sec.append(wrap);
      }
      body.append(sec);
    }

    if (answer.benefit) {
      const sec = el('div', 'ans-sec');
      sec.append(stream.add(el('div', 'ans-sec-h', t('ans.basis'))));
      sec.append(stream.add(el('blockquote', 'quote', answer.benefit)));
      body.append(sec);
    }

    if (answerMode === 'deep') {
      addSection(body, t('ans.cost'), answer.cost, stream);
      addSection(body, t('ans.caution'), answer.caution, stream);
    }

    const gradeRow = el('div', 'grade-row');
    if (item.grade) gradeRow.append(el('span', `grade ${item.grade.toLowerCase()}`, t('ans.gradeLong', { g: item.grade })));
    gradeRow.append(createSourceDetails(item));
    body.append(stream.add(gradeRow, 'reveal'));

    if (answer.related.length) {
      const related = el('div', 'rel');
      related.append(stream.add(el('div', 'ans-sec-h', t('ans.related'))));
      for (const candidate of answer.related) {
        const link = el('button', 'rel-item');
        link.type = 'button';
        link.append(el('span', 'rel-n', `${candidate.ch}.${candidate.num}`));
        const title = el('span', 'rel-t', candidate.t);
        title.append(el('small', 'rel-ch', t('ans.relCh', { n: candidate.ch, t: candidate.chT })));
        link.append(title);
        link.addEventListener('click', () => openEntry(candidate));
        related.append(stream.add(link, 'reveal'));
      }
      body.append(related);
    }

    const actions = el('div', 'ans-actions');
    actions.append(button('act-btn', t('ans.readSource'), 'book-open', () => openEntry(item)));
    actions.append(button('act-btn', t('ans.copy'), 'copy', async () => {
      try {
        await navigator.clipboard.writeText(`${item.t}\n${answer.lead}\n${t('ans.sourceLabel')}${sourceUrl(item)}`);
        toast(t('ans.copied'));
      } catch { toast(t('ans.copyFail')); }
    }));
    body.append(stream.add(actions, 'reveal'));
  }

  msg.append(avatar, body);
  $('#messages').append(msg);
  icons();
  if (stream.on) {
    setTimeout(() => {
      thinking?.remove();
      runStream(stream);
    }, 240);
  }
  return stream;
}

function createSourceDetails(item) {
  const details = el('details', 'source-details');
  details.append(el('summary', 'src-toggle', t('ans.sourceToggle')));
  const content = el('div', 'src-body');
  if (item.src) content.append(el('p', '', item.src));
  if (item.note) content.append(el('p', '', t('ans.note', { n: item.note })));
  for (const raw of new Set((item.src || '').match(/https?:\/\/[^\s<>]+/g) || [])) {
    const url = raw.replace(/[，。；,;]+$/, '');
    const a = el('a', 'src-link', url);
    a.href = url;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    content.append(a);
  }
  details.append(content);
  return details;
}

function addSection(parent, label, value, stream) {
  if (!value) return;
  const section = el('div', 'ans-sec');
  const head = el('div', 'ans-sec-h', label);
  const text = el('p', 'ans-p', value);
  section.append(head, text);
  parent.append(section);
  if (stream) {
    stream.add(head);
    stream.add(text);
  }
}

function sourceUrl(item) {
  return `${SOURCE}/blob/main/book/${encodeURIComponent(`${String(item.ch).padStart(2, '0')}-${item.chT}.md`)}`;
}

function renderThread() {
  const conversation = currentConversation();
  $('#messages').replaceChildren();
  $('#welcome').hidden = !!conversation?.turns.length;
  if (conversation) {
    conversation.turns.forEach((turn, idx) => {
      const query = turn.query || toQuery(turn.q);
      const previous = isFollowUp(query)
        ? turn.context || conversation.turns.slice(0, idx).reverse().find((old) => !isFollowUp(old.q))?.q || '' : '';
      appendTurn(turn.q, answerQuestion(query, turn.mode, previous ? toQuery(previous) : ''), turn.mode);
    });
  }
  requestAnimationFrame(scrollThread);
}

function sendQuestion(value, forcedQuery) {
  const q = value.trim().slice(0, 600);
  if (!q) return;
  const query = forcedQuery || toQuery(q);
  if (route.screen !== 'chat') navigate({ screen: 'chat' });
  let conversation = currentConversation();
  if (!conversation) {
    conversation = { id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, title: q.slice(0, 28), turns: [] };
    conversations.unshift(conversation);
    activeId = conversation.id;
  }
  const context = isFollowUp(query)
    ? [...conversation.turns].reverse().find((turn) => !isFollowUp(turn.q))?.q || conversation.turns[0]?.context || ''
    : '';
  const answer = answerQuestion(query, mode, context ? toQuery(context) : '');
  conversation.turns.push({ q, query, mode, context });
  conversation.turns = conversation.turns.slice(-60);
  conversations = [conversation, ...conversations.filter((c) => c.id !== conversation.id)].slice(0, 20);
  $('#welcome').hidden = true;
  appendTurn(q, answer, mode, true);
  $('#input').value = '';
  updateComposer();
  $('#input').blur();
  saveConversations();
  requestAnimationFrame(scrollThread);
}

function newConversation() {
  activeId = null;
  saveConversations();
  closeDrawer();
  $('#input').value = '';
  updateComposer();
  if (route.screen !== 'chat') navigate({ screen: 'chat' });
  renderThread();
  $('#input').focus();
}

function renderHistoryList() {
  const list = $('#history-list');
  list.replaceChildren();
  if (!conversations.length) list.append(el('p', 'history-empty', t('history.empty')));
  for (const conversation of conversations) {
    const row = el('div', 'history-row');
    const entry = el('button', `history-entry${activeId === conversation.id ? ' selected' : ''}`, conversation.title);
    entry.type = 'button';
    entry.title = conversation.title;
    if (activeId === conversation.id) entry.setAttribute('aria-current', 'page');
    entry.addEventListener('click', () => {
      activeId = conversation.id;
      saveConversations();
      closeDrawer();
      if (route.screen !== 'chat') navigate({ screen: 'chat' });
      renderThread();
    });
    const remove = el('button', 'history-delete');
    remove.type = 'button';
    remove.setAttribute('aria-label', t('history.deleteNamed', { t: conversation.title }));
    remove.title = t('history.delete');
    remove.append(icon('trash-2'));
    remove.addEventListener('click', () => {
      if (!confirm(t('history.confirm', { t: conversation.title }))) return;
      conversations = conversations.filter((saved) => saved.id !== conversation.id);
      if (activeId === conversation.id) {
        activeId = conversations[0]?.id || null;
        renderThread();
      }
      saveConversations();
      renderHistoryList();
    });
    row.append(entry, remove);
    list.append(row);
  }
  icons();
}

function renderCatalog() {
  const body = $('#reader-body');
  body.replaceChildren();
  const header = el('div', 'catalog-header');
  header.append(el('h1', '', t('catalog.title')), el('p', '', t('catalog.meta', { chapters: book.length, items: items.length })));
  const credit = el('p', 'catalog-credit');
  const original = el('a', '', t('catalog.original'));
  original.href = `${SOURCE}`;
  original.target = '_blank';
  original.rel = 'noopener noreferrer';
  const license = el('a', '', 'CC BY 4.0');
  license.href = 'https://creativecommons.org/licenses/by/4.0/';
  license.target = '_blank';
  license.rel = 'noopener noreferrer';
  credit.append(original, document.createTextNode(' · '), license, document.createTextNode(` · ${t('catalog.adapted')}`));
  header.append(credit);
  body.append(header);
  for (const chapter of book) {
    const group = el('section', 'chapter-group');
    const chapterItems = items.filter((item) => item.ch === chapter.n);
    const toggle = el('button', 'ch-card');
    toggle.type = 'button';
    toggle.setAttribute('aria-expanded', 'false');
    toggle.append(el('span', 'ch-num', String(chapter.n).padStart(2, '0')));
    const labels = el('span', 'ch-labels');
    labels.append(el('span', 'ch-t', chapter.t), el('span', 'ch-d', t('catalog.entries', { n: chapterItems.length })));
    toggle.append(labels, icon('chevron-right'));
    const entries = el('div', 'chapter-entries');
    entries.hidden = true;
    entries.append(button('chapter-read', t('reader.readChapter'), 'book-open', () => navigate({ screen: 'reader', chapter: chapter.n })));
    for (const item of chapterItems) {
      const row = el('button', 'chapter-entry');
      row.type = 'button';
      row.append(el('span', 'entry-num', String(item.num)), el('span', '', item.t));
      row.addEventListener('click', () => openEntry(item));
      entries.append(row);
    }
    toggle.addEventListener('click', () => {
      entries.hidden = !entries.hidden;
      toggle.setAttribute('aria-expanded', String(!entries.hidden));
      toggle.classList.toggle('expanded', !entries.hidden);
    });
    group.append(toggle, entries);
    body.append(group);
  }
  icons();
  body.scrollTop = 0;
}

function scrollToEntry(num) {
  requestAnimationFrame(() => {
    const entry = document.getElementById(`entry-${num}`);
    if (entry) entry.scrollIntoView({ block: 'start' });
  });
}

function renderChapter(chapter, entry) {
  const body = $('#reader-body');
  body.replaceChildren();
  const chapterItems = items.filter((item) => item.ch === chapter.n);
  const wrapper = el('article', 'md-body');
  wrapper.innerHTML = renderMarkdown(chapter.md.replace(/^\[← 回总目录\][^\n]*\n/, ''));
  const headings = wrapper.querySelectorAll('h3');
  headings.forEach((heading, index) => {
    const item = chapterItems[index];
    if (!item) return;
    heading.id = `entry-${item.num}`;
    heading.classList.add('entry-heading');
    const ask = button('ask-this', t('reader.askThis'), 'arrow-up-right', () => {
      navigate({ screen: 'chat' });
      $('#input').value = t('reader.askThisValue', { t: item.t });
      updateComposer();
      $('#input').focus();
    });
    heading.after(ask);
  });
  body.append(wrapper);
  icons();
  if (entry) scrollToEntry(entry);
  else body.scrollTop = 0;
}

function renderReader() {
  const chapter = book.find((b) => b.n === route.chapter);
  $('#reader-title').textContent = chapter ? t('reader.chapter', { n: chapter.n }) : t('reader.all');
  $('#reader-search').hidden = !searchOpen;
  if (searchOpen && $('#reader-search-input').value.trim()) renderReaderResults();
  else if (chapter) renderChapter(chapter, route.entry);
  else renderCatalog();
}

function renderReaderResults() {
  const query = $('#reader-search-input').value.trim();
  if (!query) { renderReader(); return; }
  const body = $('#reader-body');
  body.replaceChildren();
  const exact = items.filter((item) => `${item.t} ${item.plain} ${item.chT}`.toLowerCase().includes(query.toLowerCase()));
  const ranked = search(query, { topK: 70 });
  const matches = [...new Map([...exact, ...(ranked.top >= 10 ? ranked.items.map((r) => r.item) : [])]
    .map((item) => [item.id, item])).values()].slice(0, 80);
  body.append(el('p', 'search-count', matches.length
    ? t('search.hits', { n: matches.length, more: matches.length === 80 ? '+' : '' })
    : t('search.none')));
  for (const item of matches) {
    const row = el('button', 'search-result');
    row.type = 'button';
    row.append(el('span', 'result-ref', `${item.ch}.${item.num} · ${item.chT}`), el('span', 'result-title', item.t), el('span', 'result-snippet', item.plain));
    row.addEventListener('click', () => {
      $('#reader-search-input').value = '';
      navigate({ screen: 'reader', chapter: item.ch, entry: item.num });
    });
    body.append(row);
  }
  body.scrollTop = 0;
}

function wireEvents() {
  $('#btn-menu').addEventListener('click', openDrawer);
  $('#drawer-mask').addEventListener('click', closeDrawer);
  $('#btn-new').addEventListener('click', newConversation);
  $('#btn-attach').addEventListener('click', openCatalog);
  $('#btn-open-reader').addEventListener('click', openCatalog);
  $('#btn-reader-back').addEventListener('click', back);
  $('#btn-reader-search').addEventListener('click', () => {
    searchOpen = !searchOpen;
    $('#reader-search-input').value = '';
    renderReader();
    if (searchOpen) $('#reader-search-input').focus();
  });
  $('#reader-search-input').addEventListener('input', renderReaderResults);
  $('#btn-open-history').addEventListener('click', () => {
    $('#history-list').hidden = !$('#history-list').hidden;
    renderHistoryList();
  });
  $('#btn-random').addEventListener('click', () => {
    closeDrawer();
    sendQuestion(randomItem().t);
  });
  $('#btn-lucky').addEventListener('click', shuffleEntry);
  $('#btn-lucky-row').addEventListener('click', shuffleEntry);
  $('#btn-clear').addEventListener('click', () => {
    if (!confirm(t('history.clearConfirm'))) return;
    conversations = [];
    activeId = null;
    try {
      localStorage.removeItem(STORE_KEY);
      localStorage.removeItem(ACTIVE_KEY);
    } catch { /* Private storage may be unavailable. */ }
    closeDrawer();
    if (route.screen !== 'chat') navigate({ screen: 'chat' });
    renderThread();
    toast(t('history.cleared'));
  });
  $('#input').addEventListener('input', updateComposer);
  $('#input').addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && !event.shiftKey && !event.isComposing) {
      event.preventDefault();
      sendQuestion($('#input').value);
    }
  });
  $('#btn-send').addEventListener('click', () => sendQuestion($('#input').value));
  document.querySelectorAll('.mode-chip').forEach((chip) => chip.addEventListener('click', () => {
    mode = chip.dataset.mode;
    document.querySelectorAll('.mode-chip').forEach((other) => {
      other.classList.toggle('is-on', other === chip);
      other.setAttribute('aria-pressed', String(other === chip));
    });
    const last = currentConversation()?.turns.at(-1);
    if (last && last.mode !== mode) {
      last.mode = mode;
      saveConversations();
      renderThread();
    }
  }));
  window.addEventListener('popstate', (event) => {
    route = event.state?.guide ? event.state : { screen: 'chat' };
    closeDrawer();
    renderRoute();
  });
  document.addEventListener('click', async (event) => {
    const anchor = event.target.closest('a[href]');
    if (!anchor) return;
    const url = anchor.href;
    if (!/^https?:\/\//i.test(url)) return;
    if (!Capacitor.isNativePlatform()) return;
    event.preventDefault();
    try { await Browser.open({ url }); }
    catch { toast(t('link.fail')); }
  });
  document.querySelectorAll('.lang-chip').forEach((chip) => chip.addEventListener('click', () => {
    const value = chip.dataset.lang;
    if (value === getPref()) return;
    setPref(value);
    location.reload();
  }));
  if (Capacitor.isNativePlatform()) App.addListener('backButton', back);
}

async function boot() {
  try {
    const [_, bookResponse] = await Promise.all([loadData(), fetch('data/book.json')]);
    if (!bookResponse.ok) throw new Error(`Book request failed: ${bookResponse.status}`);
    book = await bookResponse.json();
    items = getItems();
    if (!book.length || !items.length) throw new Error('Empty guide data');
    readConversations();
    mode = currentConversation()?.turns.at(-1)?.mode || 'fast';
    document.querySelectorAll('.mode-chip').forEach((chip) => {
      chip.classList.toggle('is-on', chip.dataset.mode === mode);
      chip.setAttribute('aria-pressed', String(chip.dataset.mode === mode));
    });
    document.querySelectorAll('.lang-chip').forEach((chip) => {
      const on = chip.dataset.lang === getPref();
      chip.classList.toggle('is-on', on);
      chip.setAttribute('aria-pressed', String(on));
    });
    $('#drawer-chapters').textContent = t('drawer.chapters', { n: book.length });
    history.replaceState({ guide: true, screen: 'chat' }, '', location.pathname + location.search + '#chat');
    renderSuggestions();
    wireEvents();
    renderThread();
    icons();
    $('#app').hidden = false;
    $('#boot').hidden = true;
  } catch (error) {
    console.error('Guide failed to start', error);
    const bootScreen = $('#boot');
    bootScreen.replaceChildren(el('p', 'boot-text', t('boot.fail')));
    bootScreen.append(button('boot-retry', t('boot.retry'), null, () => location.reload()));
  }
}

boot();
