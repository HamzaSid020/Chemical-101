This program utilizes Puppeteer, a headless browser automation library, to scrape data from Google Scholar search results. 
The script connects to a Scraping Browser using a WebSocket endpoint, 
navigates through search result pages based on user-defined parameters (keyword, minimum year, and number of rows), 
and extracts information such as article titles, links, author names, and scholar details. 
The extracted data is processed and saved to a CSV file (scholarData.csv). 
The script also handles pagination to fetch the required number of rows and splits author names into first and last names. 
Additionally, it checks if the CSV file exists, appends data if it does, and writes the header row if it's a new file. 
The scholar details are obtained by navigating to each scholar's profile page. 
The script logs progress and errors, providing information on the data processing and the completion of the scraping task. 

Rotating Proxies:
https://brightdata.com/cp/zones/chemical_101/stats

For country finder:
Google api key

How to Run (Paste it in terminal):
npm init
npm install
Change package.json:
"scripts": {
    "start": "electron main.js",
    "package": "electron-packager . Chemical101 --platform=win32 --arch=x64 --out=release-builds"
  }
npm install puppeteer-core csv-writer fs axios electron path puppeteer fs.promises exceljs electron-packager --save-dev
npm start

To create executable:
npm run package
