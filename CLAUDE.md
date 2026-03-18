# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
Static educational website for GHA offering AP courses (APCSA, APCSP, APPhysicsC). The site features space-themed interactive presentations with custom animations and a tabbed syllabus interface.

## Architecture
```
├── index.html              # Main landing page with custom slide navigation (vanilla JS)
├── css/                    # Global shared CSS (responsive utilities, animations, Reveal.js styles)
├── js/                     # Global shared JavaScript (animations, starfield background effects)
├── APCSA/                  # AP Computer Science A course
│   ├── syllabus.html       # Course syllabus with tabbed navigation
│   ├── curriculum.html     # Full course curriculum
│   ├── *.html              # Other course content (control, modularity, variable, etc.)
│   ├── css/                # Course-specific styles
│   ├── js/                 # Course-specific scripts
│   └── images/             # Course images and assets
├── APCSP/                  # AP Computer Science Principles (same structure as APCSA)
└── APPhysicsC/             # AP Physics C (same structure as APCSA)
```

Each course directory is self-contained with its own css/js/images subdirectories.

## Key Technologies
- **Frontend**: Pure HTML/CSS/JavaScript (no framework, no build step)
- **Animations**: Anime.js 3.2.1 (loaded from CDN)
- **Responsive Design**: Heavy use of `min()`, `clamp()`, `vw`, `vh` for fluid layouts
- **Theme**: Space-themed with starfield backgrounds, glowing effects, monospace terminal styling

## Common Commands

### Serve the site locally
```bash
# Option 1: Python 3
python3 -m http.server 8000

# Option 2: Node.js (if npx is available)
npx serve

# Option 3: PHP
php -S localhost:8000
```
The site will be available at http://localhost:8000

## Important Patterns

### Inline vs Shared Resources
- **index.html**: Completely self-contained with embedded CSS/JS (custom slide system)
- **Course pages (syllabus.html, etc.)**: Inline CSS within `<style>` tags, simple tab JavaScript
- **Global css/js directories**: Reusable components (starfield, animations, effects) - but course pages don't currently use these

### Responsive Design Units
- Use `min(value1, value2)` for responsive sizes that don't exceed maximum
- Use `clamp(min, preferred, max)` for fluid typography
- Use `vw`/`vh` for viewport-relative dimensions
- Mobile breakpoints at 768px and 480px

### Color Themes by Course
- **APCSA**: Orange theme (`#ffb347` primary)
- **Physics**: Blue theme (`#2c5aa0`, `#7cf`)
- **Space theme**: Dark backgrounds with glowing text effects

## Navigation Patterns
- Links use relative paths (e.g., `../index.html`, `APCSA/syllabus.html`)
- Course pages have "Back to Home" and "Explore Curriculum" navigation buttons
- Tab-based navigation for syllabus content (simple class toggle, no animations)
