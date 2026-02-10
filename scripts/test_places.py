"""Re-test Google Places API key"""
import requests

KEY = "AIzaSyABzZ31Qqw91JbI1cDWRhU8AxvnJPhIErY"

url = "https://maps.googleapis.com/maps/api/place/textsearch/json"
params = {"query": "plumber in Lakeland FL", "key": KEY}

resp = requests.get(url, params=params, timeout=15)
data = resp.json()
print(f"HTTP: {resp.status_code}")
print(f"API Status: {data.get('status')}")
print(f"Error: {data.get('error_message', 'None')}")
print(f"Results: {len(data.get('results', []))}")

if data.get('results'):
    for r in data['results'][:5]:
        print(f"  {r.get('name')} | {r.get('formatted_address')}")
    print("\nKEY WORKS! Ready to scrape.")
else:
    print("\nStill blocked.")
