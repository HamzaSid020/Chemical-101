const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const scholarScraper = require('./public/scholarScraperWithCSV');
const bodyParser = require('body-parser');


app.set('view engine', 'ejs');
app.use(express.static('public')); // If you have a public folder for static files
app.use(bodyParser.urlencoded({ extended: true }));


app.get('/', (req, res) => {
    const currentYear = new Date().getFullYear();
    res.render('index', { currentYear });
});

app.post('/scrape', async (req, res) => {
    const { keyword, minYear, numRows } = req.body;

    try {
        // Call the scholar scraper function with form data
        await scholarScraper.scrapeData(keyword, minYear, numRows);
        res.status(200).send('Scraping complete. Check the generated files.');
    } catch (error) {
        console.error('Error during scraping:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});