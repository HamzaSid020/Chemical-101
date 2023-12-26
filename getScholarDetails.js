const puppeteer = require('puppeteer-core');

const SBR_WS_ENDPOINT = "wss://brd-customer-hl_8fa5cfb8-zone-chemical_101:bbtfody5gs2r@brd.superproxy.io:9222";

async function searchGoogle(query) {
    const browser = await puppeteer.connect({
        browserWSEndpoint: SBR_WS_ENDPOINT
    });
    const page = await browser.newPage();

    // Navigate to Google and perform the search
    await page.goto(`https://www.google.com/search?q=${encodeURIComponent(query)}`);

    // Wait for a more general selector to ensure the page is loaded
    await page.waitForSelector('.rc');

    // Extract the href attributes of the first two search results
    const links = await page.evaluate(() => {
        const results = document.querySelectorAll('.tF2Cxc a');
        return Array.from(results).slice(0, 2).map(link => link.href);
    });
    
    // Close the browser
    await browser.close();

    return links;
}

searchGoogle('Gemma K Gransbury Research Associate- The University of Manchester')
    .then(links => {
        console.log('Search results:', links);
    })
    .catch(error => {
        console.error('Error:', error.message);
    });
