const puppeteer = require("puppeteer");

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  });
  const page = await browser.newPage();

  await page.goto("https://www.backstage.com/casting/?geo=-118.2868%2C33.9993&radius=250&location=Los+Angeles%2C+California&exclude_worldwide=True&sort_by=relevance", {
    waitUntil: "networkidle2"
  });

  for (let i = 0; i < 5; i++) {
    await page.evaluate(() => window.scrollBy(0, window.innerHeight));
    await page.waitForTimeout(2000);
  }

  const listings = await page.evaluate(() => {
    const cards = document.querySelectorAll('[data-test="casting-call-card"]');
    return Array.from(cards).map(card => ({
      title: card.querySelector('[data-test="casting-call-title"]')?.innerText,
      company: card.querySelector('[data-test="company-name"]')?.innerText,
      date: card.querySelector('[data-test="posted-date"]')?.innerText,
      location: card.querySelector('[data-test="casting-call-location"]')?.innerText,
      link: card.querySelector("a")?.href,
    }));
  });

  console.log(listings);
  await browser.close();
})();
