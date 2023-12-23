const axios = require('axios');

const GOOGLE_MAPS_API_KEY = 'AIzaSyDjb_zVAsoBOhyrKpBDACCGUIX4W8yQr2E';

async function getCountryFromAddress(address) {
    try {
        const response = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${GOOGLE_MAPS_API_KEY}`);
        
        if (response.data && response.data.results && response.data.results.length > 0) {
            const firstResult = response.data.results[0];
            const addressDetails = firstResult.address_components;

            // Extract country information
            const countryComponent = addressDetails.find(component => component.types.includes('country'));
            const countryName = countryComponent ? countryComponent.long_name : null;

            return countryName;
        } else {
            return null;
        }
    } catch (error) {
        console.error('Error:', error.response ? error.response.data.error_message : error.message);
        return null;
    }
}

module.exports = { getCountryFromAddress };