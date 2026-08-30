#!/usr/bin/env python3
"""
Smart Marp -> HTML slide converter with per-deck accent colors.

Reads Marp .md from:  ~/Documents/Obsidian Vault/AP Business with Personal Finance/Slides/
Writes themed HTML to: APBusiness/slides/

Design: bright light theme; each deck gets its own accent color;
semantic colors (think=blue, warn=amber, danger=coral) stay constant.
Hand-crafted decks 0.0 and 1.1 are NOT overwritten.
"""
import re
import sys
from pathlib import Path

SRC = Path("/home/yorkgf/Documents/Obsidian Vault/AP Business with Personal Finance/Slides")
DST = Path(__file__).parent / "slides"
DST.mkdir(exist_ok=True)

# Decks to convert (0.0 and 1.1 are hand-crafted, skipped)
TARGETS = ["1.2","1.3","1.4","1.5","1.6","1.7","1.8",
           "2.1","2.2","2.3","2.4","2.5","2.6","2.7"]

# ── Per-deck palettes ─────────────────────────────────────────────────────────
# accent = main   accent_d = dark   accent_l = light   accent_xd = extra dark   tint = soft bg
PALETTES = {
    "1.2": dict(accent="#2563eb", accent_d="#1d4ed8", accent_l="#93c5fd", accent_xd="#1e40af", tint="#eff6ff"),
    "1.3": dict(accent="#4f46e5", accent_d="#4338ca", accent_l="#a5b4fc", accent_xd="#3730a3", tint="#eef2ff"),
    "1.4": dict(accent="#7c3aed", accent_d="#6d28d9", accent_l="#c4b5fd", accent_xd="#5b21b6", tint="#f5f3ff"),
    "1.5": dict(accent="#d97706", accent_d="#b45309", accent_l="#fcd34d", accent_xd="#92400e", tint="#fffbeb"),
    "1.6": dict(accent="#0d9488", accent_d="#0f766e", accent_l="#5eead4", accent_xd="#115e59", tint="#f0fdfa"),
    "1.7": dict(accent="#e11d48", accent_d="#be123c", accent_l="#fda4af", accent_xd="#9f1239", tint="#fff1f2"),
    "1.8": dict(accent="#ea580c", accent_d="#c2410c", accent_l="#fdba74", accent_xd="#9a3412", tint="#fff7ed"),
    "2.1": dict(accent="#db2777", accent_d="#be185d", accent_l="#f9a8d4", accent_xd="#9d174d", tint="#fdf2f8"),
    "2.2": dict(accent="#f43f5e", accent_d="#e11d48", accent_l="#fda4af", accent_xd="#be123c", tint="#fff1f2"),
    "2.3": dict(accent="#0891b2", accent_d="#0e7490", accent_l="#67e8f9", accent_xd="#155e75", tint="#ecfeff"),
    "2.4": dict(accent="#65a30d", accent_d="#4d7c0f", accent_l="#bef264", accent_xd="#3f6212", tint="#f7fee7"),
    "2.5": dict(accent="#059669", accent_d="#047857", accent_l="#6ee7b7", accent_xd="#065f46", tint="#ecfdf5"),
    "2.6": dict(accent="#0284c7", accent_d="#0369a1", accent_l="#7dd3fc", accent_xd="#075985", tint="#f0f9ff"),
    "2.7": dict(accent="#c026d3", accent_d="#a21caf", accent_l="#f0abfc", accent_xd="#86198f", tint="#fdf4ff"),
}

# ── Helpers ────────────────────────────────────────────────────────────────────
def slugify(name: str) -> str:
    s = re.sub(r'[\\/:*?"<>|]', '', name).replace(' ', '_')
    return s.strip('_') + ".html"


def parse_frontmatter(text):
    meta = {}
    body = text
    m = re.match(r'^---\s*\n(.*?)\n---\s*\n', text, re.DOTALL)
    if m:
        body = text[m.end():]
        for line in m.group(1).splitlines():
            if ':' in line:
                k, _, v = line.partition(':')
                meta[k.strip()] = v.strip().strip("'\"")
    return meta, body


def split_slides(body):
    parts = re.split(r'\n^---\s*$\n?', body, flags=re.MULTILINE)
    return [p.strip() for p in parts if p.strip()]


def md_inline(t):
    t = re.sub(r'`([^`]+)`', r'<code class="sc">\1</code>', t)
    t = re.sub(r'\*\*\*(.+?)\*\*\*', r'<strong><em>\1</em></strong>', t)
    t = re.sub(r'\*\*(.+?)\*\*', r'<strong>\1</strong>', t)
    t = re.sub(r'(?<!\*)\*(?!\*)(.+?)\*(?!\*)', r'<em>\1</em>', t)
    t = re.sub(r'\[([^\]]+)\]\(([^)]+)\)', r'<a href="\2" target="_blank">\1</a>', t)
    return t


def video_embed(url):
    yt = re.search(r'youtube\.com/watch\?v=([a-zA-Z0-9_-]+)', url) or re.search(r'youtu\.be/([a-zA-Z0-9_-]+)', url)
    if yt:
        return f'<div class="video-frame"><iframe src="https://www.youtube.com/embed/{yt.group(1)}" frameborder="0" allowfullscreen></iframe></div>'
    bv = re.search(r'bilibili\.com/video/(BV[a-zA-Z0-9]+)', url)
    if bv:
        return f'<div class="video-frame"><iframe src="https://player.bilibili.com/player.html?bvid={bv.group(1)}&autoplay=0" frameborder="0" allowfullscreen></iframe></div>'
    return f'<p class="vl"><a href="{url}" target="_blank">&#9654; Watch video</a></p>'


def classify_callout(text):
    t = md_inline(text).lower()
    if 'think first' in t or '🤔' in text:
        return 'think'
    if 'wrong answer' in t or '⚠️' in text or 'red flag' in t:
        return 'danger'
    if any(w in t for w in ['exam', 'signal', 'rule', 'strategy', 'remember', 'warning', 'note', 'trap', 'important', 'tell', 'tip', 'boundary', 'the pair', 'pattern']):
        return 'warn'
    return 'key'


def strip_md(s):
    return re.sub(r'[*`]', '', s)


# ── Slide converter ─────────────────────────────────────────────────────────────
class Slide:
    def __init__(self, md):
        self.md = md
        self.raw_lines = md.splitlines()
        self.is_invert = bool(re.search(r'_class:\s*invert', md))
        self.is_lead = bool(re.search(r'_class:\s*lead', md))
        self.is_hero = self.is_invert or self.is_lead
        self.title = self._first_heading()
        self.is_answer = bool(re.search(r'([-—–]\s*[Aa]nswer|Q\d+\s+[Aa]nswer)', self.title or ''))
        self.is_practice_q = bool(re.search(r'Q\d+', self.title or '')) and not self.is_answer
        self.is_stimulus = bool(re.search(r'stimulus', (self.title or ''), re.I))

    def _first_heading(self):
        for ln in self.raw_lines:
            h = re.match(r'^#{1,4}\s+(.*)', ln)
            if h:
                return strip_md(h.group(1)).strip()
        return ''


def convert_hero(s: Slide) -> str:
    lines = s.raw_lines
    h1 = h3 = para = ''
    chips = []
    for ln in lines:
        if re.match(r'\s*<!--', ln):
            continue
        m = re.match(r'^#\s+(.*)', ln)
        if m and not h1:
            h1 = md_inline(m.group(1))
            continue
        m = re.match(r'^###\s+(.*)', ln)
        if m and not h3:
            h3 = md_inline(m.group(1))
            continue
        m = re.match(r'^##\s+(.*)', ln)
        if m and not h1:
            h1 = md_inline(m.group(1))
            continue
        m = re.match(r'^\*\*(.*?)\*\*\s*(.*)', ln)
        if m and not para:
            chips.append(md_inline(f'**{m.group(1)}**{m.group(2)}'))
            continue
        if ln.strip() and not para and 'youtu' not in ln and 'bilibili' not in ln and '🎬' not in ln:
            para = md_inline(ln)
    parts = []
    if h3:
        parts.append(f'<div class="eyebrow">{h3}</div>')
    parts.append(f'<h1>{h1 or ""}</h1>')
    parts.append('<hr class="divider">')
    if para:
        parts.append(f'<div class="tag">{para}</div>')
    for c in chips:
        parts.append(f'<span class="chip">{c}</span>')
    return '\n'.join(parts)


def convert_slide(s: Slide, mode: str, kicker: str) -> str:
    if s.is_hero:
        inner = convert_hero(s)
        if s.is_invert:
            return f'<div class="slide invert"><div class="inner hero">{inner}</div></div>'
        return f'<div class="slide"><div class="inner hero">{inner}</div></div>'

    out = []
    table_rows = []
    in_ul = in_ol = False
    answer_card = False
    in_traps = False
    in_answer = s.is_answer
    k = kicker or 'Lesson'

    def flush_list():
        nonlocal in_ul, in_ol
        if in_ul: out.append('</ul>'); in_ul = False
        if in_ol: out.append('</ol>'); in_ol = False

    def flush_table():
        nonlocal table_rows
        if not table_rows: return
        out.append('<div class="tbl-wrap"><table>')
        for i, row in enumerate(table_rows):
            cells = [c.strip() for c in row.split('|')[1:-1]]
            if i == 0:
                out.append('<thead><tr>' + ''.join(f'<th>{md_inline(c)}</th>' for c in cells) + '</tr></thead><tbody>')
            elif all(re.match(r'^-+$', c.strip()) for c in cells):
                continue
            else:
                out.append('<tr>' + ''.join(f'<td>{md_inline(c)}</td>' for c in cells) + '</tr>')
        out.append('</tbody></table></div>')
        table_rows = []

    def close_answer():
        nonlocal answer_card
        if answer_card:
            out.append('</div>')
            answer_card = False

    lines = s.raw_lines
    i = 0

    # ── Pre-handling by slide type ─────────────────────────────────────────
    # Practice question: title becomes a .q-num badge; options become .opt
    if s.is_practice_q:
        qm = re.search(r'Q(\d+)', s.title)
        qno = qm.group(1) if qm else '?'
        qtext = re.sub(r'^Practice\s*[—–-]\s*', '', s.title)
        qtext = re.sub(r'^Q\d+\s*[—–-]\s*', '', qtext)
        out.append(f'<div class="q-num"><span class="n">Q{qno}</span>{md_inline(qtext)}</div>')
        # skip the title heading line(s)
        while i < len(lines):
            if re.match(r'^#{2,4}\s+', lines[i]):
                i += 1
                break
            i += 1

    # Stimulus: wrap scenario body in a .stimulus card
    if s.is_stimulus:
        # collect all content lines (skip title heading + comments)
        body_lines = []
        for ln in lines:
            if re.match(r'^#{2,4}\s+', ln) or re.match(r'^\s*<!--', ln):
                continue
            body_lines.append(ln)
        joined = '\n'.join(body_lines).strip()
        # convert inner markdown lightly
        inner_html = ''
        for para in re.split(r'\n\s*\n', joined):
            para = para.strip()
            if not para:
                continue
            if para.startswith('|'):
                inner_html += f'<div class="tbl-wrap"><table>'
                rows = [r.strip() for r in para.splitlines() if r.strip()]
                for r_i, row in enumerate(rows):
                    cells = [c.strip() for c in row.split('|')[1:-1]]
                    if r_i == 0:
                        inner_html += '<thead><tr>' + ''.join(f'<th>{md_inline(c)}</th>' for c in cells) + '</tr></thead><tbody>'
                    elif all(re.match(r'^-+$', c.strip()) for c in cells):
                        continue
                    else:
                        inner_html += '<tr>' + ''.join(f'<td>{md_inline(c)}</td>' for c in cells) + '</tr>'
                inner_html += '</tbody></table></div>'
            elif para.startswith('- '):
                inner_html += '<ul>'
                for li in para.splitlines():
                    if li.strip().startswith('- '):
                        inner_html += f'<li>{md_inline(li.strip()[2:])}</li>'
                    elif re.match(r'^\s+\d+\.\s', li):
                        inner_html += f'<li style="list-style:none;margin-left:1em">{md_inline(re.sub(r"^\s+\d+\.\s+", "", li.strip()))}</li>'
                inner_html += '</ul>'
            else:
                inner_html += f'<p>{md_inline(para)}</p>'
        out.append(f'<div class="stimulus"><h4>Scenario</h4>{inner_html}</div>')
        return f'<div class="inner"><div class="kicker">Stimulus</div>{chr(10).join(out)}</div>'

    # Answer slide: title -> answer badge (kicker skipped)
    if in_answer:
        letter = ''
        # body: **Answer: X.** (decks 2.x) or **Answer: X.** on its own line
        for ln in lines:
            am = re.search(r'\*\*Answer:?\s*([A-D])', ln)
            if am:
                letter = am.group(1)
                break
        # title: "Q1 — Answer: **A**" or "Q1 — Answer: A"
        if not letter:
            am = re.search(r'Answer:\s*\*\*([A-D])', s.title) or re.search(r'Answer:\s*([A-D])', s.title)
            letter = am.group(1) if am else ''
        out.append(f'<div class="answer-badge">Answer <span class="a">{letter}</span></div>' if letter else '<div class="answer-badge">Answer</div>')
        # skip title heading + the "**Answer: ...**" line
        while i < len(lines):
            if re.match(r'^#{2,4}\s+', lines[i]):
                i += 1
                continue
            if re.match(r'^\*\*Answer:?', lines[i]):
                i += 1
                continue
            break

    # ── Main line loop ─────────────────────────────────────────────────────
    while i < len(lines):
        ln = lines[i].rstrip()
        stripped = ln.strip()

        if re.match(r'\s*<!--', ln):
            i += 1; continue
        if stripped == '':
            flush_list(); flush_table(); close_answer(); in_traps = False
            i += 1; continue

        # Heading
        h = re.match(r'^(#{2,6})\s+(.*)', ln)
        if h:
            flush_list(); flush_table(); close_answer()
            lv = len(h.group(1))
            out.append(f'<h{lv}>{md_inline(h.group(2).strip())}</h{lv}>')
            i += 1; continue

        # Why -> answer card
        if re.match(r'^\*\*Why:\*\*', ln):
            flush_list(); flush_table()
            close_answer()
            out.append('<div class="answer-card"><h4>Why</h4>')
            answer_card = True
            rest = re.sub(r'^\*\*Why:\*\*\s*', '', ln)
            if rest:
                out.append(f'<p>{md_inline(rest)}</p>')
            j = i + 1
            while j < len(lines):
                nxt = lines[j].rstrip()
                if nxt.strip() == '' or re.match(r'^(\*\*Trap|-\s|#|\||>)', nxt):
                    break
                out.append(f'<p>{md_inline(nxt.strip())}</p>')
                j += 1
            i = j; continue

        # Trap lines
        if re.match(r'^\*\*Traps?:?\*\*', ln):
            flush_list(); flush_table(); close_answer()
            in_traps = True
            rest = re.sub(r'^\*\*Traps?:?\*\*\s*', '', ln)
            if rest:
                out.append(f'<div class="trap"><b>Trap:</b> {md_inline(rest)}</div>')
            i += 1; continue
        if re.match(r'^\*\*Trap:', ln):
            flush_list(); flush_table(); close_answer(); in_traps = False
            rest = re.sub(r'^\*\*Trap:\s*', '', ln)
            out.append(f'<div class="trap">{md_inline(rest)}</div>')
            i += 1; continue

        # Options (strip leading list/quote marker then check A./B./C./D.)
        opt_candidate = stripped
        if re.match(r'^[-*>]\s+[A-D]\.\s', opt_candidate):
            opt_candidate = re.sub(r'^[-*>]\s+', '', opt_candidate)
        if re.match(r'^[A-D]\.\s+', opt_candidate):
            flush_list(); flush_table(); close_answer(); in_traps = False
            m = re.match(r'^([A-D])\.\s+(.*)', opt_candidate)
            out.append(f'<div class="opt"><span class="letter">{m.group(1)}</span>{md_inline(m.group(2))}</div>')
            i += 1; continue

        # Table
        if stripped.startswith('|'):
            flush_list()
            table_rows.append(stripped)
            i += 1; continue

        # Video URL
        vid_line = stripped
        if vid_line.startswith('▶'):
            vid_line = vid_line[1:].strip()
        if re.match(r'^https?://(?:www\.)?(?:youtube\.com|youtu\.be|player\.bilibili\.com|bilibili\.com)/\S*$', vid_line):
            flush_list(); flush_table(); close_answer()
            out.append(video_embed(vid_line))
            i += 1; continue
        if '🎬' in stripped:
            m = re.search(r'\((https?://[^)]+)\)', stripped)
            if m:
                flush_list(); flush_table(); close_answer()
                out.append(video_embed(m.group(1)))
                i += 1; continue

        # Formula (contains minus + equals)
        plain = strip_md(stripped)
        if re.search(r'[−\-]', plain) and re.search(r'=', plain):
            flush_list(); flush_table(); close_answer()
            out.append(f'<div class="formula">{md_inline(stripped)}</div>')
            i += 1; continue

        # Definition: **Term** = rest
        dm = re.match(r'^\*\*(.+?)\*\*\s*=\s*(.*)', stripped)
        if dm:
            flush_list(); flush_table(); close_answer()
            out.append(f'<div class="def"><div class="term">{dm.group(1)}</div><div class="text">{md_inline(dm.group(2))}</div></div>')
            i += 1; continue

        # Bullet list
        if re.match(r'^[-*]\s+', stripped):
            flush_table(); close_answer()
            if in_traps:
                out.append(f'<div class="trap">{md_inline(re.sub(r"^[-*]\s+", "", stripped))}</div>')
                i += 1; continue
            if not in_ul:
                flush_list()
                out.append('<ul>')
                in_ul = True
            out.append(f'<li>{md_inline(re.sub(r"^[-*]\s+", "", stripped))}</li>')
            i += 1; continue

        # Numbered list
        if re.match(r'^\d+\.\s+', stripped):
            flush_table(); close_answer()
            if not in_ol:
                flush_list()
                out.append('<ol class="tick">')
                in_ol = True
            out.append(f'<li>{md_inline(re.sub(r"^\d+\.\s+", "", stripped))}</li>')
            i += 1; continue

        # Blockquote -> collect consecutive > lines, then split into opts / prompt / callout
        if stripped.startswith('>'):
            flush_list(); flush_table(); close_answer(); in_traps = False
            bq = []
            while i < len(lines) and lines[i].strip().startswith('>'):
                bq.append(lines[i].strip())
                i += 1
            # strip '>' markers, drop empties
            text_lines = [ln.lstrip('>').strip() for ln in bq]
            text_lines = [ln for ln in text_lines if ln]
            # split options from prose
            opts = [ln for ln in text_lines if re.match(r'^[A-D]\.\s', ln)]
            prose = [ln for ln in text_lines if not re.match(r'^[A-D]\.\s', ln)]
            for ln in opts:
                m = re.match(r'^([A-D])\.\s+(.*)', ln)
                out.append(f'<div class="opt"><span class="letter">{m.group(1)}</span>{md_inline(m.group(2))}</div>')
            if prose:
                joined = ' '.join(prose)
                if s.is_practice_q:
                    out.append(f'<div class="q-prompt">{md_inline(joined)}</div>')
                else:
                    cls = classify_callout(joined)
                    label = {'key': 'Key Point', 'think': 'Think', 'warn': 'Exam Note', 'danger': 'Warning'}[cls]
                    out.append(f'<div class="callout {cls}"><span class="tag">{label}</span>{md_inline(joined)}</div>')
            continue

        # Think-first line
        if '🤔' in stripped:
            flush_list(); flush_table(); close_answer()
            out.append(f'<div class="callout think"><span class="tag">Think</span>{md_inline(stripped.replace("🤔", "").strip())}</div>')
            i += 1; continue

        # Plain paragraph
        flush_list(); flush_table(); close_answer()
        out.append(f'<p>{md_inline(stripped)}</p>')
        i += 1

    flush_list(); flush_table(); close_answer()

    if in_answer:
        return f'<div class="inner">{chr(10).join(out)}</div>'
    return f'<div class="inner"><div class="kicker">{k}</div>{chr(10).join(out)}</div>'


# ── HTML template ─────────────────────────────────────────────────────────────
CSS = """\
* { box-sizing: border-box; margin: 0; padding: 0; }

:root {
    --accent: {accent};
    --accent-d: {accent_d};
    --accent-l: {accent_l};
    --accent-xd: {accent_xd};
    --tint: {tint};
    --bg: #f6faf6;
    --ink: #1b2b1d;
    --muted: #5f7361;
    --amber: #d97706; --amber-bg: #fff7e0;
    --blue: #2563eb;  --blue-bg: #e8f1ff;
    --coral: #dc2626; --coral-bg: #ffeded;
    --card: #ffffff;
    --border: #d7e9d9;
    --shadow: 0 3px 14px rgba(30,41,59,.08);
    --serif: 'Georgia','Times New Roman',serif;
    --mono: 'Courier New',monospace;
}

body {
    font-family: var(--serif);
    background:
        radial-gradient(900px 500px at 92% -8%, var(--tint), transparent 60%),
        radial-gradient(700px 420px at -5% 108%, var(--tint), transparent 60%),
        var(--bg);
    color: var(--ink);
    font-size: calc(17px + .4vw);
    line-height: 1.55;
    overflow: hidden;
    min-height: 100vh;
}

.bar { position: fixed; left: 0; right: 0; z-index: 200; display: flex; align-items: center; justify-content: space-between; padding: .55rem 1.3rem; font-size: .72em; letter-spacing: .04em; background: rgba(255,255,255,.9); border-color: var(--border); border-style: solid; box-shadow: 0 1px 6px rgba(30,41,59,.06); backdrop-filter: blur(6px); }
.bar.top { top: 0; border-bottom-width: 1px; }
.bar.bottom { bottom: 0; border-top-width: 1px; color: var(--muted); }
.bar .course { color: var(--accent-d); font-weight: bold; }
.bar a { color: var(--accent-d); text-decoration: none; font-weight: 600; }
.bar a:hover { text-decoration: underline; }
#sn { color: var(--accent-d); font-weight: bold; }

.stage { position: relative; height: 100vh; padding: 3rem 2.5rem 2.6rem; overflow: hidden; }
.slide { position: absolute; inset: 0; display: none; flex-direction: column; justify-content: safe center; padding: 4.8rem 4vw 2.8rem; overflow-y: auto; }
.slide.active { display: flex; animation: fade .45s ease; }
@keyframes fade { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }
.inner { width: 100%; max-width: 1060px; margin: 0 auto; }

.kicker { text-transform: uppercase; letter-spacing: .22em; font-size: .72rem; color: var(--accent-d); font-weight: 700; display: flex; align-items: center; gap: .7rem; margin-bottom: 1rem; }
.kicker::before { content: ''; width: 2.4rem; height: 3px; border-radius: 2px; background: var(--accent); }

h1 { font-size: clamp(2.4rem,6vw,4.2rem); line-height: 1.05; color: var(--ink); font-weight: 800; margin-bottom: .5rem; letter-spacing: -.01em; }
h2 { font-size: clamp(1.7rem,4vw,2.7rem); line-height: 1.12; color: var(--ink); font-weight: 800; margin-bottom: .4rem; letter-spacing: -.01em; }
h3 { font-size: clamp(1.15rem,2.5vw,1.6rem); color: var(--accent-d); font-weight: 700; margin-bottom: .5rem; }
h4 { font-size: clamp(1rem,2.2vw,1.3rem); color: var(--accent-d); font-weight: 700; margin-bottom: .4rem; }
p { margin-bottom: .85em; }
.lead-para { font-size: 1.12em; }
strong { color: var(--accent-xd); font-weight: 700; }
em { color: #40543f; }

.hero { text-align: center; }
.hero .eyebrow { text-transform: uppercase; letter-spacing: .3em; font-size: .8rem; color: var(--accent-d); font-weight: 700; margin-bottom: 1.2rem; }
.hero h1 { background: linear-gradient(120deg, var(--accent-xd) 20%, var(--accent) 75%); -webkit-background-clip: text; background-clip: text; color: transparent; }
.hero .tag { color: var(--muted); font-size: 1.12em; margin: .6rem 0 1.4rem; }
.hero .divider { width: 70px; height: 4px; border-radius: 2px; background: linear-gradient(90deg, var(--accent), var(--accent-l)); margin: 1.3rem auto; border: 0; }

.card { background: var(--card); border: 1px solid var(--border); border-radius: 16px; box-shadow: var(--shadow); padding: 1.15rem 1.4rem; }
.card h4 { color: var(--accent-d); font-size: .95rem; letter-spacing: .06em; text-transform: uppercase; margin-bottom: .5rem; font-weight: 700; }
.card p, .card li { font-size: .96em; }
.grid { display: grid; gap: 1rem; }
.grid.g2 { grid-template-columns: repeat(auto-fit, minmax(300px,1fr)); }
.grid.g3 { grid-template-columns: repeat(auto-fit, minmax(220px,1fr)); }

ul, ol { margin: 0 0 1rem 1.25em; }
li { margin-bottom: .5em; }
li::marker { color: var(--accent); }
ol.tick { list-style: none; margin-left: 0; counter-reset: t; }
ol.tick li { counter-increment: t; padding-left: 2.4rem; position: relative; margin-bottom: .75rem; }
ol.tick li::before { content: counter(t); position: absolute; left: 0; top: .08em; width: 1.6em; height: 1.6em; border-radius: 50%; background: linear-gradient(180deg, var(--accent-l), var(--accent)); border: 0; box-shadow: 0 2px 6px rgba(0,0,0,.12); color: #fff; font-size: .74em; font-weight: 700; display: flex; align-items: center; justify-content: center; font-family: var(--mono); }

.def { border: 2px solid var(--accent-l); border-radius: 16px; background: var(--tint); padding: 1.4rem 1.8rem; margin: .6rem 0 1rem; text-align: center; }
.def .term { font-size: .72rem; text-transform: uppercase; letter-spacing: .24em; color: var(--muted); margin-bottom: .5rem; }
.def .text { font-size: 1.45em; line-height: 1.3; color: var(--ink); }
.def .text strong { color: var(--accent-xd); }

.formula { font-family: var(--mono); text-align: center; background: var(--card); border: 2px solid var(--accent-l); border-radius: 14px; box-shadow: var(--shadow); padding: 1.1rem; margin: .8rem 0; font-size: 1.35rem; color: var(--accent-xd); font-weight: 700; }

.callout { border-radius: 12px; padding: .85rem 1.15rem; margin: .9rem 0; font-size: .98em; }
.callout.key   { border-left: 4px solid var(--accent); background: var(--tint); }
.callout.think { border-left: 4px solid var(--blue);  background: var(--blue-bg); }
.callout.warn  { border-left: 4px solid var(--amber); background: var(--amber-bg); }
.callout.danger{ border-left: 4px solid var(--coral); background: var(--coral-bg); }
.callout .tag { font-weight: 800; text-transform: uppercase; letter-spacing: .1em; font-size: .68em; display: block; margin-bottom: .28rem; }
.callout.key .tag   { color: var(--accent-d); }
.callout.think .tag { color: var(--blue); }
.callout.warn .tag  { color: var(--amber); }
.callout.danger .tag{ color: var(--coral); }

.tbl-wrap { overflow-x: auto; border-radius: 14px; border: 1px solid var(--border); background: #fff; box-shadow: var(--shadow); }
table { width: 100%; border-collapse: collapse; font-size: .93em; }
th { background: linear-gradient(180deg, var(--accent), var(--accent-d)); color: #fff; text-align: left; padding: .7rem .9rem; font-weight: 700; }
td { padding: .62rem .9rem; border-top: 1px solid #eef4ef; vertical-align: top; }
tbody tr:nth-child(even) { background: #f6fbf7; }
tbody tr:hover { background: var(--tint); }

.chip { display: inline-block; padding: .35rem .95rem; border-radius: 100px; background: var(--accent-l); border: 0; color: var(--accent-xd); font-size: .85em; font-weight: 700; margin: .2rem .25rem .2rem 0; box-shadow: 0 2px 6px rgba(0,0,0,.08); }
.chip.amber { background: #fcd34d; color: #78350f; }
.chip.blue  { background: #bfdbfe; color: #1e40af; }
.chip.red   { background: #fecaca; color: #991b1b; }

.video-frame { position: relative; width: 100%; max-width: 620px; margin: 1rem auto; aspect-ratio: 16/9; }
.video-frame iframe { width: 100%; height: 100%; border-radius: 14px; border: 2px solid #fff; box-shadow: var(--shadow); }
.vl a { color: var(--accent-d); font-weight: 600; }

.q-num { display: inline-flex; align-items: center; gap: .6rem; background: linear-gradient(135deg, var(--accent), var(--accent-d)); color: #fff; border-radius: 100px; padding: .35rem 1.1rem .35rem .6rem; font-weight: 700; font-size: .9em; margin-bottom: 1rem; box-shadow: 0 2px 8px rgba(0,0,0,.12); }
.q-num .n { width: 1.7em; height: 1.7em; border-radius: 50%; background: rgba(255,255,255,.22); display: flex; align-items: center; justify-content: center; font-family: var(--mono); }
.q-prompt { font-size: 1.12em; border-radius: 12px; padding: .85rem 1.15rem; margin: .5rem 0 1rem; background: var(--tint); border-left: 4px solid var(--accent); }
.stimulus { background: var(--tint); border: 1px solid var(--border); border-radius: 14px; padding: 1rem 1.2rem; margin: .8rem 0; font-size: .95em; }
.stimulus h4 { color: var(--accent-d); letter-spacing: .08em; text-transform: uppercase; font-size: .8rem; margin-bottom: .5rem; }
.opt { display: block; background: var(--card); border: 2px solid var(--border); border-radius: 12px; padding: .7rem 1rem; margin-bottom: .5rem; cursor: default; transition: all .2s; }
.opt:hover { border-color: var(--accent-l); box-shadow: 0 0 0 3px rgba(0,0,0,.06); }
.opt .letter { display: inline-flex; width: 1.6em; height: 1.6em; border-radius: 8px; background: var(--accent-l); border: 0; color: var(--accent-xd); font-weight: 700; align-items: center; justify-content: center; margin-right: .7rem; font-family: var(--mono); font-size: .85em; }

.answer-badge { display: inline-flex; align-items: center; gap: .6rem; background: linear-gradient(135deg, var(--accent), var(--accent-d)); color: #fff; font-weight: 800; font-size: 1.05em; border-radius: 100px; padding: .5rem 1.3rem; margin-bottom: 1rem; box-shadow: 0 3px 10px rgba(0,0,0,.15); }
.answer-badge .a { background: rgba(0,0,0,.18); color: #fff; border-radius: 100px; padding: .1rem .7rem; font-family: var(--mono); }
.answer-card { border: 1px solid var(--border); background: var(--tint); border-radius: 14px; padding: 1.2rem 1.4rem; }
.answer-card h4 { color: var(--accent-d); text-transform: uppercase; letter-spacing: .1em; font-size: .8rem; margin-bottom: .4rem; }
.trap { border-left: 4px solid var(--coral); background: var(--coral-bg); border-radius: 0 12px 12px 0; padding: .6rem .9rem; margin: .5rem 0; font-size: .92em; }
.trap b { color: var(--coral); }

.nav-arrow { position: fixed; top: 50%; transform: translateY(-50%); width: 50px; height: 50px; z-index: 150; background: #fff; border: 1px solid var(--border); border-radius: 50%; box-shadow: var(--shadow); color: var(--accent-d); font-size: 1.4rem; cursor: pointer; transition: all .2s; }
.nav-arrow:hover { background: var(--accent); color: #fff; border-color: var(--accent); transform: translateY(-50%) scale(1.06); }
.nav-arrow.prev { left: 1rem; }
.nav-arrow.next { right: 1rem; }
.dots { position: fixed; bottom: 2.6rem; left: 50%; transform: translateX(-50%); display: flex; gap: .5rem; z-index: 150; max-width: 80vw; flex-wrap: wrap; justify-content: center; }
.nd { width: 10px; height: 10px; border-radius: 50%; border: 0; background: #cfd6cf; cursor: pointer; transition: all .2s; }
.nd:hover { background: #a9b4aa; }
.nd.active { background: var(--accent); transform: scale(1.25); box-shadow: 0 0 8px rgba(0,0,0,.18); }

.invert { background: linear-gradient(135deg, var(--accent), var(--accent-d) 60%, var(--accent-xd)); }
.invert h1 { color: #fff; background: none; -webkit-text-fill-color: #fff; }
.invert .eyebrow, .invert .tag { color: #fff; }
.invert .divider { background: #fff; }
.invert .chip { background: rgba(255,255,255,.22); color: #fff; box-shadow: none; }

@media (max-width: 820px) {
    .nav-arrow { display: none; }
    .slide { padding: 4.2rem 1.2rem 2.2rem; }
}
@media print {
    body { overflow: visible; }
    .slide { display: block; position: relative; page-break-after: always; height: 100vh; }
    .bar, .nav-arrow, .dots { display: none; }
}
"""

JS = """\
var cs = 0;
var N = {TOTAL};
function show(n) {
    if (n < 0) n = N - 1;
    if (n >= N) n = 0;
    document.querySelectorAll('.slide').forEach(function(s){ s.classList.remove('active'); });
    document.querySelectorAll('.nd').forEach(function(d){ d.classList.remove('active'); });
    document.querySelectorAll('.slide')[n].classList.add('active');
    document.querySelectorAll('.nd')[n].classList.add('active');
    cs = n;
    document.getElementById('sn').textContent = n + 1;
}
function chg(dir) { show(cs + dir); }
function go(n) { show(n); }
document.addEventListener('keydown', function(e) {
    if (e.key === 'ArrowLeft')  chg(-1);
    if (e.key === 'ArrowRight') chg(1);
    if (e.key === ' ') { e.preventDefault(); chg(1); }
});
var tsx = 0;
document.addEventListener('touchstart', function(e){ tsx = e.changedTouches[0].screenX; });
document.addEventListener('touchend', function(e){
    var diff = e.changedTouches[0].screenX - tsx;
    if (diff < -50) chg(1);
    if (diff > 50)  chg(-1);
});
(function(){
    var c = document.getElementById('ndc');
    for (var i = 0; i < N; i++) {
        var b = document.createElement('button');
        b.className = 'nd' + (i === 0 ? ' active' : '');
        b.onclick = (function(idx){ return function(){ go(idx); }; })(i);
        b.title = 'Slide ' + (i+1);
        c.appendChild(b);
    }
})();
"""


def build_html(title, slides_html, header, footer, palette, total):
    css = CSS
    for k, v in palette.items():
        css = css.replace('{' + k + '}', v)
    slides_inner = ''
    for i, s in enumerate(slides_html):
        cls = 'slide active' if i == 0 else 'slide'
        # hero/invert slides already include their own <div class="slide ..."> wrapper
        if s.startswith('<div class="slide'):
            if i == 0:
                s = s.replace('<div class="slide', '<div class="slide active', 1)
                s = s.replace('<div class="slide active invert"', '<div class="slide invert active"', 1)
            slides_inner += s + '\n'
        else:
            slides_inner += f'        <div class="{cls}">\n            {s}\n        </div>\n'
    js = JS.replace('{TOTAL}', str(total))
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{title} — AP Business Slides</title>
<style>
{css}
</style>
</head>
<body>
<div class="bar top">
    <span>AP Business with Personal Finance <span style="color:var(--muted)">· {title}</span></span>
    <span><a href="../curriculum.html">← Curriculum</a></span>
</div>
<div class="stage">
{slides_inner}
</div>
<button class="nav-arrow prev" onclick="chg(-1)">&#8249;</button>
<button class="nav-arrow next" onclick="chg(1)">&#8250;</button>
<div class="dots" id="ndc"></div>
<div class="bar bottom">
    <span>AP Business with Personal Finance · {title}</span>
    <span>Slide <span id="sn">1</span> / {total}</span>
</div>
<script>
{js}
</script>
</body>
</html>"""


def compute_kickers(slides):
    """Return per-slide kicker labels. Switch to practice mode after a 'Practice —' hero."""
    kickers = []
    mode = 'concept'
    for s in slides:
        t = s.title or ''
        if s.is_hero and re.search(r'practice', t, re.I):
            mode = 'practice'
        if s.is_practice_q:
            kickers.append('Practice Question')
        elif s.is_answer:
            kickers.append('Answer')
        elif s.is_stimulus:
            kickers.append('Stimulus')
        elif re.search(r'wrap-up', t, re.I):
            kickers.append('Wrap-up')
        elif re.search(r'trap patterns', t, re.I):
            kickers.append('Debrief')
        elif mode == 'practice':
            kickers.append('Practice')
        else:
            kickers.append('Lesson')
    return kickers


def convert_file(md_path, palette):
    text = md_path.read_text(encoding='utf-8')
    meta, body = parse_frontmatter(text)
    slides_md = split_slides(body)
    slides = [Slide(s) for s in slides_md]
    kickers = compute_kickers(slides)
    title = md_path.stem.replace(' - Slides', '').strip()
    header = meta.get('header', 'AP Business with Personal Finance')
    footer = meta.get('footer', '')
    slides_html = [convert_slide(s, 'practice' if k == 'Practice Question' else 'concept', k) for s, k in zip(slides, kickers)]
    html = build_html(title, slides_html, header, footer, palette, len(slides_html))
    out = DST / slugify(title)
    out.write_text(html, encoding='utf-8')
    print(f'  -> {out.name}  ({len(slides_html)} slides)')


def main():
    if not SRC.exists():
        print(f'ERROR: {SRC} not found'); sys.exit(1)
    print('Converting decks:', ', '.join(TARGETS))
    for md in sorted(SRC.glob('*.md')):
        deck = md.name.split(' ', 1)[0]
        if deck not in TARGETS:
            continue
        palette = PALETTES[deck]
        print(f'  {md.name}  [{palette["accent"]}]')
        convert_file(md, palette)
    print('Done.')


if __name__ == '__main__':
    main()
