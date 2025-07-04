import { test } from 'node:test';
import assert from 'node:assert';
import { getVideoComments } from '../src/index.js';

test('Extract video comments', async () => {
  const result = await getVideoComments({ 
    videoID: 'JueUvj6X3DA',
    limit: 20 
  });
  
  // Check result structure
  assert(result.video, 'Should have video info');
  assert(result.video.id === 'JueUvj6X3DA', 'Video ID should match');
  assert(result.video.title, 'Video should have title');
  assert(result.video.channel.name, 'Video should have channel name');
  
  // Check comments
  assert(Array.isArray(result.comments), 'Comments should be an array');
  assert(result.comments.length > 0, 'Should extract at least one comment');
  assert(result.comments.length <= 20, 'Should respect limit');
  assert(typeof result.totalComments === 'number', 'Total comments should be a number');
  assert(result.totalComments > 0, 'Should have total comment count');
  
  // Check comment structure
  const firstComment = result.comments[0];
  assert(typeof firstComment.author === 'string', 'Author should be a string');
  assert(typeof firstComment.text === 'string', 'Text should be a string');
  assert(typeof firstComment.time === 'string', 'Time should be a string');
  assert(typeof firstComment.likes === 'string', 'Likes should be a string');
  assert(typeof firstComment.replyCount === 'string', 'Reply count should be a string');
  assert(firstComment.authorUrl.includes('youtube.com'), 'Author URL should be valid');
});

test('Sort comments by newest', async () => {
  const result = await getVideoComments({ 
    videoID: 'JueUvj6X3DA',
    limit: 10,
    sortBy: 'newest'
  });
  
  assert.equal(result.sortBy, 'newest', 'Should use newest sort order');
  assert(result.comments.length > 0, 'Should extract comments with newest sort');
  
  // Note: We can't easily verify the sort order without parsing relative dates
  // But we can check that the API accepted the parameter
});

test('Handle pagination', async () => {
  const result = await getVideoComments({ 
    videoID: 'JueUvj6X3DA',
    limit: 100
  });
  
  // Should load more than the initial batch (usually 20)
  assert(result.totalLoaded > 20, 'Should load more than initial batch');
  assert(result.hasMore !== undefined, 'Should indicate if more comments are available');
});