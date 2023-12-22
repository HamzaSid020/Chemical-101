const axios = require('axios');

async function getPlaceDetails(placeName) {
  try {
    const response = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(placeName)}`);
    
    if (response.data && response.data.length > 0) {
      const firstResult = response.data[0];
      const addressDetails = firstResult.display_name;

      console.log(`Address Details: ${addressDetails}`);
    } else {
      console.log(`Could not find information for ${placeName}.`);
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Replace 'YourPlaceName' with the actual place name you want to look up
getPlaceDetails('University of Essex');
