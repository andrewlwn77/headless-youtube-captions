# Headless YouTube Captions

> Extract YouTube video transcripts by interacting with YouTube's UI using Puppeteer

## Installation

```bash
npm install -S headless-youtube-captions
# OR
yarn add headless-youtube-captions
```

## Usage

### ES6 / TypeScript
```js
import { getSubtitles } from 'headless-youtube-captions';

const captions = await getSubtitles({
  videoID: 'JueUvj6X3DA', // YouTube video ID
  lang: 'en' // Optional, default: 'en'
});

console.log(captions);
```

### ES5 / CommonJS
```js
const { getSubtitles } = require('headless-youtube-captions');

getSubtitles({
  videoID: 'JueUvj6X3DA', // YouTube video ID
  lang: 'en' // Optional, default: 'en'
}).then(captions => {
  console.log(captions);
});
```

## API

### `getSubtitles(options)`

Extracts captions/transcripts from a YouTube video by automating browser interactions.

#### Parameters

- `options` (Object):
  - `videoID` (String, required): The YouTube video ID
  - `lang` (String, optional): Language code for captions. Default: `'en'`. Supported: `'en'`, `'de'`, `'fr'`

#### Returns

A Promise that resolves to an array of caption objects.

#### Caption Object Format

Each caption object contains:

```js
{
  "start": "0",     // Start time in seconds (as string)
  "dur": "3.0",     // Duration in seconds (as string)
  "text": "Caption text here"  // The actual caption text
}
```

#### Example Response

```js
[
  {
    "start": "0",
    "dur": "3.0", 
    "text": "- Creating passive income takes work,"
  },
  {
    "start": "3",
    "dur": "2.0",
    "text": "but once you implement those processes,"
  },
  {
    "start": "5",
    "dur": "3.0",
    "text": "it's one of the most fruitful income sources"
  }
  // ... more captions
]
```

## How It Works

This library uses Puppeteer to:

1. Navigate to the YouTube video page
2. Handle cookie consent and ads if present
3. Click the "Show transcript" button in the video description
4. Extract transcript segments from the opened transcript panel
5. Parse timestamps and text content
6. Calculate proper durations for each caption segment

## Requirements

- Node.js 12 or higher
- Puppeteer (installed as a dependency)

## Error Handling

The function will throw an error if:
- The video ID is invalid or the video doesn't exist
- The video has no available captions/transcripts
- The "Show transcript" button cannot be found
- Network issues prevent loading the page

Example error handling:

```js
try {
  const captions = await getSubtitles({ videoID: 'XXXXX' });
  console.log(captions);
} catch (error) {
  console.error('Failed to extract captions:', error.message);
}
```

## Notes

- The library runs Puppeteer in headless mode by default
- Extraction time depends on video page load time and transcript length
- The library respects YouTube's UI structure as of the last update
- Some videos may not have transcripts available

## License

MIT