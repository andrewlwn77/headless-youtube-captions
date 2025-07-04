export async function scrollToBottom(page) {
  await page.evaluate(() => {
    window.scrollTo(0, document.documentElement.scrollHeight);
  });
}

export async function scrollToElement(page, selector) {
  await page.evaluate((sel) => {
    const element = document.querySelector(sel);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, selector);
}

export async function scrollAndWaitForMore(page, itemSelector, currentCount, maxWaitTime = 5000) {
  await scrollToBottom(page);
  
  const startTime = Date.now();
  while (Date.now() - startTime < maxWaitTime) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newCount = await page.evaluate((selector) => {
      return document.querySelectorAll(selector).length;
    }, itemSelector);
    
    if (newCount > currentCount) {
      return newCount;
    }
  }
  
  return currentCount;
}

export async function scrollToLoadComments(page) {
  // Scroll down to trigger comment loading
  await page.evaluate(() => window.scrollBy(0, 800));
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Wait for comments section to appear
  try {
    await page.waitForSelector('ytd-comments', { timeout: 10000 });
    return true;
  } catch (e) {
    console.error('Comments section not found');
    return false;
  }
}