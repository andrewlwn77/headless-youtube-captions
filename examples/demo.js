import { getSubtitles, getChannelVideos, searchChannelVideos, getVideoComments } from '../src/index.js';

console.log('=== Headless YouTube Captions Demo ===\n');

// Example 1: Get video transcript
console.log('1. Extracting video transcript...');
try {
  const captions = await getSubtitles({ 
    videoID: 'JueUvj6X3DA' 
  });
  console.log(`✓ Extracted ${captions.length} caption segments`);
  console.log(`  First caption: "${captions[0].text}"`);
  console.log('');
} catch (error) {
  console.error('✗ Error:', error.message);
}

// Example 2: Get channel videos
console.log('2. Getting channel videos...');
try {
  const result = await getChannelVideos({ 
    channelURL: '@mkbhd',
    limit: 5 
  });
  console.log(`✓ Found ${result.videos.length} videos from ${result.channel.name || 'channel'}`);
  result.videos.forEach((video, i) => {
    console.log(`  ${i + 1}. ${video.title} (${video.views}, ${video.uploadTime})`);
  });
  console.log('');
} catch (error) {
  console.error('✗ Error:', error.message);
}

// Example 3: Search channel videos
console.log('3. Searching channel videos...');
try {
  const result = await searchChannelVideos({ 
    channelURL: '@mkbhd',
    query: 'iphone',
    limit: 3 
  });
  console.log(`✓ Found ${result.results.length} videos matching "${result.query}"`);
  result.results.forEach((video, i) => {
    console.log(`  ${i + 1}. ${video.title} (${video.duration})`);
  });
  console.log('');
} catch (error) {
  console.error('✗ Error:', error.message);
}

// Example 4: Get video comments
console.log('4. Getting video comments...');
try {
  const result = await getVideoComments({ 
    videoID: 'JueUvj6X3DA',
    limit: 5,
    sortBy: 'top'
  });
  console.log(`✓ Extracted ${result.comments.length} of ${result.totalComments} total comments`);
  console.log(`  Video: "${result.video.title}" by ${result.video.channel.name}`);
  result.comments.forEach((comment, i) => {
    console.log(`  ${i + 1}. ${comment.author} (${comment.likes} likes): "${comment.text.substring(0, 60)}..."`);
  });
} catch (error) {
  console.error('✗ Error:', error.message);
}

console.log('\nDemo complete!');