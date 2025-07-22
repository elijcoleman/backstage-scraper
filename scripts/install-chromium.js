const puppeteer = require('puppeteer');

(async () => {
  try {
    console.log('📥 Downloading Chromium...');
    const fetcher = puppeteer.createBrowserFetcher();
    const revisionInfo = await fetcher.download('1263111'); // Stable Chromium
    console.log('✅ Chromium downloaded at:', revisionInfo.executablePath);
  } catch (err) {
    console.error('❌ Chromium download failed:', err);
    process.exit(1);
  }
})();
