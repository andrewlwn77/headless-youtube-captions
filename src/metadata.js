import { createBrowser, createPage, handleCookieConsent, skipAds } from './utils/browser.js';

/**
 * Extract comprehensive video metadata including description
 * @param {Object} options - Extraction options
 * @param {string} options.videoID - YouTube video ID
 * @param {boolean} [options.expandDescription=true] - Whether to expand truncated descriptions
 * @returns {Promise<Object>} Video metadata object
 */
export async function getVideoMetadata({ videoID, expandDescription = true }) {
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

    // Scroll down to ensure description area is loaded
    await page.evaluate(() => window.scrollBy(0, 800));
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Check if description expansion is needed
    let descriptionExpanded = false;
    if (expandDescription) {
      try {
        const expandButton = await page.$('#description-inline-expander #expand');
        if (expandButton) {
          const isVisible = await expandButton.evaluate(el => {
            const rect = el.getBoundingClientRect();
            return rect.width > 0 && rect.height > 0;
          });
          
          if (isVisible) {
            await expandButton.click();
            console.error('Clicked description expand button');
            descriptionExpanded = true;
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
      } catch (e) {
        console.error('Could not expand description:', e.message);
      }
    }

    // Extract comprehensive metadata
    console.error('Extracting video metadata...');
    const metadata = await page.evaluate(() => {
      // Video title
      const titleSelectors = [
        'h1.ytd-video-primary-info-renderer yt-formatted-string',
        'h1.ytd-video-primary-info-renderer',
        '#title h1',
        '.ytd-video-primary-info-renderer h1'
      ];
      let title = '';
      for (const selector of titleSelectors) {
        const element = document.querySelector(selector);
        if (element && element.textContent) {
          title = element.textContent.trim();
          break;
        }
      }

      // Video description
      const descriptionSelectors = [
        '.ytd-expandable-video-description-body-renderer',
        '#description-inline-expander yt-formatted-string',
        '#description yt-formatted-string',
        '.ytd-video-secondary-info-renderer #description'
      ];
      let description = '';
      for (const selector of descriptionSelectors) {
        const element = document.querySelector(selector);
        if (element && element.textContent) {
          description = element.textContent.trim();
          if (description.length > 0) break;
        }
      }

      // Upload date
      const uploadDateSelectors = [
        '#info-strings yt-formatted-string',
        '#info .date',
        '.ytd-video-primary-info-renderer #info-strings'
      ];
      let uploadDate = '';
      for (const selector of uploadDateSelectors) {
        const element = document.querySelector(selector);
        if (element && element.textContent) {
          uploadDate = element.textContent.trim();
          break;
        }
      }

      // View count
      const viewCountSelectors = [
        '#info .view-count',
        '.ytd-video-primary-info-renderer .view-count',
        '#count .view-count'
      ];
      let viewCount = '';
      for (const selector of viewCountSelectors) {
        const element = document.querySelector(selector);
        if (element && element.textContent) {
          viewCount = element.textContent.trim();
          break;
        }
      }

      // Like count
      const likeCountSelectors = [
        '#top-level-buttons-computed button[aria-label*="like"] span',
        '#segmented-like-button span',
        'button[aria-label*="like"] .yt-spec-button-shape-next__button-text-content'
      ];
      let likeCount = '';
      for (const selector of likeCountSelectors) {
        const element = document.querySelector(selector);
        if (element && element.textContent) {
          const text = element.textContent.trim();
          if (text && !text.includes('LIKE')) {
            likeCount = text;
            break;
          }
        }
      }

      // Channel info
      const channelNameSelectors = [
        '#owner-name a',
        '.ytd-channel-name a',
        '#channel-name yt-formatted-string'
      ];
      let channelName = '';
      let channelUrl = '';
      for (const selector of channelNameSelectors) {
        const element = document.querySelector(selector);
        if (element && element.textContent) {
          channelName = element.textContent.trim();
          channelUrl = element.href || '';
          break;
        }
      }

      // Video duration (from player or metadata)
      const durationSelectors = [
        '.ytp-time-duration',
        'ytd-thumbnail-overlay-time-status-renderer span',
        '.ytd-thumbnail-overlay-time-status-renderer'
      ];
      let duration = '';
      for (const selector of durationSelectors) {
        const element = document.querySelector(selector);
        if (element && element.textContent) {
          duration = element.textContent.trim();
          break;
        }
      }

      return {
        title,
        description,
        uploadDate,
        viewCount,
        likeCount,
        channelName,
        channelUrl,
        duration
      };
    });

    if (!metadata.title) {
      throw new Error('Could not extract video metadata - video may not exist or be private');
    }

    console.error(`Successfully extracted metadata for: ${metadata.title}`);

    return {
      video: {
        id: videoID,
        title: metadata.title,
        description: metadata.description,
        uploadDate: metadata.uploadDate,
        viewCount: metadata.viewCount,
        likeCount: metadata.likeCount,
        duration: metadata.duration
      },
      channel: {
        name: metadata.channelName,
        url: metadata.channelUrl
      },
      metadata: {
        extractedAt: new Date().toISOString(),
        descriptionExpanded: descriptionExpanded
      }
    };

  } catch (error) {
    console.error('Error extracting video metadata:', error);
    throw error;
  } finally {
    await browser.close();
  }
}