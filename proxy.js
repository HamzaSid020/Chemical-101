//Code source from: https://gist.github.com/saasindustries/ce3e165048a59d40fbe213cdccb30d88
//Modified by: Hamza Siddiqui

const request = require("request");
const cheerio = require("cheerio");

function fetchProxies() {
  return new Promise((resolve, reject) => {
    let proxies = [];

    request("https://sslproxies.org/", function (error, response, html) {
      if (!error && response.statusCode == 200) {
        const $ = cheerio.load(html);

        $("tr").each(function (index, element) {
          const ipAddress = $(this).find("td:nth-child(1)").text().trim();
          const portNumber = $(this).find("td:nth-child(2)").text().trim();
          const googleProxy = $(this).find("td:nth-child(6)").text().trim();
          const httpProxy = $(this).find("td:nth-child(7)").text().trim();

          // Check if the IP address matches the specified format
          const ipAddressRegex = /^\d{1,3}(\.\d{1,3}){3}$/;
          
          if (ipAddressRegex.test(ipAddress) && googleProxy.toLowerCase() === 'yes'
          && httpProxy.toLowerCase() === 'yes') {
            proxies.push(`http://${ipAddress}:${portNumber}`);
          }
        });

        // Resolve the promise with the array of valid proxies
        resolve(proxies);
      } else {
        // Reject the promise with the error
        reject("Error loading proxy, please try again");
      }
    });
  });
}

module.exports = {
  fetchProxies,
};