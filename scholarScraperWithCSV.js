const puppeteer = require("puppeteer-core");
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const fs = require('fs');

const SBR_WS_ENDPOINT = "wss://brd-customer-hl_8fa5cfb8-zone-chemical_101:bbtfody5gs2r@brd.superproxy.io:9222";
const CSV_FILE_PATH = 'scholarData.csv';

async function main() {
    console.log("Connecting to Scraping Browser...");
    const browser = await puppeteer.connect({
        browserWSEndpoint: SBR_WS_ENDPOINT,
    });
    const keyword = "dysprosium";
    const minYear = 2022;
    let scholarData = [];
    let start = 0;

    // Define the CSV file path
    const fileExists = fs.existsSync(CSV_FILE_PATH)
    const defaultColumnWidths = { keyword: 300, title: 300, articleLink: 300, firstName: 300, lastName: 300, address: 300, country: 300 };

    // Adjust column widths based on actual data
    scholarData.forEach(item => {
        Object.keys(defaultColumnWidths).forEach(key => {
            const length = item[key] ? item[key].toString().length : 0;
            defaultColumnWidths[key] = Math.max(defaultColumnWidths[key], length);
        });
    });

    // Create a CSV writer
    const csvWriter = createCsvWriter({
        path: CSV_FILE_PATH,
        header: [
            { id: 'keyword', title: 'Keyword' },
            { id: 'title', title: 'Title' },
            { id: 'articleLink', title: 'Article Link' },
            { id: 'firstName', title: 'First Name' },
            { id: 'lastName', title: 'Last Name' },
            { id: 'scholarDetails', title: 'Scholar Details' },
            { id: 'address', title: 'Address' },
            { id: 'country', title: 'Country' },
        ],
        append: fileExists,
        newLine: '',
    });

    try {
        const page = await browser.newPage();
        console.log("Connected! Navigating to search results page...");

        do {
            const url = `https://scholar.google.com/scholar?as_ylo=${minYear}&q=${encodeURIComponent(keyword)}&hl=en&as_sdt=0,5&start=${start}`;

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
                                const scholarLink = "https://scholar.google.com" + hrefElement.getAttribute("href");

                                if (distinctProfileLink.has(scholarLink)) {
                                    continue;
                                }

                                const authorName = hrefElement.textContent.trim();
                                distinctProfileLink.add(scholarLink);
                                const title = titleElement.textContent.trim().replace(/,/g, '-');;
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
                }, keyword)
            );
            start += 10;
        } while (scholarData.length < 10);

        if (!fileExists) {
            await csvWriter.writeRecords([{ ...csvWriter.header }]);
        }
        
        for (const item of scholarData) {
            console.log(`Processing data for keyword: ${item.keyword}`);

            console.log(`Processing scholarLink: ${item.scholarLink}`);
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

            // Write the record to the CSV file
            await csvWriter.writeRecords([item]);
        }

        // console.log("Results:", scholarData);
        console.log(`Results saved to ${CSV_FILE_PATH}`);
    } finally {
        await browser.close();
    }
}

main().catch((err) => {
    console.error(err.stack || err);
    process.exit(1);
});
