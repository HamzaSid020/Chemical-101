# Google Scholar Scraper 🚀

A robust Puppeteer-based web scraper that systematically extracts academic research data from Google Scholar. Handles pagination, proxies, and data export while maintaining clean logging.

![Scraping Demo](https://via.placeholder.com/800x400.png?text=Google+Scholar+Scraper+Demo) <!-- Add actual screenshot URL -->

## 🌟 Core Features

### 📊 Data Extraction
- Article titles + URLs
- Author lists + affiliations
- Publication details (year/journal/citations)
- Search result snippets

### ⚙️ Configuration Options
// scholarConfig.js
module.exports = {
keyword: 'nanotechnology',
minYear: 2020,
maxResults: 200,
useProxies: true, // Enable rotating proxies
countryFilter: 'US' // Requires Google API key
};

## 🛠 Installation

1. **Clone Repository**
git clone https://github.com/HamzaSid020/Chemical-101.git
cd Chemical-101

2. **Install Dependencies**
npm install puppeteer-core csv-writer axios exceljs --save-dev

3. **Configuration**
Create `.env` file:
GOOGLE_API_KEY=your_key_here
PROXY_SERVER=proxy.example.com:8080

## 🚦 Usage
Basic execution
npm start -- --keyword "quantum computing" --year 2018 --rows 100

With proxy rotation
npm run start:proxy -- --proxy-list proxies.txt

Country-specific results
npm start -- --country-code DE --api-key $GOOGLE_KEY

## 📂 Data Output Example
`scholarData.csv` structure:

| Title                          | Link                                     | Authors               | Details                  |
|--------------------------------|------------------------------------------|-----------------------|--------------------------|
| Advanced Quantum Algorithms    | https://example.com/paper1              | J. Smith, M. Johnson  | Nature 2023, 120 citations |
| ...                            | ...                                      | ...                   | ...                      |

## 🔄 Proxy Integration
// Enable in scraper.js
const proxyOptions = {
address: 'zproxy.lum-superproxy.io',
port: 22225,
credentials: 'lum-customer-<id>-zone-zone1:<password>'
};

**Recommended Providers:**
- [Bright Data](https://brightdata.com/)
- [Oxylabs](https://oxylabs.io/)

## 🌍 Country Filtering
Requires [Google API Key](https://developers.google.com/maps/documentation/geocoding/get-api-key):
const geocodeConfig = {
enabled: true,
region: 'FR', // ISO country code
apiKey: process.env.GOOGLE_API_KEY
};

## 📜 Error Handling
- Automatic retries (3 attempts)
- CAPTCHA detection system
- Rate limiting safeguards
- Detailed error logs in `/logs`

## 📋 Requirements
- Node.js 16.x+
- Chromium browser
- 2GB+ free memory
- Stable internet connection

## 📄 License
MIT License - See [LICENSE](LICENSE) for details

## 🙋♂️ Author
**Hamza Siddiqui**  
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Profile-blue)](https://www.linkedin.com/in/hamzahmedsiddiqui/) 
[![GitHub](https://img.shields.io/badge/GitHub-Profile-black)](https://github.com/HamzaSid020)

---

💡 **Pro Tip:** Combine with [Zotero](https://www.zotero.org/) for automated research paper organization!

[![Open in GitHub Codespaces](https://img.shields.io/badge/Open%20in-Codespaces-blue)](https://codespaces.new/HamzaSid020/Chemical-101)
