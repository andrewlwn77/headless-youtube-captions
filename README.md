# Headless YouTube Captions

> Extract YouTube video transcripts, channel videos, and comments by interacting with YouTube's UI using Puppeteer

## Installation

```bash
npm install -S headless-youtube-captions
# OR
yarn add headless-youtube-captions
```

## Usage

### Extract Video Transcripts
```js
import { getSubtitles } from 'headless-youtube-captions';

const captions = await getSubtitles({
  videoID: 'JueUvj6X3DA', // YouTube video ID
  lang: 'en' // Optional, default: 'en'
});

console.log(captions);
```

### Get Channel Videos
```js
import { getChannelVideos } from 'headless-youtube-captions';

const result = await getChannelVideos({
  channelURL: '@mkbhd',  // or full URL like 'https://youtube.com/@mkbhd'
  limit: 30              // Optional, default: 30
});

console.log(result.videos);
```

### Search Channel Videos
```js
import { searchChannelVideos } from 'headless-youtube-captions';

const result = await searchChannelVideos({
  channelURL: '@mkbhd',
  query: 'iphone review',
  limit: 20              // Optional, default: 30
});

console.log(result.results);
```

### Get Video Comments
```js
import { getVideoComments } from 'headless-youtube-captions';

const result = await getVideoComments({
  videoID: 'JueUvj6X3DA',
  limit: 50,             // Optional, default: 50
  sortBy: 'top'          // Optional, 'top' or 'newest', default: 'top'
});

console.log(result.comments);
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

### `getChannelVideos(options)`

Extracts videos from a YouTube channel with pagination support.

#### Parameters

- `options` (Object):
  - `channelURL` (String, required): Channel identifier (@handle, channel ID, or full URL)
  - `limit` (Number, optional): Maximum videos to return. Default: `30`
  - `pageToken` (String, optional): For pagination (future use)

#### Returns

```js
{
  channel: {
    name: "Channel Name",
    subscribers: "1.2M subscribers",
    videoCount: "500 videos"
  },
  videos: [
    {
      id: "videoId123",
      title: "Video Title",
      views: "1.2M views",
      uploadTime: "2 days ago",
      duration: "10:45",
      thumbnail: "https://...",
      url: "https://youtube.com/watch?v=videoId123"
    }
    // ... more videos
  ],
  totalLoaded: 30,
  hasMore: true
}
```

### `searchChannelVideos(options)`

Search for videos within a specific YouTube channel.

#### Parameters

- `options` (Object):
  - `channelURL` (String, required): Channel identifier (@handle, channel ID, or full URL)
  - `query` (String, required): Search query
  - `limit` (Number, optional): Maximum results. Default: `30`

#### Returns

```js
{
  query: "iphone review",
  results: [
    {
      id: "videoId123",
      title: "iPhone 15 Review",
      views: "2.5M views",
      uploadTime: "1 week ago",
      duration: "15:23",
      thumbnail: "https://...",
      url: "https://youtube.com/watch?v=videoId123"
    }
    // ... more results
  ],
  totalFound: 25
}
```

### `getVideoComments(options)`

Extract comments from a YouTube video with pagination support.

#### Parameters

- `options` (Object):
  - `videoID` (String, required): YouTube video ID
  - `limit` (Number, optional): Maximum comments to return. Default: `50`
  - `sortBy` (String, optional): Sort order - `'top'` or `'newest'`. Default: `'top'`
  - `pageToken` (String, optional): For pagination (future use)

#### Returns

```js
{
  video: {
    id: "JueUvj6X3DA",
    title: "Video Title",
    channel: {
      name: "Channel Name",
      url: "https://youtube.com/@channel"
    },
    views: "1.5M views"
  },
  comments: [
    {
      author: "Username",
      authorUrl: "https://youtube.com/@username",
      authorAvatar: "https://...",
      text: "Great video! Thanks for sharing...",
      time: "2 days ago",
      likes: "245",
      replyCount: "12"
    }
    // ... more comments
  ],
  totalComments: 1566,
  totalLoaded: 50,
  hasMore: true,
  sortBy: "top"
}
```

## License

MIT