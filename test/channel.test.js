import { test } from 'node:test';
import assert from 'node:assert';
import { getChannelVideos, searchChannelVideos } from '../src/index.js';

test('Extract channel videos', async () => {
  const result = await getChannelVideos({ 
    channelURL: '@mkbhd',
    limit: 10 
  });
  
  // Check result structure
  assert(result.channel, 'Should have channel info');
  assert(result.channel.name, 'Channel should have name');
  assert(Array.isArray(result.videos), 'Videos should be an array');
  assert(result.videos.length > 0, 'Should extract at least one video');
  assert(result.videos.length <= 10, 'Should respect limit');
  
  // Check video structure
  const firstVideo = result.videos[0];
  assert(typeof firstVideo.id === 'string', 'Video ID should be a string');
  assert(typeof firstVideo.title === 'string', 'Title should be a string');
  assert(typeof firstVideo.views === 'string', 'Views should be a string');
  assert(typeof firstVideo.uploadTime === 'string', 'Upload time should be a string');
  assert(typeof firstVideo.duration === 'string', 'Duration should be a string');
  assert(typeof firstVideo.url === 'string', 'URL should be a string');
  assert(firstVideo.url.includes('youtube.com/watch'), 'URL should be a YouTube watch URL');
});

test('Search channel videos', async () => {
  const result = await searchChannelVideos({ 
    channelURL: '@mkbhd',
    query: 'iphone',
    limit: 5 
  });
  
  // Check result structure
  assert.equal(result.query, 'iphone', 'Should return the query');
  assert(Array.isArray(result.results), 'Results should be an array');
  assert(result.results.length > 0, 'Should find at least one video');
  assert(result.results.length <= 5, 'Should respect limit');
  
  // Check that results are relevant (title should contain query)
  const hasRelevantResult = result.results.some(video => 
    video.title.toLowerCase().includes('iphone')
  );
  assert(hasRelevantResult, 'At least one result should contain "iphone" in title');
});

test('Handle channel URL formats', async () => {
  // Test with @handle format
  const result1 = await getChannelVideos({ 
    channelURL: '@LinusTechTips',
    limit: 5 
  });
  assert(result1.videos.length > 0, 'Should work with @handle format');
  
  // Test with full URL
  const result2 = await getChannelVideos({ 
    channelURL: 'https://youtube.com/@LinusTechTips',
    limit: 5 
  });
  assert(result2.videos.length > 0, 'Should work with full URL format');
});