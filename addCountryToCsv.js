const fs = require('fs');
const { getCountryFromAddress } = require('./searchLocation');

// Read CSV data from the file
const csvData = fs.readFileSync('scholarData.csv', 'utf8');
const rows = csvData.split('\n');

// Function to parse CSV, add country column, and update the CSV file
async function parseCSVAndUpdate(rows) {
    const header = rows[0].split(',');

    const countryIndex = header.indexOf('Country');
    if (countryIndex === -1) {
        header.push('Country');
    }

    for (let i = 2; i < rows.length; i++) {
        const updatedRow = rows[i].split(',');
        const affiliationText = (updatedRow[6] || '').trim().replace(/^"(.*)"$/, '$1');

        const words = affiliationText.split('-');
        let country = null;

        if (words.length > 1) {
            lastWord = words[words.length - 1];
            country = await getCountryFromAddress(lastWord);
            if (!country) {
                splitWord = lastWord.split('&');
                country = await getCountryFromAddress(splitWord[splitWord.length - 1]);
            }
            if (!country) {
                firstWord = words[words.length - 2];
                country = await getCountryFromAddress(firstWord);
            }
        } else {
            country = await getCountryFromAddress(words);
        }
        // Update the row with the extracted country information
        updatedRow[countryIndex] = country;
        rows[i] = updatedRow.join(',');
    }

    // Write the updated CSV data to the same file
    const updatedCSVData = rows.join('\n');
    fs.writeFileSync('scholarData.csv', updatedCSVData, 'utf8');

    console.log('CSV update complete. Country information added.');
}

// Wrap the code in an async function and call it
async function run() {
    await parseCSVAndUpdate(rows);
}

// Call the async function
run();