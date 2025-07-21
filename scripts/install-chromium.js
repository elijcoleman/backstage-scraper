const puppeteer = require('puppeteer');

(async () => {
  try {
    console.log('Downloading Chromium...');
    await puppeteer.createBrowserFetcher().download('1263111');
    console.log('Chromium download complete');
  } catch (err) {
    console.error('Chromium download failed:', err);
    process.exit(1);
  }
})();
