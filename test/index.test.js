import { test } from 'node:test';
import assert from 'node:assert';
import { getSubtitles } from '../src/index.js';

test('Extract passive income video captions', async () => {
  const captions = await getSubtitles({ videoID: 'JueUvj6X3DA' });
  
  // Check that captions were extracted
  assert(Array.isArray(captions), 'Captions should be an array');
  assert(captions.length > 0, 'Should extract at least one caption');
  
  // Check structure of first caption
  const firstCaption = captions[0];
  assert(typeof firstCaption.start === 'string', 'Start time should be a string');
  assert(typeof firstCaption.dur === 'string', 'Duration should be a string');
  assert(typeof firstCaption.text === 'string', 'Text should be a string');
  
  // Check that the first caption contains expected content
  assert(
    firstCaption.text.toLowerCase().includes('creating passive income'), 
    `First caption should contain "creating passive income", got: "${firstCaption.text}"`
  );
});