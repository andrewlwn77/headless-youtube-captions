import { createBrowser, createPage, handleCookieConsent } from './utils/browser.js';

/**
 * Search across all of YouTube for videos and channels
 * @param {Object} options - Search options
 * @param {string} options.query - Search term
 * @param {number} [options.maxResults=10] - Maximum number of results (1-20)
 * @param {string[]} [options.resultTypes=['all']] - Types of results to include ('videos', 'channels', 'all')
 * @returns {Promise<Object>} Search results with videos and channels
 */
export async function searchYouTubeGlobal({ query, maxResults = 10, resultTypes = ['all'] }) {
  // Validate inputs
  if (!query || !query.trim()) {
    throw new Error('Search query cannot be empty');
  }

  if (maxResults < 1 || maxResults > 20) {
    throw new Error('maxResults must be between 1 and 20');
  }

  const browser = await createBrowser();

  try {
    const page = await createPage(browser);
    
    // Navigate to YouTube search results
    const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query.trim())}`;
    console.error(`Navigating to ${searchUrl}`);
    
    await page.goto(searchUrl, {
      waitUntil: 'networkidle2',
      timeout: 60000
    });

    // Handle cookie consent
    await handleCookieConsent(page);
    
    // Wait for search results to load
    await new Promise(resolve => setTimeout(resolve, 3000));
    await page.waitForSelector('#contents', { timeout: 30000 });
    console.error('Search results page loaded');

    // Extract search results using validated selectors from discovery work
    const searchResults = await page.evaluate((maxResults, resultTypes) => {
      const results = [];
      
      // Use validated selectors from BMAD discovery work
      const videoElements = document.querySelectorAll('#contents ytd-video-renderer');
      const channelElements = document.querySelectorAll('#contents ytd-channel-renderer');
      
      // Extract video results
      if (resultTypes.includes('all') || resultTypes.includes('videos')) {
        Array.from(videoElements).forEach((element, index) => {
          if (results.length >= maxResults) return;
          
          try {
            // Use validated selectors: h3 a for video titles
            const titleElement = element.querySelector('h3 a');
            const title = titleElement ? titleElement.textContent.trim() : '';
            const url = titleElement ? titleElement.href : '';
            
            // Extract video ID from URL
            const videoId = url.match(/watch\?v=([^&]+)/)?.[1] || '';
            
            // Channel name using validated selector
            const channelElement = element.querySelector('#text a[href*="/channel/"], #text a[href*="/@"]');
            const channel = channelElement ? channelElement.textContent.trim() : '';
            
            // Metadata extraction
            const metadataElement = element.querySelector('#metadata-line');
            let views = '';
            let uploadTime = '';
            
            if (metadataElement) {
              const spans = metadataElement.querySelectorAll('span');
              if (spans.length >= 2) {
                views = spans[0].textContent.trim();
                uploadTime = spans[1].textContent.trim();
              }
            }
            
            // Duration
            const durationElement = element.querySelector('ytd-thumbnail-overlay-time-status-renderer span');
            const duration = durationElement ? durationElement.textContent.trim() : '';
            
            // Thumbnail
            const thumbnailElement = element.querySelector('img');
            const thumbnail = thumbnailElement ? thumbnailElement.src : '';
            
            if (title && url && videoId) {
              results.push({
                id: videoId,
                type: 'video',
                title: title,
                url: url,
                channel: channel,
                views: views,
                uploadTime: uploadTime,
                duration: duration,
                thumbnail: thumbnail
              });
            }
          } catch (e) {
            console.error('Error extracting video result:', e);
          }
        });
      }
      
      // Extract channel results
      if (resultTypes.includes('all') || resultTypes.includes('channels')) {
        Array.from(channelElements).forEach((element, index) => {
          if (results.length >= maxResults) return;
          
          try {
            // Channel title and URL
            const titleElement = element.querySelector('#text a');
            const title = titleElement ? titleElement.textContent.trim() : '';
            const url = titleElement ? titleElement.href : '';
            
            // Extract channel ID from URL
            const channelId = url.match(/channel\/([^/]+)/)?.[1] || url.match(/@([^/]+)/)?.[1] || '';
            
            // Subscriber count
            const subsElement = element.querySelector('#subscribers');
            const subscribers = subsElement ? subsElement.textContent.trim() : '';
            
            // Video count
            const videoCountElement = element.querySelector('#video-count');
            const videoCount = videoCountElement ? videoCountElement.textContent.trim() : '';
            
            // Thumbnail
            const thumbnailElement = element.querySelector('img');
            const thumbnail = thumbnailElement ? thumbnailElement.src : '';
            
            if (title && url && channelId) {
              results.push({
                id: channelId,
                type: 'channel',
                title: title,
                url: url,
                subscribers: subscribers,
                videoCount: videoCount,
                thumbnail: thumbnail
              });
            }
          } catch (e) {
            console.error('Error extracting channel result:', e);
          }
        });
      }
      
      return results;
    }, maxResults, resultTypes);

    console.error(`Successfully extracted ${searchResults.length} search results`);
    
    return {
      query: query.trim(),
      resultTypes: resultTypes,
      maxResults: maxResults,
      totalFound: searchResults.length,
      results: searchResults
    };

  } catch (error) {
    console.error('Error performing YouTube search:', error);
    throw error;
  } finally {
    await browser.close();
  }
}