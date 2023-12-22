const puppeteer = require("puppeteer-core");

const SBR_WS_ENDPOINT =
  "wss://brd-customer-hl_8fa5cfb8-zone-chemical_101:bbtfody5gs2r@brd.superproxy.io:9222";

async function main() {
  console.log("Connecting to Scraping Browser...");
  const browser = await puppeteer.connect({
    browserWSEndpoint: SBR_WS_ENDPOINT,
  });
  const keyword = "Terbium Complex";
  const minYear = 2022;
  let scholarData = [];
  let start = 0;

  try {
    const page = await browser.newPage();
    console.log("Connected! Scraping pages...");

    do {
      const url = `https://scholar.google.com/scholar?as_ylo=${minYear}&q=${encodeURIComponent(
        keyword
      )}&hl=en&as_sdt=0,5&start=${start}`;

      await page.goto(url, { waitUntil: "domcontentloaded" });

      console.log(`Scraping page ${start / 10 + 1}...`);

      scholarData = scholarData.concat(
        await page.evaluate((keyword) => {
          const elements = document.querySelectorAll(".gs_r");
          const data = [];
          const distinctProfileLink = new Set();

          elements.forEach((element) => {
            const titleElement = element.querySelector(".gs_rt");
            const articleLinkElement = element.querySelector(".gs_rt a");
            const hrefElements = element.querySelectorAll(".gs_a a");

            if (titleElement) {
              for (const hrefElement of hrefElements) {
                const scholarLink =
                  "https://scholar.google.com" +
                  hrefElement.getAttribute("href");

                if (distinctProfileLink.has(scholarLink)) {
                  continue;
                }

                const authorName = hrefElement.textContent.trim();
                distinctProfileLink.add(scholarLink);
                const title = titleElement.textContent.trim();
                const articleLink = articleLinkElement
                  ? articleLinkElement.getAttribute("href")
                  : null;
                data.push({
                  keyword,
                  title,
                  articleLink,
                  authorName,
                  scholarLink,
                });
              }
            }
          });

          return data;
        }, keyword)
      );

      start += 10;
    } while (scholarData.length < 100);

    console.log("Results:", scholarData);
    console.log("Length:", scholarData.length);
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error(err.stack || err);
  process.exit(1);
});
