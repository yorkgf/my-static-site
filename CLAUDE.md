# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
This is a static educational website for GHA offering AP courses, built with Reveal.js for interactive presentations.

## Architecture
```
├── index.html              # Main landing page (Reveal.js presentation)
├── css/                    # Global shared CSS styles
├── js/                     # Global shared JavaScript (animations, starfield background, etc.)
├── APCSA/                  # AP Computer Science A course directory
│   ├── syllabus.html       # Course syllabus
│   ├── curriculum.html     # Full course curriculum
│   ├── *.html              # Other course content pages
│   ├── css/                # APCSA-specific styles
│   ├── js/                 # APCSA-specific scripts
│   └── images/             # APCSA images and assets
├── APCSP/                  # AP Computer Science Principles course directory (same structure as APCSA)
└── APPhysicsC/             # AP Physics C course directory (same structure as APCSA)
```

## Key Technologies
- Frontend: Pure HTML/CSS/JavaScript (no framework)
- Presentation framework: Reveal.js 4.3.1 (loaded from CDN)
- Animation library: Anime.js 3.2.1 (loaded from CDN)

## Common Commands
### Serve the site locally (no build process required)
```bash
# Option 1: Python 3
python3 -m http.server 8000

# Option 2: Node.js (if npx is available)
npx serve

# Option 3: PHP
php -S localhost:8000
```
The site will be available at http://localhost:8000

### Project-specific notes
- No build/compile step required - all files are served directly as static assets
- All external dependencies are loaded from CDN, no local npm/yarn packages
- Each course is fully self-contained in its own directory
- All links use relative paths for portability
