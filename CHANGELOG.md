# Changelog

## [1.3.0] - 2025-01-24

### Added
- **NEW**: `searchYouTubeGlobal()` function for searching across all of YouTube
  - Search for videos and channels globally using any search term
  - Configurable result types: videos, channels, or both
  - Adjustable result limits (1-20 results)
  - Returns structured data with video metadata (title, channel, views, duration, etc.)
  - Returns structured data with channel metadata (title, subscribers, video count, etc.)
  - Uses validated DOM selectors for reliable extraction
  - Consistent API design matching existing functions

### Technical Details
- Added `src/search.js` with comprehensive YouTube search automation
- Updated TypeScript definitions with new search interfaces
- Enhanced exports in main index file
- Maintains existing browser management and error handling patterns

## [1.2.0] - 2025-07-06

### Added
- Docker support with `PUPPETEER_EXECUTABLE_PATH` environment variable
- Ability to specify custom Chrome/Chromium executable path
- Comprehensive Docker usage documentation with example Dockerfile
- npm badges in README (version, license, Node.js version)
- Features section highlighting key capabilities

### Changed
- Enhanced README with better organization and documentation
- Updated Node.js requirement documentation to correctly show v18+

## [1.0.1] - 2025-06-10

### Added
- TypeScript declaration files for improved TypeScript support
- Type definitions for `getSubtitles` function and return types

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