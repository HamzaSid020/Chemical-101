
Google Scholar Scraper 🚀
Google Scholar Scraper

Welcome to the Google Scholar Scraper, a powerful tool built with Puppeteer, a headless browser automation library. This script takes web scraping to new heights by seamlessly navigating Google Scholar search results, extracting valuable information, and saving it to a CSV file for your research needs.

Key Features 🌟
Efficient Data Extraction: Utilizes Puppeteer to scrape article titles, links, author names, and scholar details from Google Scholar search results.

Configurability: Tailor your search with user-defined parameters such as keyword, minimum year, and the number of rows.

CSV Output: Data is neatly organized and saved to a CSV file (scholarData.csv) for easy analysis and integration into your projects.

Pagination Handling: Handles pagination intelligently to fetch the desired number of rows.

Author Details: Splits author names into first and last names for enhanced readability.

Smart File Management: Checks for the existence of the CSV file, appends data if it exists, and writes the header row for new files.

Detailed Logging: Keep track of progress and errors through comprehensive logs for a smooth scraping experience.

Rotating Proxies 🔄
Enhance your scraping capabilities with rotating proxies! Check out Bright Data's Rotating Proxies for improved performance.

Country Finder 🌍
For an enhanced experience, consider obtaining a Google API key to enable the country finder feature.

Getting Started 🚀
Initialize Project:

bash
Copy code
npm init
Install Dependencies:

bash
Copy code
npm install puppeteer-core csv-writer fs axios electron path puppeteer fs.promises exceljs electron-packager --save-dev
Update package.json:

json
Copy code
"scripts": {
    "start": "electron main.js",
    "package": "electron-packager . Chemical101 --platform=win32 --arch=x64 --out=release-builds"
}
Run the Script:

bash
Copy code
npm start
Create Executable:

bash
Copy code
npm run package
Contribute 🤝
Feel free to contribute to the development of this amazing tool. Your ideas and enhancements are always welcome!

License 📜
This project is licensed under the MIT License.

Happy Scraping! 🌐🤖✨
