import { createBrowser, createPage, handleCookieConsent, skipAds } from './utils/browser.js';

// Export existing function
export async function getSubtitles({ videoID, lang = 'en' }) {
  const browser = await createBrowser();

  try {
    const page = await createPage(browser);
    
    // Navigate to the YouTube video page
    console.error(`Navigating to https://youtube.com/watch?v=${videoID}`);
    await page.goto(`https://youtube.com/watch?v=${videoID}`, {
      waitUntil: 'networkidle2',
      timeout: 60000
    });

    // Wait for initial page load
    await page.waitForSelector('#movie_player, video', { timeout: 30000 });
    console.error('Video player loaded');

    // Wait a bit more for dynamic content to load
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Handle cookie consent if present
    await handleCookieConsent(page);

    // Skip ads if present
    await skipAds(page);

    // Scroll down to load more content
    await page.evaluate(() => window.scrollBy(0, 800));
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Click on "more" to expand description if needed
    try {
      // Multiple selectors for the more button
      const moreSelectors = [
        'tp-yt-paper-button#expand',
        'tp-yt-paper-button[id="expand"]',
        '#expand',
        '#more',
        'yt-formatted-string:has-text("...more")',
        '[aria-label*="more"]'
      ];
      
      for (const selector of moreSelectors) {
        try {
          const moreButton = await page.$(selector);
          if (moreButton) {
            const isVisible = await moreButton.evaluate(el => {
              const rect = el.getBoundingClientRect();
              return rect.width > 0 && rect.height > 0;
            });
            
            if (isVisible) {
              await moreButton.click();
              console.error('Clicked "more" button');
              await new Promise(resolve => setTimeout(resolve, 1000));
              break;
            }
          }
        } catch (e) {
          // Try next selector
        }
      }
    } catch (e) {
      console.error('No "more" button found or error clicking it');
    }

    // Look for and click the "Show transcript" button
    console.error('Looking for "Show transcript" button...');
    
    // Multiple strategies to find the transcript button
    const transcriptButtonSelectors = [
      'button[aria-label="Show transcript"]',
      'yt-button-shape button[aria-label="Show transcript"]',
      'button[title*="transcript" i]',
      'button[aria-label*="transcript" i]',
      'yt-button-shape[aria-label*="transcript" i]',
      '#button[aria-label*="transcript" i]',
      'ytd-button-renderer[aria-label*="transcript" i]'
    ];

    let transcriptClicked = false;
    
    for (const selector of transcriptButtonSelectors) {
      try {
        await page.waitForSelector(selector, { timeout: 3000, visible: true });
        await page.click(selector);
        console.error(`Clicked transcript button with selector: ${selector}`);
        transcriptClicked = true;
        break;
      } catch (e) {
        // Try next selector
      }
    }

    if (!transcriptClicked) {
      // Try finding by text content
      console.error('Trying to find transcript button by text...');
      const clicked = await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button, yt-button-shape'));
        for (const button of buttons) {
          const text = button.textContent || '';
          const ariaLabel = button.getAttribute('aria-label') || '';
          if (text.toLowerCase().includes('transcript') || ariaLabel.toLowerCase().includes('transcript')) {
            button.click();
            return true;
          }
        }
        return false;
      });
      
      if (clicked) {
        console.error('Clicked transcript button by text search');
        transcriptClicked = true;
      }
    }

    if (!transcriptClicked) {
      throw new Error('Could not find or click "Show transcript" button');
    }

    // Wait for the transcript panel to load
    console.error('Waiting for transcript panel...');
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Wait for transcript segments
    await page.waitForSelector('ytd-transcript-segment-renderer, ytd-transcript-body-renderer', { 
      timeout: 10000,
      visible: true 
    });

    // Extract transcript data
    console.error('Extracting transcript content...');
    const transcriptData = await page.evaluate(() => {
      // Multiple selectors for transcript segments
      const segmentSelectors = [
        'ytd-transcript-segment-renderer',
        'ytd-transcript-body-renderer ytd-transcript-segment-renderer',
        'ytd-engagement-panel-section-list-renderer ytd-transcript-segment-renderer',
        '#segments-container ytd-transcript-segment-renderer',
        'ytd-transcript-segment-list-renderer ytd-transcript-segment-renderer'
      ];
      
      let segments = [];
      for (const selector of segmentSelectors) {
        segments = document.querySelectorAll(selector);
        if (segments.length > 0) {
          break;
        }
      }

      if (segments.length === 0) {
        // Try a more general approach
        segments = document.querySelectorAll('[class*="transcript"][class*="segment"]');
      }

      if (segments.length === 0) {
        return [];
      }

      // Extract data from each segment
      return Array.from(segments).map((segment) => {
        // Extract timestamp - multiple strategies
        let timestampText = '';
        const timestampSelectors = [
          '.segment-timestamp',
          '[class*="timestamp"]',
          '.ytd-transcript-segment-renderer:first-child',
          'div:first-child'
        ];
        
        for (const selector of timestampSelectors) {
          const elem = segment.querySelector(selector);
          if (elem && elem.textContent && /\d+:\d+/.test(elem.textContent)) {
            timestampText = elem.textContent.trim();
            break;
          }
        }
        
        // Extract text content - multiple strategies
        let text = '';
        const textSelectors = [
          '.segment-text',
          'yt-formatted-string.segment-text',
          '[class*="segment-text"]',
          'yt-formatted-string:last-child',
          '.ytd-transcript-segment-renderer:last-child'
        ];
        
        for (const selector of textSelectors) {
          const elem = segment.querySelector(selector);
          if (elem && elem.textContent) {
            const content = elem.textContent.trim();
            // Make sure it's not the timestamp
            if (content && !(/^\d+:\d+$/.test(content))) {
              text = content;
              break;
            }
          }
        }

        // If still no text, get all text and remove timestamp
        if (!text) {
          const fullText = segment.textContent || '';
          text = fullText.replace(timestampText, '').trim();
        }

        // Convert timestamp to seconds
        let startSeconds = 0;
        if (timestampText && timestampText.includes(':')) {
          const parts = timestampText.split(':').reverse();
          startSeconds = parts.reduce((acc, part, idx) => {
            return acc + (parseInt(part) || 0) * Math.pow(60, idx);
          }, 0);
        }

        return {
          start: startSeconds.toString(),
          dur: "3",
          text: text,
          timestamp: timestampText
        };
      }).filter(item => item.text && item.text.trim() && item.text.length > 0);
    });

    if (!transcriptData || transcriptData.length === 0) {
      throw new Error('No transcript data extracted');
    }

    console.error(`Successfully extracted ${transcriptData.length} transcript segments`);
    console.error('First segment:', transcriptData[0]);

    // Calculate proper durations
    const processedCaptions = transcriptData.map((item, index) => {
      const nextItem = transcriptData[index + 1];
      const duration = nextItem 
        ? (parseFloat(nextItem.start) - parseFloat(item.start)).toFixed(1)
        : "3.0";

      return {
        start: item.start,
        dur: duration,
        text: item.text
      };
    });

    return processedCaptions;

  } catch (error) {
    console.error('Error extracting subtitles:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

// Export new functions
export { getChannelVideos, searchChannelVideos } from './channel.js';
export { getVideoComments } from './comments.js';
export { searchYouTubeGlobal } from './search.js';
export { getVideoMetadata } from './metadata.js';