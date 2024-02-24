// Importing the 'axios' library for making HTTP requests
const axios = require('axios');

// The Google Maps API key for geocoding requests
const GOOGLE_MAPS_API_KEY = 'AIzaSyDjb_zVAsoBOhyrKpBDACCGUIX4W8yQr2E';

// Async function to get the country information from a given address using the Google Maps Geocoding API
async function getCountryFromAddress(address) {
    try {
        // Making a GET request to the Google Maps Geocoding API with the provided address and API key
        const response = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${GOOGLE_MAPS_API_KEY}`);
        
        // Check if the response contains valid data and results
        if (response.data && response.data.results && response.data.results.length > 0) {
            // Extracting details of the first result from the response
            const firstResult = response.data.results[0];
            
            // Extracting address components from the first result
            const addressDetails = firstResult.address_components;

            // Extracting country information from the address components
            const countryComponent = addressDetails.find(component => component.types.includes('country'));
            
            // Getting the long name of the country if found, otherwise, set it to null
            const countryName = countryComponent ? countryComponent.long_name : null;

            // Returning the extracted country name
            return countryName;
        } else {
            // If the response does not contain valid data or results, return null
            return null;
        }
    } catch (error) {
        // Handling errors that may occur during the API request
        console.error('Error:', error.response ? error.response.data.error_message : error.message);
        
        // Returning null in case of an error
        return null;
    }
}

// Exporting the 'getCountryFromAddress' function to make it accessible in other modules
module.exports = { getCountryFromAddress };