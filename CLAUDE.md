# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Static website for Bitcoin research and analysis tools, deployed to hypercoin.info. No build process, package manager, or backend - pure HTML/CSS/JavaScript served directly.

## Development

**Local Development**: Open HTML files directly in browser or use any static server (e.g., `python3 -m http.server`).

**No build/lint/test commands** - this is a vanilla static site with no tooling.

## Architecture

### Tech Stack
- Vanilla HTML5/CSS3/JavaScript (ES6+)
- Plotly.js v2.26.0 for charts (CDN)
- External APIs: CoinGecko, CoinCap, Binance (for live Bitcoin prices, with fallback chain)
- Google Fonts: Inter (body), JetBrains Mono (headings)

### Structure
```
/                     # Landing page (index.html)
/css/                 # Centralized stylesheets
  ├── styles.css      # Shared styles (variables, layout, theme)
  ├── simulator.css   # Monte Carlo simulator styles
  └── calculator.css  # Real estate calculator styles
/js/                  # Centralized JavaScript
  ├── shared/
  │   └── theme.js    # Shared theme utilities (SecureStorage, toggle, scroll effects)
  ├── landing.js      # Landing page scripts
  ├── simulator.js    # Monte Carlo simulator logic
  └── calculator.js   # Investment calculator logic
/simulator/           # Bitcoin Monte Carlo Simulator page
/re-vs-btc/           # Real Estate vs Bitcoin Calculator page
/images/              # Static assets
```

### Key Patterns

**Theme System**: Light/dark mode via CSS variables in `:root` and `[data-theme="dark"]`. Theme preference stored in localStorage.

**API Fallback Pattern**: Price fetching uses a waterfall approach (CoinGecko → CoinCap → Binance) with 5-second timeouts per API.

**Monte Carlo Simulation**: Uses Box-Muller transform for normal distribution. Runs 1k-10k iterations across 7+ time horizons.

**Security**: CSP headers, XSS protection, and strict permissions policies are set via meta tags in each HTML file.

### Styling
- CSS variables for all colors (orange/gold Bitcoin aesthetic)
- 768px breakpoint for mobile responsiveness
- All CSS files centralized in `/css/` directory
- Shared theme utilities in `/js/shared/theme.js` handle theme toggle, scroll effects, and localStorage
