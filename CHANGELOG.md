# Changelog

## [1.0.0] - 2025-01-06

### Added
- Complete rewrite using Puppeteer for headless browser automation
- UI-based transcript extraction by clicking "Show transcript" button
- ES modules support with Node.js 18+ requirement
- Built-in Node.js test runner for testing
- Zero build dependencies - runs directly from source

### Changed
- Project renamed from `youtube-captions-scraper` to `headless-youtube-captions`
- Switched from API-based extraction to UI automation approach
- Removed all build tools (Babel, Flow, ESLint configurations)
- Simplified to 4 core dependencies only
- Updated to modern ES6+ syntax without transpilation

### Removed
- Legacy API-based caption extraction method
- Babel build pipeline and configuration
- Flow type checking
- Complex dev dependency chain
- Vulnerability-prone legacy dependencies