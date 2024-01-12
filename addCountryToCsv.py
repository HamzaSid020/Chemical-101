import csv
import asyncio
from searchLocation import get_country_from_address
import pandas as pd

# Function to parse CSV, add country column, and update the CSV file
async def parse_csv_and_update(rows):
    # Print the contents of rows to understand its structure
    print(rows)

    # Extract headers from the first row
    headers = rows[0] if rows else []
    print(headers)

    # Find the index of the 'country' column in the headers
    country_index = headers.index('country') if 'country' in headers else -1

    # If 'country' column is not found, add it to the headers
    if country_index == -1:
        headers.append('country')

    # Iterate through each row in the CSV starting from the third row (index 2)
    for i in range(2, len(rows)):
        # Extract the row as a list
        row = rows[i] if i < len(rows) else []

        # Get the value in the 'country' column of the current row
        country_value = row[country_index] if country_index < len(row) else None

        # Check if 'country' column is null or empty
        if not country_value:
            # Extract the affiliation text from the 7th column (index 6)
            affiliation_text = (row[5] or '').strip().strip('"')
            print(affiliation_text)

            # Split the affiliation text into words
            words = affiliation_text.split('-')
            country = None

            # Check if there are multiple words in the affiliation text
            if len(words) > 1:
                # Get the last word
                last_word = words[-1]

                # Try to get the country from the last word
                country = await get_country_from_address(last_word)

                # If country is not found, try with additional variations
                if country is None:
                    split_word = last_word.split('&')
                    country = await get_country_from_address(split_word[-1])
                if country is None:
                    first_word = words[-2]
                    country = await get_country_from_address(first_word)
            else:
                # If only one word, directly get the country
                country = await get_country_from_address(words)

            # Check if the country is still None
            if country is not None:
                print(country)
            # Update the 'country' column in the row with the extracted country information
            if country_index < len(row):
                row[country_index] = country

            # Join the updated row values into a CSV-formatted string
            rows[i] = row

    # Write the updated CSV data back to the same file
    with open('scholar_data.csv', 'w', newline='', encoding='utf-8') as file:
        csv.writer(file).writerows(rows)

    # Log a message indicating that the CSV update is complete
    print('CSV update complete. country information added.')

# Read CSV data from the file
with open('scholar_data.csv', 'r', encoding='utf-8') as file:
    csv_reader = csv.reader(file)
    rows = list(csv_reader)

# Run the asyncio event loop to execute the asynchronous function
asyncio.run(parse_csv_and_update(rows))

csv_file_path = 'scholar_data.csv'
df = pd.read_csv(csv_file_path)

# Specify column widths (adjust as needed)
column_widths = {'A': 20, 'B': 100, 'C': 70, 'D': 15, 'E': 15, 'F': 70, 'G': 15}  # Example widths for columns A, B, and C

# Convert and save to XLSX with specified column widths
xlsx_file_path = 'scholar_data.xlsx'

with pd.ExcelWriter(xlsx_file_path, engine='openpyxl', mode='w') as writer:
    df.to_excel(writer, index=False, sheet_name='Sheet1')

    # Set column widths
    for column, width in column_widths.items():
        writer.sheets['Sheet1'].column_dimensions[column].width = width
    print('Excel file created Successfully')    
    
