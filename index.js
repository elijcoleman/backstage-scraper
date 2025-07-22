const puppeteer = require("puppeteer");

(async () => {
  try {
    console.log("🚀 Launching Puppeteer...");

    const revision = '1263111';
    const browserFetcher = puppeteer.createBrowserFetcher();
    const revisionInfo = await browserFetcher.download(revision);

    const browser = await puppeteer.launch({
      headless: true,  // changed from "new" to boolean true
      executablePath: revisionInfo.executablePath,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-blink-features=AutomationControlled"
      ],
      ignoreDefaultArgs: ["--enable-automation"],
    });

    console.log("🌐 Opening new page...");
    const page = await browser.newPage();

    const url =
      "https://www.backstage.com/casting/?geo=-118.2868%2C33.9993&radius=250&location=Los+Angeles%2C+California&exclude_worldwide=True&sort_by=relevance";

    console.log(`🔗 Navigating to: ${url}`);
    await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 }); // add 60s timeout

    console.log("📜 Scrolling page...");
    for (let i = 0; i < 5; i++) {
      await page.evaluate(() => window.scrollBy(0, window.innerHeight));
      await page.waitForTimeout(2000);
    }

    console.log("🔍 Scraping listings...");

    // Check if any cards found before mapping
    const cardCount = await page.evaluate(() => document.querySelectorAll('[data-test="casting-call-card"]').length);
    console.log(`🔎 Found ${cardCount} casting call cards`);

    if (cardCount === 0) {
      throw new Error("No casting call cards found on the page");
    }

    const listings = await page.evaluate(() => {
      const cards = document.querySelectorAll('[data-test="casting-call-card"]');
      return Array.from(cards).map((card) => ({
        title: card.querySelector('[data-test="casting-call-title"]')?.innerText,
        company: card.querySelector('[data-test="company-name"]')?.innerText,
        date: card.querySelector('[data-test="posted-date"]')?.innerText,
        location: card.querySelector('[data-test="casting-call-location"]')?.innerText,
        link: card.querySelector("a")?.href,
      }));
    });

    console.log(`✅ Found ${listings.length} listings`);
    listings.forEach((l, i) => {
      console.log(`[${i + 1}] ${l.title} – ${l.company} (${l.date})`);
    });

    await browser.close();
    console.log("🎉 Scraper finished successfully!");
  } catch (error) {
    console.error("❌ Scraper crashed with error:");
    console.error(error);
  }
})();
