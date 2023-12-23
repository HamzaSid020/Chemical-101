const puppeteer = require("puppeteer-core");

const SBR_WS_ENDPOINT = "wss://brd-customer-hl_8fa5cfb8-zone-chemical_101:bbtfody5gs2r@brd.superproxy.io:9222";

async function main() {
    console.log("Connecting to Scraping Browser...");
    const browser = await puppeteer.connect({
        browserWSEndpoint: SBR_WS_ENDPOINT,
    });
    const keyword = "Terbium Complex";
    const minYear = 2022;
    let scholarData = [];

    try {
        const page = await browser.newPage();
        console.log("Connected! Navigating to search results page...");

        const url = `https://scholar.google.com/scholar?as_ylo=${minYear}&q=${encodeURIComponent(keyword)}&hl=en&as_sdt=0,5&start=10`;

        await page.goto(url, { waitUntil: "domcontentloaded" });

        console.log("Navigated! Scraping page content...");

        const results = await page.evaluate((keyword, minYear) => {
            const elements = document.querySelectorAll(".gs_r");
            const data = [];
            const distinctProfileLink = new Set();

            elements.forEach((element) => {
                const titleElement = element.querySelector(".gs_rt");
                const articleLinkElement = element.querySelector(".gs_rt a");
                const hrefElements = element.querySelectorAll(".gs_a a");

                if (titleElement) {
                    for (const hrefElement of hrefElements) {
                        const scholarLink = "https://scholar.google.com" + hrefElement.getAttribute("href");

                        if (distinctProfileLink.has(scholarLink)) {
                            continue;
                        }

                        const authorName = hrefElement.textContent.trim();
                        distinctProfileLink.add(scholarLink);
                        const title = titleElement.textContent.trim().replace(/,/g, '-');
                        const articleLink = articleLinkElement ? articleLinkElement.getAttribute("href") : null;
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
        }, keyword, minYear);

        scholarData = results;

        for (const item of scholarData) {
            console.log(`Processing data for keyword: ${item.keyword}`);
            // Perform a new page.goto for each scholarLink
            await page.goto(item.scholarLink, { waitUntil: "domcontentloaded" });
            console.log(`Navigated to ${item.scholarLink}`);

            const scholarDetails = await page.evaluate(() => {
                const nameElement = document.querySelector("#gsc_prf_inw #gsc_prf_in");
                const name = nameElement ? nameElement.textContent.trim() : null;

                const addressElement = document.querySelector(".gsc_prf_il");
                const address = addressElement ? addressElement.textContent.trim().replace(/,/g, '-') : null;

                return {
                    name,
                    address,
                    
                };
            });

            let nameParts;
            if (scholarDetails.name.includes(',')) {
                nameParts = scholarDetails.name.split(',');
                nameParts.pop();
            } else {
                nameParts = scholarDetails.name.split(' ');
            }

            const lastName = nameParts.pop().trim();
            const firstName = nameParts.join(' ').trim();

            item.firstName = firstName;
            item.lastName = lastName;
            delete item.authorName;
            delete item.scholarLink;
            item.address = scholarDetails.address;
        }

        console.log("Results:", scholarData);
    } finally {
        await browser.close();
    }
}

main().catch((err) => {
    console.error(err.stack || err);
    process.exit(1);
});
