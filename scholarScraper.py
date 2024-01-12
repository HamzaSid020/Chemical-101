import asyncio
from pyppeteer import launch

SBR_WS_ENDPOINT = "wss://brd-customer-hl_8fa5cfb8-zone-chemical_101:bbtfody5gs2r@brd.superproxy.io:9222"

async def main():
    print("Connecting to Scraping Browser...")
    browser = await launch({
        'args': ['--no-sandbox'],
        'headless': True,
        'executablePath': 'C:\Program Files\Google\Chrome\Application\chrome.exe',  # Specify the path to your Chrome executable
        'browserWSEndpoint': SBR_WS_ENDPOINT,
    })

    keyword = "Terbium Complex"
    min_year = 2022
    scholar_data = []

    try:
        page = await browser.newPage()
        print("Connected! Navigating to search results page...")

        url = f"https://scholar.google.com/scholar?as_ylo={min_year}&q={keyword}&hl=en&as_sdt=0,5&start=10"
        await page.goto(url, waitUntil="domcontentloaded")

        print("Navigated! Scraping page content...")

        results = await page.evaluate(
            '''(keyword, minYear) => {
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
            }''', keyword, min_year)

        scholar_data = results

        for item in scholar_data:
            print(f"Processing data for keyword: {item['keyword']}")
            await page.goto(item['scholarLink'], waitUntil="domcontentloaded")
            print(f"Navigated to {item['scholarLink']}")

            scholar_details = await page.evaluate('''
                () => {
                    const nameElement = document.querySelector("#gsc_prf_inw #gsc_prf_in");
                    const name = nameElement ? nameElement.textContent.trim() : null;

                    const addressElement = document.querySelector(".gsc_prf_il");
                    const address = addressElement ? addressElement.textContent.trim().replace(/,/g, '-') : null;

                    return {
                        name,
                        address,
                    };
                }''')

            name_parts = scholar_details['name'].split(',') if ',' in scholar_details['name'] else scholar_details['name'].split(' ')
            last_name = name_parts.pop().strip()
            first_name = ' '.join(name_parts).strip()

            item['first_name'] = first_name
            item['last_name'] = last_name
            del item['authorName']
            del item['scholarLink']
            item['address'] = scholar_details['address']

        print("Results:", scholar_data)

    finally:
        await browser.close()

if __name__ == '__main__':
    asyncio.get_event_loop().run_until_complete(main())
