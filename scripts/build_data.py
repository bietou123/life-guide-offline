#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""把 HowToLiveBetter 原文解析成结构化条目 + 检索索引。"""
import json, os, re, sys, glob, math, unicodedata

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'data-book')
OUT = os.path.join(ROOT, 'public', 'data')
os.makedirs(OUT, exist_ok=True)

FIELD_RE = re.compile(r'^- ([^：:\n]{1,8})[：:]\s*(.*)$')

def norm(s: str) -> str:
    s = unicodedata.normalize('NFKC', s or '')
    return s.strip()

def parse_file(path):
    raw = open(path, encoding='utf-8').read()
    lines = raw.split('\n')
    ch_title = ''
    ch_num = 0
    for ln in lines:
        if ln.startswith('# '):
            ch_title = ln[2:].strip()
            m = re.match(r'(\d+)[\.、]\s*(.*)', ch_title)
            if m:
                ch_num = int(m.group(1))
                ch_title = m.group(2).strip()
            break
    # 章引言：从第一个 ### 之前去掉标题行
    first_item = raw.find('\n### ')
    head = raw[:first_item] if first_item > 0 else raw[:1200]
    intro = '\n'.join(l for l in head.split('\n')[1:]
                      if l.strip() and not l.startswith('[←') and not l.startswith('# ')).strip()

    items = []
    for block in re.split(r'\n(?=### )', raw):
        if not block.startswith('### '):
            continue
        bl = block.strip('\n').split('\n')
        title = bl[0][4:].strip()
        m = re.match(r'(\d+)[\.、]\s*(.*)', title)
        num = int(m.group(1)) if m else len(items) + 1
        if m:
            title = m.group(2).strip()
        body = '\n'.join(bl[1:])
        tag = {}
        tm = re.search(r'<!--\s*成本标签:\s*(.*?)-->', body)
        if tm:
            for kv in tm.group(1).split():
                if '=' in kv:
                    k, v = kv.split('=', 1)
                    tag[k] = v
        fields = {}
        cur = None
        for ln in body.split('\n'):
            fm = FIELD_RE.match(ln)
            if fm:
                cur = fm.group(1).strip()
                fields[cur] = fm.group(2).strip()
            elif cur and ln.strip() and not ln.startswith('<!--') and not ln.startswith('>'):
                fields[cur] += ' ' + ln.strip()
        items.append({
            'num': num,
            'title': title,
            'tags': tag,
            'cost': fields.get('成本', ''),
            'plain': fields.get('说人话', ''),
            'gain': fields.get('收益', ''),
            'grade': fields.get('证据等级', ''),
            'source': fields.get('来源', ''),
            'note': fields.get('备注', ''),
        })
    return ch_num, ch_title, intro, items

_ = None

def tokenize(text):
    """中文 bigram + 英文数字 token。返回 list（可含重复，用于 tf）。"""
    text = unicodedata.normalize('NFKC', text or '').lower()
    toks = []
    for seg in re.findall(r'[一-鿿]+|[a-z0-9]+(?:\.[0-9]+)?', text):
        if seg[0].isascii():
            if len(seg) > 1:
                toks.append(seg)
        else:
            if len(seg) == 1:
                toks.append(seg)
            else:
                for i in range(len(seg) - 1):
                    toks.append(seg[i:i+2])
    return toks

def main():
    files = sorted(glob.glob(os.path.join(SRC, '*.md')))
    chapters, items = [], []
    for f in files:
        num, title, intro, its = parse_file(f)
        base = os.path.basename(f)
        chapters.append({
            'num': num,
            'title': title,
            'intro': intro,
            'file': base,
            'md': open(f, encoding='utf-8').read(),
            'count': len(its),
        })
        for it in its:
            it['ch'] = num
            it['chTitle'] = title
            it['id'] = len(items)
            items.append(it)

    # ---- 倒排索引 ----
    post = {}
    lens = []
    doctexts = []
    for it in items:
        # 标题重复 2 次提高权重；章名不进条目索引（章级索引单独算，避免整章泛化）
        txt = (it['title'] + ' ') * 2 + it['plain'] + ' ' + it['cost'] + ' ' + it['gain']
        doctexts.append(txt)
        toks = tokenize(txt)
        lens.append(len(toks))
        tf = {}
        for t in toks:
            tf[t] = tf.get(t, 0) + 1
        for t, c in tf.items():
            post.setdefault(t, []).append((it['id'], c))

    N = len(items)
    avgdl = sum(lens) / max(1, N)
    # 去掉超高频垃圾词（出现在 > 45% 文档中）
    drop = {t for t, v in post.items() if len(v) > N * 0.45 and not t.isdigit()}
    post = {t: v for t, v in post.items() if t not in drop}

    index = {
        'N': N,
        'avgdl': round(avgdl, 2),
        'post': post,
        'len': lens,
        'drop': len(drop),
    }

    payload_items = [{
        'id': it['id'], 'ch': it['ch'], 'chT': it['chTitle'], 'num': it['num'],
        't': it['title'], 'tag': it['tags'], 'cost': it['cost'], 'plain': it['plain'],
        'gain': it['gain'], 'grade': it['grade'], 'src': it['source'], 'note': it['note'],
    } for it in items]

    book = [{'n': c['num'], 't': c['title'], 'intro': c['intro'], 'md': c['md']} for c in chapters]

    def dump(name, obj, indent=None):
        p = os.path.join(OUT, name)
        with open(p, 'w', encoding='utf-8') as fh:
            json.dump(obj, fh, ensure_ascii=False, separators=(',', ':'))
        print(f'{name}: {os.path.getsize(p)/1024:.0f} KB')

    dump('items.json', payload_items)
    dump('index.json', index)
    dump('book.json', book)
    print('chapters', len(chapters), 'items', len(items), 'terms', len(post), 'dropped', len(drop), 'avgdl', round(avgdl))

if __name__ == '__main__':
    main()
