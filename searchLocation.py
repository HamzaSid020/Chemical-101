import aiohttp

# The Google Maps API key for geocoding requests
GOOGLE_MAPS_API_KEY = 'AIzaSyDjb_zVAsoBOhyrKpBDACCGUIX4W8yQr2E'

async def get_country_from_address(address):
    try:
        async with aiohttp.ClientSession() as session:
            # Making an asynchronous GET request to the Google Maps Geocoding API
            async with session.get(f'https://maps.googleapis.com/maps/api/geocode/json?address={address}&key={GOOGLE_MAPS_API_KEY}') as response:
                if response.status == 200:
                    data = await response.json()
                    if 'results' in data and data['results']:
                        first_result = data['results'][0]
                        address_details = first_result.get('address_components', [])
                        country_component = next((component for component in address_details if 'country' in component.get('types', [])), None)
                        country_name = country_component['long_name'] if country_component else None
                        return country_name
                    else:
                        print('Error:', data.get('error_message', None))
                        return None
                else:
                    print('Error:', response.reason)
                    return None
    except Exception as e:
        print('Error:', str(e))
        return None
    
# Example usage:
# country = get_country_from_address("1600 Amphitheatre Parkway, Mountain View, CA")
# print(country)
