# 生成 Google Play 需要的图标与宣传图
from PIL import Image, ImageDraw, ImageFont
import math, os

OUT = os.path.join('shots', 'store')
os.makedirs(OUT, exist_ok=True)
FONT_BOLD = 'C:/Windows/Fonts/msyhbd.ttc'
FONT_REG = 'C:/Windows/Fonts/msyh.ttc'

STAR = [(32, 11), (37.8, 26.2), (53, 32), (37.8, 37.8), (32, 53), (26.2, 37.8), (11, 32), (26.2, 26.2)]


def star_points(cx, cy, radius):
    pts = []
    for x, y in STAR:
        pts.append((cx + (x - 32) / 21.0 * radius, cy + (y - 32) / 21.0 * radius))
    return pts


def make_icon(size=1024, out='icon-512.png'):
    # 4 倍超采样，缩小后边缘更干净
    big = size * 2
    im = Image.new('RGB', (big, big), '#000000')
    d = ImageDraw.Draw(im)
    d.polygon(star_points(big / 2, big / 2, big * 0.42), fill='#ffffff')
    im.resize((size, size), Image.LANCZOS).save(os.path.join(OUT, out))
    print('icon', os.path.join(OUT, out))


def make_feature(out='feature-1024x500.png'):
    W, H = 2048, 1000
    im = Image.new('RGB', (W, H), '#000000')
    # 左侧一圈很淡的青色光晕，和 App 内的青绿点缀呼应
    glow = Image.new('RGB', (W, H), '#000000')
    gd = ImageDraw.Draw(glow)
    for r in range(600, 0, -6):
        t = 1 - r / 600
        c = (int(12 * t), int(46 * t), int(40 * t))
        gd.ellipse((240 - r, H / 2 - r, 240 + r, H / 2 + r), fill=c)
    im = Image.blend(im, glow, 0.9)
    d = ImageDraw.Draw(im)
    d.polygon(star_points(300, H / 2, 150), fill='#ffffff')

    title = ImageFont.truetype(FONT_BOLD, 150)
    sub = ImageFont.truetype(FONT_REG, 58)
    d.text((560, 330), '人生指南', font=title, fill='#ffffff', anchor='lm')
    d.text((566, 500), '离线实证生活决策助手', font=sub, fill='#c9cfd4', anchor='lm')
    d.text((566, 590), '767 条建议 · 完全离线 · 可回到原文', font=sub, fill='#6b7480', anchor='lm')
    im.resize((1024, 500), Image.LANCZOS).save(os.path.join(OUT, out))
    print('feature', os.path.join(OUT, out))


make_icon(512)
make_feature()
