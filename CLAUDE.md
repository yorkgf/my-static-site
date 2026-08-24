# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
Static educational website for GHA offering **7 AP courses**: APCSA, APCSP, APPhysicsC, APPhysics1, APBusiness, APCyber, APStat. Space-themed interactive presentations with custom animations and tabbed syllabus interfaces.

## Architecture
```
├── index.html              # Landing page: custom slide system, vanilla JS, self-contained
├── css/                    # Global shared CSS (starfield, animations, Reveal.js styles)
├── js/                     # Global shared JS (starfield, animations, visual effects)
├── deploy.sh               # Prepare files for EdgeOne Pages deployment
├── AP*/                    # One directory per course (7 total), each self-contained:
│   ├── syllabus.html       # Tabbed syllabus (inline CSS/JS, no build step)
│   ├── curriculum.html     # Full course curriculum
│   ├── *.html              # Additional topic pages (APCSA: control, modularity, variable, impact)
│   ├── css/, js/, images/  # Course-specific assets
│
├── APPhysicsC/knowlege graph/   # Markdown source for knowledge graph (typo intentional)
├── APPhysicsC/knowledge-graph/  # BUILT OUTPUT from Quartz — DO NOT EDIT
└── quartz-gh/                   # Quartz v4 nested git repo: builds knowledge graph
    └── content/                 # Canonical markdown source (newer structure)
```

**Key rule**: Course pages are self-contained (inline CSS/JS). Global `css/` and `js/` exist but aren't used by course pages.

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

## Common Commands

### Local dev
```bash
python3 -m http.server 8000   # serve from project root
```

### Deploy
```bash
./deploy.sh   # copies to ./deploy/; upload that folder to EdgeOne Pages
```

## Important Patterns

### Responsive Design
- `clamp(min, preferred, max)` for fluid typography
- `min(a, b)` for responsive sizes with max cap
- Breakpoints: 768px (tablet), 480px (mobile)

### Course Color Themes
| Course | Primary Color |
|--------|--------------|
| APCSA | `#ffb347` (orange) |
| APCSP | `#ffb347` (orange) |
| APPhysicsC | `#2c5aa0` / `#7cf` (blue) |
| APPhysics1 | (check `APPhysics1/css/`) |
| APBusiness | (check `APBusiness/css/`) |
| APCyber | (check `APCyber/css/`) |
| APStat | (check `APStat/css/`) |

### Tab Navigation
Syllabus pages use simple class-toggle tab JS (no framework, no animations). Sub-tabs supported.

### File Naming
- **Never rename** `APPhysicsC/knowlege graph/` — the typo is intentional and referenced in multiple places
- Course HTML files: lowercase, no spaces (e.g., `syllabus.html`, `curriculum.html`)

## Deploy
Target: **EdgeOne Pages** (Tencent Cloud). Run `./deploy.sh` then upload `deploy/` folder manually. The script copies all 7 course directories plus global assets.

## Notes
- No build step for main site (pure HTML/CSS/JS)
- No `package.json` at root
- Anime.js 3.2.1 loaded from CDN on some pages
- Mixed English/Chinese content
- For detailed tech stack, conventions, and workflows, see `AGENTS.md`
