// Importing necessary modules
const puppeteer = require("puppeteer-core");
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const path = require('path');
const fs = require('fs');
const { getCountryFromAddress } = require('./searchLocation');
const ExcelJS = require('exceljs');

// Defining the Scraping Browser WebSocket endpoint and the CSV file path
const SBR_WS_ENDPOINT = "wss://brd-customer-hl_6df5cd9b-zone-chemical101:xtf54l18kd9i@brd.superproxy.io:9222";
let folderPath ='';

// Async function to execute the main scraping logic
async function main() {
    try {
        console.log("Connecting to Scraping Browser...");
        // Connecting to the Scraping Browser using puppeteer
        const browser = await puppeteer.connect({
            browserWSEndpoint: SBR_WS_ENDPOINT,
        });

        // Defining search parameters
        const keyword = process.argv[2] || "dysprosium";
        const minYear = process.argv[3] || 2022;
        const numRows = process.argv[4];

        const currentDate = new Date();
        const formattedTime = `${currentDate.getHours()}_${currentDate.getMinutes()}_${currentDate.getSeconds()}`;
        
        const folderTitle = `${keyword}_${numRows}_${minYear}_T${formattedTime}`;
        folderPath = path.join(__dirname, folderTitle);

        if (!fs.existsSync(folderPath)) {
            fs.mkdirSync(folderPath);
        }

        // Define the CSV file path within the created folder
        const CSV_FILE_PATH = path.join(folderPath, 'scholardata.csv');

        let scholarData = [];
        let start = 0;
        let totalRowsFetched = 0;

        // Check if the CSV file already exists
        const fileExists = fs.existsSync(CSV_FILE_PATH);

        // Create a CSV writer with specified column headers and options
        const csvWriter = createCsvWriter({
            path: CSV_FILE_PATH,
            header: [
                { id: 'keyword', title: 'Keyword' },
                { id: 'title', title: 'Title' },
                { id: 'articleLink', title: 'Article Link' },
                { id: 'firstName', title: 'First Name' },
                { id: 'lastName', title: 'Last Name' },
                { id: 'address', title: 'Address' },
                { id: 'country', title: 'Country' },
            ],
            append: fileExists,  // Append to existing CSV file if it exists
            newLine: '',  // Use an empty string as the newline character
            headerIdTransform: (id) => id,  // Preserve the original case of header IDs
        });

        try {
            // Creating a new page in the browser
            const page = await browser.newPage();
            console.log("Connected! Navigating to search results page...");

            // Loop through search result pages
            while (totalRowsFetched < numRows) {
                const url = `https://scholar.google.com/scholar?as_ylo=${minYear}&q=${encodeURIComponent(keyword)}&hl=en&as_sdt=0,5&start=${start}`;

                // Navigate to the search results page
                await page.goto(url, { waitUntil: "domcontentloaded" });

                console.log(`Scraping page ${start / 10 + 1}...`);

                // Evaluate the page and extract scholar data
                const currentPageData = await page.evaluate((keyword) => {
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
                }, keyword);

                // Check if the current page has enough rows to complete the required number
                if (totalRowsFetched + currentPageData.length > numRows) {
                    const rowsToKeep = numRows - totalRowsFetched;
                    scholarData = scholarData.concat(currentPageData.slice(0, rowsToKeep));
                    totalRowsFetched = numRows; // Set totalRowsFetched to numRows to exit the loop
                } else {
                    // Update the totalRowsFetched with the number of rows fetched in the current page
                    totalRowsFetched += currentPageData.length;
                    // Concatenate the current page data to scholarData
                    scholarData = scholarData.concat(currentPageData);
                    // Increase the page number for the next iteration
                    start += 10;
                }
            }

            // If the CSV file does not exist, write the header row
            if (!fileExists) {
                await csvWriter.writeRecords([{ ...csvWriter.header }]);
            }

            // Loop through scholar data and process each entry
            for (const item of scholarData) {
                console.log(`Processing data for keyword: ${item.keyword}`);
                console.log(`Processing scholarLink: ${item.scholarLink}`);

                // Perform a new page.goto for each scholarLink
                await page.goto(item.scholarLink, { waitUntil: "domcontentloaded" });
                console.log(`Navigated to ${item.scholarLink}`);

                // Evaluate the page and extract scholar details
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

                // Splitting the name into first and last names
                let nameParts;
                if (scholarDetails.name.includes(',')) {
                    nameParts = scholarDetails.name.split(',');
                    nameParts.pop();
                } else {
                    nameParts = scholarDetails.name.split(' ');
                }

                const lastName = nameParts.pop().trim();
                const firstName = nameParts.join(' ').trim();

                // Updating item properties with extracted details
                item.firstName = firstName;
                item.lastName = lastName;
                delete item.authorName;
                delete item.scholarLink;
                item.address = scholarDetails.address;

                // Write the record to the CSV file
                await csvWriter.writeRecords([item]);
            }

            // Log the completion message
            console.log(`Results saved to ${CSV_FILE_PATH}`);
        } finally {
            // Close the browser connection
            await browser.close();
        }

        // Call the functions to parse CSV and update the file, and write to XLSX file
        await parseCSVAndUpdate();
        await writeToXlsx();
    } catch (error) {
        console.error("Error connecting to Scraping Browser:", error);
    }
}

// Function to parse CSV, add country column, and update the CSV file
async function parseCSVAndUpdate() {
    // Read CSV data from the file
    const csvFilePath = path.join(folderPath, 'scholardata.csv');
    const csvData = fs.readFileSync(csvFilePath, 'utf8');
    const rows = csvData.split('\n');

    // Split the first row to get the headers of the CSV file
    const headers = rows[0].split(',');

    // Find the index of the 'Country' column in the headers
    const countryIndex = headers.findIndex(header => header.trim() === 'Country');

    // If 'Country' column is not found, add it to the headers
    if (countryIndex === -1) {
        headers.push('Country');
    }

    // Iterate through each row in the CSV starting from the third row (index 2)
    for (let i = 2; i < rows.length; i++) {
        // Split the row into an array of values
        const updatedRow = rows[i].split(',');

        // Get the value in the 'Country' column of the current row
        const countryValue = updatedRow[countryIndex];

        // Check if 'Country' column is null or empty
        if (countryValue === null || countryValue === '') {
            // Extract the affiliation text from the 6th column (index 5)
            const affiliationText = (updatedRow[5] || '').trim().replace(/^"(.*)"$/, '$1');

            // Split the affiliation text into words
            const words = affiliationText.split('-');
            let country = null;

            // Check if there are multiple words in the affiliation text
            if (words.length > 1) {
                // Get the last word
                lastWord = words[words.length - 1];

                // Try to get the country from the last word
                country = await getCountryFromAddress(lastWord);

                // If country is not found, try with additional variations
                if (!country) {
                    splitWord = lastWord.split('&');
                    country = await getCountryFromAddress(splitWord[splitWord.length - 1]);
                }
                if (!country) {
                    firstWord = words[words.length - 2];
                    country = await getCountryFromAddress(firstWord);
                }
            } else {
                // If only one word, directly get the country
                country = await getCountryFromAddress(words);
            }

            // Update the 'Country' column in the row with the extracted country information
            updatedRow[countryIndex] = country;

            // Join the updated row values into a CSV-formatted string
            rows[i] = updatedRow.join(',');
        }
    }

    // Write the updated CSV data back to the same file
    const updatedCSVData = rows.join('\n');
    fs.writeFileSync(csvFilePath, updatedCSVData, 'utf8');

    // Log a message indicating that the CSV update is complete
    console.log('CSV update complete. Country information added.');
}

// Function to write data to XLSX file
async function writeToXlsx() {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Sheet1');
    const csvFilePath = path.join(folderPath, 'scholardata.csv');
    const csvData = fs.readFileSync(csvFilePath, 'utf8');
    const rows = csvData.split('\n');

    // Add data
    rows.forEach(row => {
        sheet.addRow(row.split(','));
    });

    // Calculate and set column widths based on the maximum length in each column
    const columnWidths = Array(sheet.columnCount).fill(0);

    sheet.eachRow({ includeEmpty: true }, (row, rowNumber) => {
        row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
            const length = cell.value ? String(cell.value).length : 0;
            columnWidths[colNumber - 1] = Math.max(columnWidths[colNumber - 1], length);
        });
    });

    // Set column widths
    columnWidths.forEach((width, index) => {
        sheet.getColumn(index + 1).width = width + 1; // Add some extra space
    });

    // Save to XLSX file
    const xlsxFilePath = path.join(folderPath, 'scholardata.xlsx');
    await workbook.xlsx.writeFile(xlsxFilePath);
    console.log('Excel file created Successfully');
}

// Execute the main function and handle errors
main().catch((err) => {
    console.error(err.stack || err);
    process.exit(1);
});
