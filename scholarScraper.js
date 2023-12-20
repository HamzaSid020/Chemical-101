const puppeteer = require('puppeteer-core');

const SBR_WS_ENDPOINT = 'wss://brd-customer-hl_8fa5cfb8-zone-chemical_101:bbtfody5gs2r@brd.superproxy.io:9222';

async function main() {
    console.log('Connecting to Scraping Browser...');
    const browser = await puppeteer.connect({
        browserWSEndpoint: SBR_WS_ENDPOINT,
    });
    const keyword = 'Terbium Complex'; 
    const minYear = 2022; 

    try {
        const page = await browser.newPage();
        console.log('Connected! Navigating to search results page...');

        const url = `https://scholar.google.com/scholar?as_ylo=${minYear}&q=${encodeURIComponent(keyword)}&hl=en&as_sdt=0,5&start=0`;

        await page.goto(url, { waitUntil: 'domcontentloaded' });

        console.log('Navigated! Scraping page content...');

        const data = await page.evaluate((keyword, minYear) => {
            // Your scraping logic goes here
            // Adjust the selectors based on the current structure of the Google Scholar page
            console.log('Inside evaluate:', document.documentElement.outerHTML);

            const elements = document.querySelectorAll('.gs_r');
            const data = [];
            const distinctAuthorNames = new Set();

            elements.forEach((element) => {
                const titleElement = element.querySelector('.gs_rt');
                const articleLinkElement = element.querySelector('.gs_rt a');
                const hrefElements = element.querySelectorAll('.gs_a a');

                if (titleElement) {
                    let hrefValues = [];
                    let authorNames = [];

                    for (const hrefElement of hrefElements) {
                        const authorName = hrefElement.textContent.trim();

                        if (distinctAuthorNames.has(authorName)) {
                            continue;
                        }

                        const hrefValue = "https://scholar.google.com" + hrefElement.getAttribute('href');

                        hrefValues.push(hrefValue);
                        authorNames.push(authorName);
                        distinctAuthorNames.add(authorName);
                    }

                    const title = titleElement.textContent.trim();
                    const articleLink = articleLinkElement ? articleLinkElement.getAttribute('href') : null;

                    if (hrefValues.length > 0 && authorNames.length > 0) {
                        data.push({
                            keyword,
                            title,
                            articleLink,
                            authorNames,
                            hrefValues
                        });
                    }
                }
            });

            return data;
        }, keyword, minYear);

        console.log('Results:', data);
    } finally {
        await browser.close();
    }
}

main().catch(err => {
    console.error(err.stack || err);
    process.exit(1);
});
