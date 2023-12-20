const Nightmare = require('nightmare');
const { fetchProxies } = require('./proxy'); // Adjust the path based on your project structure

async function scrapeGoogleScholar(query, startPage = 0, minYear = 2022) {
  try {
    // Generate proxies using your fetchProxies function
    const proxies = await fetchProxies();

    if (proxies.length === 0) {
      console.log('No valid proxies found.');
      return;
    }

    // Choose a random proxy from the array
    const randomProxy = proxies[Math.floor(Math.random() * proxies.length)];
    console.log('Random Proxy:', randomProxy);

    // Set up Nightmare with proxy
    const nightmare = Nightmare({
      switches: {
        'proxy-server': randomProxy,
      },
      show: true, // Set to true to see the browser
    });

    const keyword = query;
    const url = `https://scholar.google.com/scholar?as_ylo=${minYear}&q=${encodeURIComponent(
      query
    )}&hl=en&as_sdt=0,5&start=0`;

    const results = await nightmare
      .goto(url)
      .wait(10000) // Wait until an element with class 'gs_r' is present
      .evaluate((keyword) => {
        // Ensure the console.log within evaluate is capturing output
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
      }, keyword)
      .end();

    // console.log('Results:', results);
  } catch (error) {
    console.error('Error:', error);
  }
}

// Call the function with your desired parameters
scrapeGoogleScholar('terbium complex', 0, 2022);