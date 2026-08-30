# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
Static educational website for GHA offering **7 AP courses**: APCSA, APCSP, APPhysicsC, APPhysics1, APBusiness, APCyber, APStat. Space-themed interactive landing page with custom slide system, course-specific syllabus pages with tabbed interfaces, an interactive knowledge graph (APPhysicsC only), and a **slide presentation system** (APBusiness).

> **Note:** `AGENTS.md` is legacy and only documents 3 of the 7 courses (APCSA, APCSP, APPhysicsC). Prefer this file as the source of truth.

## Architecture
```
├── index.html              # Landing page: custom slide system (NOT Reveal.js), vanilla JS, self-contained
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

### Build knowledge graph
```bash
cd quartz-gh && npx quartz build -o ../APPhysicsC/knowledge-graph/
```

### Convert APBusiness slides (from Marp source)
```bash
cd "APBusiness" && python3 convert_slides.py
```

### Deploy
```bash
./deploy.sh   # copies to ./deploy/; upload that folder to EdgeOne Pages
```

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
Target: **EdgeOne Pages** (Tencent Cloud). Run `./deploy.sh` then upload `deploy/` folder manually. The script copies all 7 course directories plus global assets.

The `deploy/` directory is **gitignored** — `./deploy.sh` wipes and regenerates it on every run. Safe to delete locally.

`.deployignore` excludes: `quartz-gh/`, `APPhysicsC/knowlege graph/`, `.claude/`, `.git/`, `CLAUDE.md`.

## Notes
- No build step for main site (pure HTML/CSS/JS)
- No `package.json` at root
- Anime.js 3.2.1 loaded from CDN on some pages
- Mixed English/Chinese content
- `textbook-style.css` needs to be copied to APBusiness, APCyber, APPhysics1 (known issue)
