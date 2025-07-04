export async function extractVideoData(page) {
  return await page.evaluate(() => {
    const videos = document.querySelectorAll('ytd-rich-item-renderer');
    return Array.from(videos).map(video => {
      const link = video.querySelector('a#video-title-link');
      const href = link ? link.href : '';
      const videoId = href.match(/watch\?v=([^&]+)/)?.[1] || '';
      
      const titleElement = video.querySelector('#video-title');
      const title = titleElement ? titleElement.textContent.trim() : '';
      
      const metadataLine = video.querySelector('#metadata-line');
      const metadataSpans = metadataLine ? metadataLine.querySelectorAll('span') : [];
      const views = metadataSpans[0]?.textContent || '';
      const uploadTime = metadataSpans[metadataSpans.length - 1]?.textContent || '';
      
      const durationElement = video.querySelector('ytd-thumbnail-overlay-time-status-renderer span');
      const duration = durationElement ? durationElement.textContent.trim() : '';
      
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
}

export async function extractCommentData(page) {
  return await page.evaluate(() => {
    const threads = document.querySelectorAll('ytd-comment-thread-renderer');
    return Array.from(threads).map(thread => {
      const authorElement = thread.querySelector('#author-text');
      const author = authorElement ? authorElement.textContent.trim() : '';
      const authorUrl = authorElement ? authorElement.href : '';
      
      const textElement = thread.querySelector('#content-text');
      const text = textElement ? textElement.textContent.trim() : '';
      
      const timeElement = thread.querySelector('#published-time-text');
      const time = timeElement ? timeElement.textContent.trim() : '';
      
      const likesElement = thread.querySelector('#vote-count-middle');
      const likes = likesElement ? likesElement.textContent.trim() : '0';
      
      const replyElement = thread.querySelector('#more-replies');
      const replyText = replyElement ? replyElement.textContent : '';
      const replyCount = replyText.match(/\d+/)?.[0] || '0';
      
      const avatarElement = thread.querySelector('#author-thumbnail img');
      const authorAvatar = avatarElement ? avatarElement.src : '';
      
      return {
        author,
        authorUrl,
        authorAvatar,
        text,
        time,
        likes,
        replyCount
      };
    }).filter(comment => comment.text && comment.author);
  });
}

export async function extractChannelInfo(page) {
  return await page.evaluate(() => {
    // Try multiple selectors for channel name
    const nameSelectors = [
      'ytd-channel-name yt-formatted-string',
      '#channel-name yt-formatted-string',
      '.ytd-channel-name',
      '#text.ytd-channel-name',
      'yt-formatted-string.ytd-channel-name'
    ];
    
    let channelName = '';
    for (const selector of nameSelectors) {
      const element = document.querySelector(selector);
      if (element && element.textContent) {
        channelName = element.textContent.trim();
        break;
      }
    }
    
    const subscriberCount = document.querySelector('#subscriber-count')?.textContent?.trim() || '';
    const videoCount = document.querySelector('#videos-count')?.textContent?.trim() || '';
    
    return {
      name: channelName,
      subscribers: subscriberCount,
      videoCount: videoCount
    };
  });
}