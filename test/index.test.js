import { test } from 'node:test';
import assert from 'node:assert';
import { getSubtitles } from '../src/index.js';

test('Extract video captions with transcript', async () => {
  // Using Rick Astley - Never Gonna Give You Up which has stable transcripts
  const captions = await getSubtitles({ videoID: 'dQw4w9WgXcQ' });

  // Check that captions were extracted
  assert(Array.isArray(captions), 'Captions should be an array');
  assert(captions.length > 0, 'Should extract at least one caption');

  // Check structure of first caption
  const firstCaption = captions[0];
  assert(typeof firstCaption.start === 'string', 'Start time should be a string');
  assert(typeof firstCaption.dur === 'string', 'Duration should be a string');
  assert(typeof firstCaption.text === 'string', 'Text should be a string');

  // Verify we got a reasonable number of segments
  assert(captions.length > 10, `Should extract multiple captions, got ${captions.length}`);
});