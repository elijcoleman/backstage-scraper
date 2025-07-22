const puppeteerExtra = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
puppeteerExtra.use(StealthPlugin());

const fs = require("fs");

(async () => {
  try {
    console.log("🚀 Launching Puppeteer with stealth...");

    const browser = await puppeteerExtra.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-blink-features=AutomationControlled"
      ],
      ignoreDefaultArgs: ["--enable-automation"],
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined, // Optional for platforms like Render
    });

    console.log("🌐 Opening new page...");
    const page = await browser.newPage();

    const url =
      "https://www.backstage.com/casting/?geo=-118.2868%2C33.9993&radius=250&location=Los+Angeles%2C+California&exclude_worldwide=True&sort_by=relevance";

    console.log(`🔗 Navigating to: ${url}`);
    await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });

    console.log("📜 Scrolling page...");
    for (let i = 0; i < 5; i++) {
      await page.evaluate(() => window.scrollBy(0, window.innerHeight));
      await page.waitForTimeout(2000);
    }

    console.log("📸 Saving screenshot and HTML for debug...");
    await page.screenshot({ path: "debug_screenshot.png", fullPage: true });
    const html = await page.content();
    fs.writeFileSync("debug_page.html", html);
    console.log("✅ Screenshot and HTML saved");
    console.log("Page HTML snippet:", html.slice(0, 500).replace(/\n/g, ""));

    console.log("🔍 Scraping listings...");

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
