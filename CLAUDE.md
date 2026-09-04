# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
Static educational website for GHA offering **7 AP courses**: APCSA, APCSP, APPhysicsC, APPhysics1, APBusiness, APCyber, APStat. Space-themed interactive landing page with custom slide system, course-specific syllabus pages with tabbed interfaces, an interactive knowledge graph (APPhysicsC only), a **slide presentation system** (APBusiness), a classroom **word cloud** tool, and a student-facing **teacher Office Hour directory** (searchable, built from `OfficeHour/总课表.xlsx`).

> **Note:** `AGENTS.md` is legacy and only documents 3 of the 7 courses (APCSA, APCSP, APPhysicsC). Prefer this file as the source of truth.

## Architecture
```
├── index.html              # Landing page: custom slide system (NOT Reveal.js), vanilla JS, self-contained
├── officehour.html         # Teacher Office Hour / 晚自习值班表 (students; live data + snapshot fallback)
├── officehour-admin.html   # Teacher self-service login + edit (not linked publicly)
├── wordcloud.html          # Student-facing classroom word cloud
├── wordcloud-admin.html    # Teacher-facing word cloud console
├── OfficeHour/             # Excel source + data pipeline + cloud function + tests
│   ├── 总课表.xlsx          # SOURCE OF TRUTH for the schedule
│   ├── build_data.py        # xlsx → inline DATA block + data.json (also runs integrity checks)
│   ├── data.json            # generated; input to the seeder
│   ├── check_teacher_identity.py  # read-only audit of Teachers.Name vs the Excel
│   ├── api/                 # Tencent SCF Web function (login reuses FADsys GHA.Teachers)
│   └── tests/               # Chrome-headless functional / responsive / contrast / e2e / live-check
├── css/                    # Global shared CSS (starfield, animations)
├── js/                     # Global shared JS (starfield, animations, visual effects)
├── deploy.sh               # Prepare files for EdgeOne Pages deployment
│
├── AP*/                    # One directory per course (7 total), each self-contained:
│   ├── syllabus.html       # Tabbed syllabus (inline CSS/JS, no build step)
│   ├── curriculum.html     # Full course curriculum (uses textbook-style.css + inline collapsible JS)
│   ├── slides/            # HTML slide decks (APBusiness only, see "Slide System" below)
│   ├── convert_slides.py   # Marp→HTML converter (APBusiness only)
│   ├── css/               # Course-specific CSS (may be absent, see Known Issues)
│   ├── js/                # Course-specific JS (may be empty)
│   └── images/            # Course-specific images
│
├── APPhysicsC/knowlege graph/   # Legacy Obsidian markdown source (typo in name is intentional)
├── APPhysicsC/knowledge-graph/  # BUILT OUTPUT from Quartz — DO NOT EDIT
└── quartz-gh/                   # Quartz v4 nested git repo: builds knowledge graph
    └── content/                 # Canonical markdown source (newer structure)
```

**Key rule**: Course pages are mostly self-contained (inline CSS/JS). Global `css/` and `js/` exist but aren't used by course pages.

## Office Hour (教师值班 / Office Hour)

Feature folder: `OfficeHour/` (Excel source + data pipeline + cloud function + tests).
Pages live at the repo root like other site pages: `officehour.html` (students) and
`officehour-admin.html` (teachers self-service).

### Pieces

| Path | Role |
|---|---|
| `OfficeHour/总课表.xlsx` | **SOURCE OF TRUTH** for the schedule |
| `OfficeHour/build_data.py` | xlsx → inline `/* DATA-BEGIN…END */` block + `OfficeHour/data.json`; warns on double-bookings (same teacher, same period, two classes) and unparsed rows; **hard-fails if a teacher has no `PINYIN` entry**. It deliberately does **not** warn about two classes sharing a room — see the note below |
| `OfficeHour/data.json` | Generated export consumed by the seeder |
| `officehour.html` | Student page. No framework, no build step. |
| `officehour-admin.html` | Teacher login + edit. Not linked publicly. |
| `OfficeHour/api/` | Tencent **SCF Web function** (Node/Express/MongoDB, ESM) |
| `OfficeHour/api/src/conflicts.js` | The self-service safety net: overlap conflicts, deletion ledger, class registry |
| `OfficeHour/api/src/timewindow.js` | Period vs custom-time windows, HH:MM validation, overlap math |
| `OfficeHour/tests/` | Browser-driven test suites |

### Student page behaviour

- **Data**: embedded `SNAPSHOT` (学期初快照) is the **fallback**; if `OH_API_BASE` is configured the page
  fetches `GET /api/officehours` and overlays live data via `applyData()` → `derive()`. If the backend is
  down the page still renders the snapshot — students never see a blank page. The status line shows
  实时数据 vs 学期初快照.
- **Three data states, and the table always matches the label**: `snapshot` → `live` → `stale`.
  On a failed refresh *after* a successful one, the page keeps the last real data and labels it
  「可能不是最新」 (a flaky network must not throw away a teacher's room change). If bad data is
  rejected **before** any successful load, it reverts to the snapshot **and repaints** — `applyData()`
  only swaps data in, `refresh()` draws; doing one without the other is how you get a table that
  contradicts its own status line.
- **Guards on backend data** (`loadLive`): refuses to overlay when `slots` is empty or when the
  server's `term` ≠ the snapshot's `term` (both mean misconfiguration, and an empty table shown to
  students is much worse than a stale one). `applyData()` also normalises rows and drops malformed ones
  — keep `period` a **number**, since lots of comparisons are `slot[1] === p`.
- **Total table** with two views: 「按班级看」(rows = classes, cols = 周一–周五) and
  「按老师看」(rows = teachers). Sticky first column, horizontally scrollable on phones.
- **Times explicit everywhere** — badges list each period (`第10节 18:30–19:20`), the table uses
  **period bands**, and every teacher-card line carries its own time label. A 「两节合并 / 逐节展开」
  toggle appears only when the periods really are identical; if a teacher edits just one period's room,
  `merged` recomputes to false and the page auto-splits into two bands.
- **Teacher search**: Chinese name, full pinyin, or initials (`李楚翘` / `lichuqiao` / `lcq`), plus
  class (`G10-1`) and room (`文体 114`). Table highlights hits, dims non-hits; quick-pick chips.
- Pinyin lives only in `build_data.py`'s `PINYIN` dict. Live data from the API has no pinyin, so
  `teacherListFrom()` re-attaches it from the snapshot; new teachers degrade to name-only search.
- **Teacher email shows on each card** (陈逸飞 ✉ if_chen@ghedu.com), not pinyin. Source of truth:
  `build_data.py`'s `TEACHER_EMAIL` (mirrors `GHA.Teachers`, hard-fails like `PINYIN`) is embedded into
  `SNAPSHOT.teachers.email` for the roster; the backend's live `GET /api/officehours` returns a top-level
  `emails` map **limited to teachers who have duty that term** (staff who self-add shifts like 丁佳 also
  get their email). Per-slot `teacherEmail` is still never exposed — emails only travel as that one map, so
  accounts not in the duty roster never leak (see smoke test "公开接口只回值班老师邮箱表").
- **Do not hardcode clock times/periods in page logic** — they come from the generated `SNAPSHOT.periods`.

### Theme

- Light (亮色) is the **DEFAULT**; `🌙 深色 / ☀️ 浅色` toggles `<html data-theme>` and persists to
  `localStorage['ohTheme']`. A `<head>` script applies it before first paint (no flash). Printing is
  **forced light in both themes** (verified by rasterising the print PDF: 0.969 luminance either way).
- **Design tokens are mandatory.** Every colour comes from `:root` (light) / `[data-theme="dark"]` —
  `--ink`, `--muted`, `--accent`, `--blue`, `--panel`, `--field`, `--chip`, `--thead`, `--sticky`,
  `--line`, `--btn`, `--seg-on`, `--mark`, `--dtag`, `--card`, `--callout`, `--shadow*`, `--h1`.
  **Never write a raw `rgba()`/hex inside a rule.** `@media print` re-declares tokens on
  `:root, [data-theme="dark"]` (both selectors, so the dark block can't win the cascade).
- `officehour-admin.html` carries a **verbatim copy** of the token block; `run.sh` fails if the two drift.

### Language (中文 / English)

Both pages are bilingual via the top-right `🌐 English / 中文` toggle. Default is **zh**; `?lang=en`
wins over `localStorage['ohLang']`, which is remembered for later visits. It is in-page rather than
separate files on purpose — the semester `SNAPSHOT`, the token block and all page logic are shared,
so a second copy would drift (the same reason the token block gets a drift check).

- Static UI text carries `data-i18n="key"` (placeholders: `data-i18n-ph`). English lives in `EN_STATIC`;
  the original Chinese is snapshotted on the first `applyStatic()` so toggling back restores it exactly.
- Dynamic text is written `I('中文', 'English')` right next to the site. Day / period labels go through
  `dayName()` / `perLabel()`, so the data keys stay Chinese (周一…, 10) and only the display changes.
  Teacher names, class codes and room names (文体 114…) are proper nouns and are not translated.
- The backend answers in Chinese; `trErr()` maps the common messages to English in EN mode only
  (unmatched messages pass through verbatim).
- **Tests run against the default zh** and assert exact Chinese strings — never reword the zh side of an
  existing string, and keep any new UI text in the same shape (zh literal + `I(...)` twin).

### Backend: `OfficeHour/api/`

Shares the **same MongoDB and the same `GHA.Teachers` table as FADsys**, so teachers log in with their
existing FAD credentials. New collections: `Office_Hours`, `Office_Hour_Audit`,
`Office_Hour_Deletions` (deletion ledger), `Office_Hour_Classes` (class registry).

**Teachers have full self-service over their own rows** — create, delete, and change
day/period/class/room/note. What is locked is **ownership**: `teacherEmail` always comes from the JWT,
so nobody can attach a shift to (or steal it from) another account. Admins (`Group` in `S,A`) can
additionally reassign ownership and bulk-import.

Five guards make full self-service safe (all tested):
1. **time windows, not period numbers**: a shift is either period-anchored (`period=10`, clock time
   derived from the timetable — what Excel/`seed.mjs` writes) or teacher-custom (`start`/`end`, e.g.
   16:30–17:30, with `period=null`). Conflicts are decided by **interval overlap**, so a 16:30–17:30
   office hour never collides with the 18:30–19:20 duty; touching edges (…–18:30 vs 18:30–…) are legal.
   Custom times are bounded by `OH_TIME_EARLIEST` / `OH_TIME_LATEST` / `OH_TIME_MAX_MINUTES`.
2. partial unique indexes `{term,day,period,cls}` and `{teacherEmail,term,day,period}` with
   `partialFilterExpression: {anchored: true}` — only period-anchored rows participate. MongoDB treats
   `null` as a value inside a unique index, so without the partial filter two custom-time rows (both
   `period: null`) would falsely collide. `anchored` exists purely for this and is written with `period`.
3. `findSlotConflict()` before every write — a class already covered by someone in an overlapping
   window returns 409 **naming that teacher**, because "go talk to them" beats "you conflicted with
   yourself". When a row's clock time can't be parsed it degrades to the old period-equality check
   instead of locking people out.
4. deleting a `fromExcel` row writes a tombstone into `Office_Hour_Deletions`, so `seed.mjs` and the
   admin import **won't resurrect it**; origin is tracked by the immutable `fromExcel`, never by
   `source` (that means "last writer" and flips to `teacher` the moment someone edits the room)
5. class options come from the persistent `Office_Hour_Classes` registry (incl. classes being vacated),
   **not** `distinct('cls')` over live rows — that silently deletes a class from the picker as soon as
   its last row is moved, locking the teacher out. A custom-time row may also leave `cls` empty, which
   means "my office hours, not tied to a class" (shows on teacher cards only, never in the class grid).

**Room is never validated for collisions.** Several teachers sharing one room at the same time is
normal — the location is often a teacher's office, and simultaneous consultations don't interfere.
`smoke-test.mjs` has assertions pinning this rule so it doesn't creep back in.

Bulk imports are **pre-flighted in one pass** (including within-batch duplicates) so a conflict can
never leave the schedule half-written.

Set `JWT_SECRET` equal to FADsys's for passwordless SSO (token payload `{email, name}` is compatible).
Admin gate uses `ADMIN_GROUPS=S,A` (mirrors FADsys `userGroups.js` `isAdmin()`, which is wider than its
own `adminMiddleware` that only accepts `S`).

**已知账号现状——用户已确认，不要自作主张改**：教师「高峰」在 `GHA.Teachers` 里的 `email` 就是
`test@test.com`（`Group=S`），而且库里只有这一个同名账号。他是**超级管理员**，该账号就在他自己手里，
所以不存在“值班绑到测试账号、本人改不了”的问题。`seed.mjs` 按姓名反查 email 时会把他归到这个地址（已跑通）。
以后若出现第二个“高峰”，导入会因重名而中止 —— 那才是需要人工补 email 的情况。

**The semester env var is `OH_TERM`, not `TERM`** — bare `TERM` is the terminal-type variable, so a
shell-exported `TERM=xterm-256color` silently overrides `.env` (dotenv never clobbers existing env) and
the API then queries the wrong semester and returns **0 rows**. This actually happened. When adding
env vars here, always prefix with `OH_`.

Full API table, security notes and deploy steps: `OfficeHour/api/README.md`.

### Updating the schedule (end-to-end)

```bash
# 1. edit OfficeHour/总课表.xlsx, then regenerate page data + JSON
python3 OfficeHour/build_data.py

# 2. push into MongoDB — dry run first, it refuses ambiguous name→email matches
node OfficeHour/api/scripts/seed.mjs            # 预演（不写库）
node OfficeHour/api/scripts/seed.mjs --apply    # 真正写入（--force 覆盖老师备注，--prune 删过期）

# 3. deploy
./deploy.sh                                       # 静态站（两个页面靠 glob 自动入包）
bash OfficeHour/api/scripts/pack-scf.sh           # 云函数 zip（会自检关键文件、并拒绝把 .env 打进去）
```

`seed.mjs` resolves teachers via `Teachers.Name` and **aborts on unmatched or duplicate names** so a
shift can never be silently bound to the wrong account.

### Tests

```bash
bash OfficeHour/tests/run.sh            # token 一致性 + 98 functional + 73 responsive + 38 contrast
bash OfficeHour/tests/run.sh --with-e2e # 再加真实浏览器端到端
node OfficeHour/api/scripts/smoke-test.mjs   # 全量 API 用例（数以运行输出为准）
bash OfficeHour/tests/live-check.sh <函数URL>  # 部署后自检：学生页确实在读后端
node OfficeHour/api/scripts/verify-prod.mjs   # 只读核验生产库结构（不写数据）
```
`live-check.sh` fails loudly when the API answers but returns 0 rows — that specific shape of
"deployed but silently empty" is the `OH_TERM` bug above.
- `tests/officehour.contrast.html` reads live token values for **both** themes, alpha-composites
  translucent foregrounds, checks every gradient endpoint, enforces WCAG AA (≥4.5:1, ≥3:1 decorative).
- `tests/e2e.mjs` starts the real API + a temp DB with **synthetic** teacher accounts, drives
  `officehour-admin.html` through Chrome (login → edit room/note → create a shift → get blocked by a
  conflict → delete it), then asserts the student page reflects each step and that the writes landed in
  Mongo — ending with a **no-leftover check** (row count back to 72, no stray tombstones).
  Both suites use throwaway databases and drop them.
- Never point the test suites at real teacher accounts: they log in and write.


## Slide System (APBusiness)

APBusiness has an interactive HTML slide presentation system. Each deck is a self-contained HTML file in `APBusiness/slides/`.

### Source → Output workflow
- **Source**: Marp markdown files in `/home/yorkgf/Documents/Obsidian Vault/AP Business with Personal Finance/Slides/`
- **Converter**: `APBusiness/convert_slides.py` (Marp `.md` → themed HTML)
- **Output**: `APBusiness/slides/*.html` (self-contained, per-deck accent colors)
- **Linked from**: `APBusiness/curriculum.html` (each unit links to its slide deck)

### How to convert slides
```bash
cd "APBusiness" && python3 convert_slides.py
```
The script skips `0.0` and `1.1` (hand-crafted, not auto-generated). All other decks are regenerated from Marp source.

### Slide HTML structure
- Per-deck CSS custom properties (accent, tint, etc.) defined in `:root`
- Vanilla JS for navigation (keyboard arrows, touch swipe, dot clicks)
- Responsive: nav arrows hidden below 820px
- Each deck has a unique accent color (defined in `PALETTES` dict in `convert_slides.py`)

### File naming convention
Slides use `{Unit}.{Topic}_Title.html`:
- `0.0_*` — Course introduction (one deck)
- `1.N_*` — Unit 1 decks (Foundations of Business)
- `2.N_*` — Unit 2 decks (Marketing)
- (higher units follow the APBusiness CED unit structure)

### Hand-crafted vs auto-generated
- **Hand-crafted** (edit manually): `0.0_Course_Introduction.html`, `1.1_What_Is_a_Business.html`
- **Auto-generated** (rebuild from Marp): all other decks — **do not manually edit**, re-run converter instead
- The converter skips hand-crafted decks in its glob pattern, so re-running is safe

## Knowledge Graph (APPhysicsC only)

`quartz-gh/` is a **nested git repo** (not a submodule). It contains Quartz v4 which builds the knowledge graph.

Two source directories exist for markdown content:
- `quartz-gh/content/` — **canonical source** for Quartz builds (E&M topics + some Mechanics)
- `APPhysicsC/knowlege graph/` — **legacy source** (Mechanics topics, typo in name is intentional)

Quartz reads from `quartz-gh/content/` only. To rebuild the knowledge graph:
```bash
cd quartz-gh && npx quartz build -o ../APPhysicsC/knowledge-graph/
```

Output goes to `APPhysicsC/knowledge-graph/` (gitignored, **DO NOT EDIT** files there).

## Curriculum Page Pattern

All `curriculum.html` pages share a common structure:
- Links to `css/textbook-style.css` for base layout (collapsible sections, image containers)
- Inline `<style>` block for course-themed collapsible button colors
- Vanilla JS for collapsible toggle behavior (inline `<script>`)
- Content organized by units with "Show/Hide" collapsible sections
- APBusiness additionally links to slide decks in `slides/` directory

**Known issue**: `textbook-style.css` is missing from APBusiness, APCyber, and APPhysics1. These pages reference the file but it hasn't been copied to those directories. The file is currently identical across APCSA, APCSP, APPhysicsC, and APStat (copied from APCSA, not themed per course).

## Common Commands

### Local dev
```bash
python3 -m http.server 8000   # serve from project root
```

### Rebuild Office Hour data
```bash
python3 OfficeHour/build_data.py
```

### Push Office Hour schedule into MongoDB
```bash
node OfficeHour/api/scripts/seed.mjs           # dry run
node OfficeHour/api/scripts/seed.mjs --apply   # write
# --force 覆盖老师写的备注；--prune 清掉 Excel 已不存在的行（只动 fromExcel 的）；
# --restore-deleted 把老师删过的格子恢复回来重新导入
```

### Test Office Hour
```bash
bash OfficeHour/tests/run.sh              # token parity + functional + responsive + contrast
bash OfficeHour/tests/run.sh --with-e2e   # add real-browser end-to-end
node OfficeHour/api/scripts/smoke-test.mjs
```

### Package the Office Hour cloud function
```bash
bash OfficeHour/api/scripts/pack-scf.sh
```

### Build knowledge graph
```bash
cd quartz-gh && npx quartz build -o ../APPhysicsC/knowledge-graph/
```

### Convert APBusiness slides (from Marp source)
```bash
cd "APBusiness" && python3 convert_slides.py
```

### Deploy
Primary path is **git push** (see “Deploy” section below). `./deploy.sh` is optional — it builds a
self-contained `./deploy/` copy for manual upload or local preview.

## Course Color Themes
| Course | Primary Color | Font |
|--------|---------------|------|
| APCSA | `#ffb347` (orange) | monospace |
| APCSP | `#ffb347` (orange) | monospace |
| APPhysicsC | `#4da6ff` / `#2c5aa0` (blue) | serif |
| APPhysics1 | `#4da6ff` (light blue) | serif |
| APBusiness | `#4caf50` (green) | serif |
| APCyber | `#9d4edd` (purple) | monospace |
| APStat | `#00897b` (teal) | serif |

## Tab Navigation
Syllabus pages use simple class-toggle tab JS (no framework, no animations). Sub-tabs supported. Pattern:
- CSS variables defined in `:root` for theming
- Tab buttons toggle `.active` class
- Tab content toggles `.active` class
- Responsive breakpoints: 1200px, 768px, 480px

## Responsive Design Patterns
- `clamp(min, preferred, max)` for fluid typography
- `min(a, b)` for responsive sizes with max cap
- `min(1rem, 2vh)` / `min(2rem, 6vw)` for spacing that scales with viewport
- Breakpoints: 1200px (large tablet), 768px (tablet), 480px (mobile), 600px (short viewport)

## File Naming
- **Never rename** `APPhysicsC/knowlege graph/` — the typo is intentional and referenced in multiple places
- Course HTML files: lowercase, no spaces (e.g., `syllabus.html`, `curriculum.html`)
- Slide HTML files: `{N.N}_Descriptive_Name.html` (e.g., `1.2_Markets_and_Competitive_Advantage.html`)

## Content Source
Curriculum pages are built from College Board CED (Course and Exam Description) documents, originally sourced from `/home/yorkgf/Documents/Obsidian Vault/`. When updating curriculum content, refer to the corresponding CED.

APBusiness slide source: Marp files in `/home/yorkgf/Documents/Obsidian Vault/AP Business with Personal Finance/Slides/`.

## Deploy
Target: **EdgeOne Pages (Tencent Cloud), synced from this GitHub repo.** The live site is built
straight from the repo, so **`git push origin master` is what deploys** — no upload step.

Consequences worth remembering:
- New pages must live **in the repo** at the path you want publicly served. Root-level `*.html` is the
  convention here, and pages get linked from the “To Continue” slide in `index.html`.
- Because EdgeOne serves the repo (not `deploy/`), everything committed becomes publicly fetchable.
  No credentials are in the repo (`OfficeHour/api/.env`, `*.zip`, `node_modules` are gitignored) — the
  API needs `MONGO_URI`/`JWT_SECRET` from SCF **environment variables**, never from a committed file.
  The GHA MongoDB has **no authentication**, so a leaked connection string means full write access.
- `./deploy.sh` still exists but is now **optional**: it assembles a self-contained `./deploy/` copy for
  manual upload or offline preview. `deploy/` is gitignored, so pushing it is not a thing.

The script copies **all root `*.html`** (glob, so new pages ship automatically), global `css`+
`js/`, and all 7 course directories. It then runs a **link-integrity check** that reports any
`href`/`src` in the package whose target is missing (accepts plain files, directories, and
Quartz extension-less "clean URLs").

> Historically the script listed root pages by hand, which silently dropped `wordcloud.html`
> even though the homepage linked to it. That is why it globs now — don't switch it back to an
> explicit list.

The `deploy/` directory is **gitignored** — `./deploy.sh` wipes and regenerates it on every run. Safe to delete locally.

`.deployignore` excludes: `quartz-gh/`, `APPhysicsC/knowlege graph/`, `.claude/`, `.git/`, `CLAUDE.md`, `OfficeHour/` (its data is already embedded in `officehour.html`).

## Notes
- No build step for main site (pure HTML/CSS/JS) — `officehour.html` is the only file with a
  regeneration step, and only when the Excel changes
- No `package.json` at root
- Anime.js 3.2.1 loaded from CDN on some pages
- Mixed English/Chinese content
- `textbook-style.css` needs to be copied to APBusiness, APCyber, APPhysics1 (known issue)
- Known broken links reported by `deploy.sh` (pre-existing, not yet fixed):
  `APPhysicsC/syllabus.html` references `css/knowledge-graph.css` and
  `js/{graph-builder,knowledge-graph,markdown-parser}.js`, none of which exist; plus ~79
  dangling internal links inside the built `APPhysicsC/knowledge-graph/` (needs a Quartz rebuild)
