import puppeteer from 'puppeteer';

export async function createBrowser() {
  const options = {
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1920,1080', '--disable-dev-shm-usage']
  };
  
  // Add executablePath if environment variable is set
  if (process.env.PUPPETEER_EXECUTABLE_PATH) {
    options.executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;
  }
  
  return await puppeteer.launch(options);
}

export async function createPage(browser) {
  const page = await browser.newPage();
  
  // Set viewport to a standard desktop size
  await page.setViewport({ width: 1920, height: 1080 });
  
  // Set a realistic user agent
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
  
  return page;
}

export async function handleCookieConsent(page) {
  try {
    const consentButton = await page.$('[aria-label*="Accept all"], [aria-label*="Accept cookies"], button:has-text("Accept all")');
    if (consentButton) {
      await consentButton.click();
      console.error('Accepted cookies');
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  } catch (e) {
    // Cookie consent not present or already accepted
  }
}

export async function skipAds(page) {
  try {
    const skipButton = await page.$('.ytp-ad-skip-button, .ytp-skip-ad-button');
    if (skipButton) {
      await skipButton.click();
      console.error('Skipped ad');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  } catch (e) {
    // No skip button
  }
}