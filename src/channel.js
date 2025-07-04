import { createBrowser, createPage, handleCookieConsent } from './utils/browser.js';
import { scrollAndWaitForMore } from './utils/scroll.js';
import { extractVideoData, extractChannelInfo } from './utils/extract.js';

export async function getChannelVideos({ channelURL, limit = 30, pageToken = null }) {
  const browser = await createBrowser();

  try {
    const page = await createPage(browser);
    
    // Construct the full URL
    let fullURL;
    if (channelURL.startsWith('http')) {
      // Ensure we're on the videos tab
      fullURL = channelURL.includes('/videos') ? channelURL : channelURL.replace(/\/?$/, '/videos');
    } else if (channelURL.startsWith('@')) {
      fullURL = `https://youtube.com/${channelURL}/videos`;
    } else if (channelURL.startsWith('UC')) {
      fullURL = `https://youtube.com/channel/${channelURL}/videos`;
    } else {
      fullURL = `https://youtube.com/c/${channelURL}/videos`;
    }
    
    console.error(`Navigating to ${fullURL}`);
    await page.goto(fullURL, {
      waitUntil: 'networkidle2',
      timeout: 60000
    });
    
    // Handle cookie consent
    await handleCookieConsent(page);
    
    // Wait a bit for dynamic content
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Wait for initial videos to load
    await page.waitForSelector('ytd-rich-item-renderer', { timeout: 30000 });
    console.error('Initial videos loaded');
    
    // Extract channel info
    const channelInfo = await extractChannelInfo(page);
    
    let allVideos = [];
    let currentCount = 0;
    
    // Load videos up to the limit
    while (allVideos.length < limit) {
      const videos = await extractVideoData(page);
      allVideos = videos;
      
      if (videos.length === currentCount) {
        // No more videos to load
        break;
      }
      
      currentCount = videos.length;
      
      if (currentCount < limit) {
        // Try to load more videos
        const newCount = await scrollAndWaitForMore(page, 'ytd-rich-item-renderer', currentCount);
        if (newCount === currentCount) {
          break; // No new videos loaded
        }
      }
    }
    
    // Trim to requested limit
    const resultVideos = allVideos.slice(0, limit);
    
    console.error(`Successfully extracted ${resultVideos.length} videos`);
    
    return {
      channel: channelInfo,
      videos: resultVideos,
      totalLoaded: allVideos.length,
      hasMore: allVideos.length > limit
    };
    
  } catch (error) {
    console.error('Error extracting channel videos:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

export async function searchChannelVideos({ channelURL, query, limit = 30 }) {
  const browser = await createBrowser();

  try {
    const page = await createPage(browser);
    
    // Navigate to channel page
    let fullURL;
    if (channelURL.startsWith('http')) {
      // Remove /videos if present to get to main channel page
      fullURL = channelURL.replace(/\/videos\/?$/, '');
    } else if (channelURL.startsWith('@')) {
      fullURL = `https://youtube.com/${channelURL}`;
    } else if (channelURL.startsWith('UC')) {
      fullURL = `https://youtube.com/channel/${channelURL}`;
    } else {
      fullURL = `https://youtube.com/c/${channelURL}`;
    }
    
    console.error(`Navigating to ${fullURL}`);
    await page.goto(fullURL, {
      waitUntil: 'networkidle2',
      timeout: 60000
    });
    
    // Handle cookie consent
    await handleCookieConsent(page);
    
    // Wait for page to load
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Look for search icon in channel header
    const searchButtonSelectors = [
      'ytd-channel-header-renderer yt-icon-button[aria-label*="Search"]',
      'ytd-channel-header-renderer button[aria-label*="Search"]',
      '#channel-header yt-icon-button[aria-label*="Search"]',
      'yt-icon[icon="yt-icons:search"]'
    ];
    
    let searchClicked = false;
    for (const selector of searchButtonSelectors) {
      try {
        const searchButton = await page.$(selector);
        if (searchButton) {
          const isVisible = await searchButton.evaluate(el => {
            const rect = el.getBoundingClientRect();
            return rect.width > 0 && rect.height > 0;
          });
          
          if (isVisible) {
            await searchButton.click();
            console.error('Clicked search button');
            searchClicked = true;
            break;
          }
        }
      } catch (e) {
        // Try next selector
      }
    }
    
    if (!searchClicked) {
      // Try clicking on the search icon itself
      const clicked = await page.evaluate(() => {
        const icons = document.querySelectorAll('yt-icon');
        for (const icon of icons) {
          if (icon.getAttribute('icon') === 'yt-icons:search') {
            const button = icon.closest('button') || icon.closest('yt-icon-button');
            if (button) {
              button.click();
              return true;
            }
          }
        }
        return false;
      });
      
      if (clicked) {
        console.error('Clicked search icon');
        searchClicked = true;
      }
    }
    
    if (!searchClicked) {
      throw new Error('Could not find channel search button');
    }
    
    // Wait for search input to appear
    await page.waitForSelector('input[placeholder*="Search"]', { timeout: 5000 });
    
    // Type search query
    await page.type('input[placeholder*="Search"]', query);
    await page.keyboard.press('Enter');
    
    // Wait for search results
    await new Promise(resolve => setTimeout(resolve, 3000));
    await page.waitForSelector('ytd-video-renderer, ytd-rich-item-renderer', { timeout: 10000 });
    
    // Extract search results
    const searchResults = await page.evaluate(() => {
      // Try different selectors for search results
      let videos = document.querySelectorAll('ytd-video-renderer');
      if (videos.length === 0) {
        videos = document.querySelectorAll('ytd-rich-item-renderer');
      }
      
      return Array.from(videos).map(video => {
        // Extract video ID
        const link = video.querySelector('a#video-title, a#video-title-link');
        const href = link ? link.href : '';
        const videoId = href.match(/watch\?v=([^&]+)/)?.[1] || '';
        
        // Extract title
        const titleElement = video.querySelector('#video-title');
        const title = titleElement ? titleElement.textContent.trim() : '';
        
        // Extract metadata
        const viewsElement = video.querySelector('#metadata-line span:first-child, .view-count');
        const views = viewsElement ? viewsElement.textContent : '';
        
        const timeElement = video.querySelector('#metadata-line span:last-child, .published-time');
        const uploadTime = timeElement ? timeElement.textContent : '';
        
        // Extract duration
        const durationElement = video.querySelector('ytd-thumbnail-overlay-time-status-renderer span, .video-time');
        const duration = durationElement ? durationElement.textContent.trim() : '';
        
        // Extract thumbnail
        const thumbnail = video.querySelector('img#img')?.src || '';
        
        return {
          id: videoId,
          title,
          views,
          uploadTime,
          duration,
          thumbnail,
          url: `https://youtube.com/watch?v=${videoId}`
        };
      }).filter(video => video.id && video.title);
    });
    
    console.error(`Found ${searchResults.length} videos matching "${query}"`);
    
    return {
      query,
      results: searchResults.slice(0, limit),
      totalFound: searchResults.length
    };
    
  } catch (error) {
    console.error('Error searching channel videos:', error);
    throw error;
  } finally {
    await browser.close();
  }
}