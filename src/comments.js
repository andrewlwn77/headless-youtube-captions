import { createBrowser, createPage, handleCookieConsent, skipAds } from './utils/browser.js';
import { scrollToLoadComments, scrollAndWaitForMore } from './utils/scroll.js';
import { extractCommentData } from './utils/extract.js';

export async function getVideoComments({ videoID, limit = 50, sortBy = 'top', pageToken = null }) {
  const browser = await createBrowser();

  try {
    const page = await createPage(browser);
    
    // Navigate to the YouTube video page
    console.error(`Navigating to https://youtube.com/watch?v=${videoID}`);
    await page.goto(`https://youtube.com/watch?v=${videoID}`, {
      waitUntil: 'networkidle2',
      timeout: 60000
    });
    
    // Wait for video player to load
    await page.waitForSelector('#movie_player, video', { timeout: 30000 });
    console.error('Video player loaded');
    
    // Handle cookie consent
    await handleCookieConsent(page);
    
    // Skip ads if present
    await skipAds(page);
    
    // Wait for page to stabilize
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Scroll to load comments
    const commentsLoaded = await scrollToLoadComments(page);
    if (!commentsLoaded) {
      throw new Error('Could not load comments section');
    }
    
    // Wait for comment threads to load
    await page.waitForSelector('ytd-comment-thread-renderer', { 
      timeout: 10000,
      visible: true 
    });
    
    console.error('Comments section loaded');
    
    // Extract total comment count
    const commentCount = await page.evaluate(() => {
      const countElement = document.querySelector('ytd-comments-header-renderer h2 yt-formatted-string');
      if (countElement) {
        const text = countElement.textContent;
        const match = text.match(/[\d,]+/);
        return match ? match[0].replace(/,/g, '') : '0';
      }
      return '0';
    });
    
    // Check if we need to change sort order
    if (sortBy === 'newest') {
      // Click on sort menu
      const sortMenuClicked = await page.evaluate(() => {
        const sortButton = document.querySelector('ytd-comments-header-renderer tp-yt-paper-dropdown-menu-light');
        if (sortButton) {
          sortButton.click();
          return true;
        }
        return false;
      });
      
      if (sortMenuClicked) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Click on "Newest first" option
        await page.evaluate(() => {
          const menuItems = document.querySelectorAll('tp-yt-paper-listbox tp-yt-paper-item');
          for (const item of menuItems) {
            if (item.textContent.includes('Newest') || item.textContent.includes('newest')) {
              item.click();
              break;
            }
          }
        });
        
        // Wait for comments to reload
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    }
    
    let allComments = [];
    let currentCount = 0;
    
    // Load comments up to the limit
    while (allComments.length < limit) {
      const comments = await extractCommentData(page);
      allComments = comments;
      
      if (comments.length === currentCount) {
        // No more comments to load
        break;
      }
      
      currentCount = comments.length;
      
      if (currentCount < limit) {
        // Try to load more comments
        const newCount = await scrollAndWaitForMore(page, 'ytd-comment-thread-renderer', currentCount, 3000);
        if (newCount === currentCount) {
          break; // No new comments loaded
        }
      }
    }
    
    // Trim to requested limit
    const resultComments = allComments.slice(0, limit);
    
    console.error(`Successfully extracted ${resultComments.length} comments`);
    
    // Extract video info
    const videoInfo = await page.evaluate(() => {
      const titleElement = document.querySelector('h1.ytd-video-primary-info-renderer');
      const title = titleElement ? titleElement.textContent.trim() : '';
      
      const channelElement = document.querySelector('ytd-channel-name a');
      const channelName = channelElement ? channelElement.textContent.trim() : '';
      const channelUrl = channelElement ? channelElement.href : '';
      
      const viewsElement = document.querySelector('.view-count');
      const views = viewsElement ? viewsElement.textContent : '';
      
      return {
        title,
        channel: {
          name: channelName,
          url: channelUrl
        },
        views
      };
    });
    
    return {
      video: {
        id: videoID,
        ...videoInfo
      },
      comments: resultComments,
      totalComments: parseInt(commentCount),
      totalLoaded: allComments.length,
      hasMore: allComments.length > limit,
      sortBy
    };
    
  } catch (error) {
    console.error('Error extracting comments:', error);
    throw error;
  } finally {
    await browser.close();
  }
}