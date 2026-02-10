"""
Google Places API scraper for Lakeland, FL businesses.
Searches across dozens of categories, deduplicates, and saves to CSV + seeds Neon DB.
"""
import os, json, csv, time, hashlib
import requests
from dotenv import load_dotenv

# Load keys
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '..', 'empire-unified', '.env'))
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env.local'))

GOOGLE_API_KEY = "AIzaSyABzZ31Qqw91JbI1cDWRhU8AxvnJPhIErY"
if not GOOGLE_API_KEY:
    print("ERROR: No GOOGLE_API_KEY found")
    exit(1)

# Lakeland FL coordinates (center)
LAT = 28.0395
LNG = -81.9498
RADIUS = 15000  # 15km covers most of Lakeland

# Categories to scrape
CATEGORIES = [
    # Home Services (your bread and butter)
    "hvac contractor", "plumber", "roofing contractor", "electrician",
    "pest control", "landscaping", "painters", "carpet cleaning",
    "handyman", "garage door", "fence contractor", "tree service",
    "pressure washing", "pool service", "locksmith", "moving company",
    "cleaning service", "flooring contractor", "home inspector",
    
    # Auto
    "auto repair", "car dealership", "auto body shop", "tire shop",
    "towing service", "car wash", "oil change",
    
    # Food & Drink
    "restaurant", "bar", "cafe", "bakery", "pizza", "food truck",
    
    # Health & Wellness
    "dentist", "chiropractor", "gym", "yoga studio", "spa", "barber shop",
    "hair salon", "nail salon", "massage therapy", "veterinarian",
    
    # Professional Services
    "lawyer", "accountant", "real estate agent", "insurance agent",
    "financial advisor", "tax preparation",
    
    # Retail
    "vape shop", "liquor store", "pet store", "hardware store",
    "thrift store", "jewelry store", "smoke shop", "cell phone repair",
    
    # Other
    "daycare", "tutoring", "storage facility", "printing service",
    "wedding venue", "photographer", "funeral home",
]

def search_places(query, page_token=None):
    """Search Google Places API for businesses near Lakeland"""
    url = "https://maps.googleapis.com/maps/api/place/textsearch/json"
    params = {
        "query": f"{query} in Lakeland FL",
        "location": f"{LAT},{LNG}",
        "radius": RADIUS,
        "key": GOOGLE_API_KEY,
    }
    if page_token:
        params = {"pagetoken": page_token, "key": GOOGLE_API_KEY}
    
    resp = requests.get(url, params=params, timeout=15)
    if resp.status_code != 200:
        print(f"  HTTP {resp.status_code} for {query}")
        return [], None
    
    data = resp.json()
    if data.get("status") not in ["OK", "ZERO_RESULTS"]:
        print(f"  API status: {data.get('status')} - {data.get('error_message', '')}")
        return [], None
    
    results = data.get("results", [])
    next_token = data.get("next_page_token")
    return results, next_token

def normalize_phone(phone):
    """Strip phone to digits only"""
    if not phone:
        return ""
    return ''.join(c for c in phone if c.isdigit())

def get_place_details(place_id):
    """Get phone number and website from Place Details"""
    url = "https://maps.googleapis.com/maps/api/place/details/json"
    params = {
        "place_id": place_id,
        "fields": "formatted_phone_number,website,opening_hours",
        "key": GOOGLE_API_KEY,
    }
    resp = requests.get(url, params=params, timeout=10)
    if resp.status_code == 200:
        result = resp.json().get("result", {})
        return {
            "phone": result.get("formatted_phone_number", ""),
            "website": result.get("website", ""),
            "hours": json.dumps(result.get("opening_hours", {}).get("weekday_text", [])) if result.get("opening_hours") else "",
        }
    return {"phone": "", "website": "", "hours": ""}

def main():
    all_businesses = {}  # dedupe by place_id
    
    print("=" * 60)
    print("  GOOGLE PLACES SCRAPER - LAKELAND FL")
    print(f"  {len(CATEGORIES)} categories to search")
    print("=" * 60)
    
    for i, cat in enumerate(CATEGORIES):
        print(f"\n[{i+1}/{len(CATEGORIES)}] Searching: {cat}")
        
        results, next_token = search_places(cat)
        new_count = 0
        
        for r in results:
            pid = r.get("place_id")
            if pid and pid not in all_businesses:
                all_businesses[pid] = {
                    "place_id": pid,
                    "name": r.get("name", ""),
                    "address": r.get("formatted_address", ""),
                    "category": cat.title(),
                    "rating": r.get("rating", 0),
                    "total_ratings": r.get("user_ratings_total", 0),
                    "lat": r.get("geometry", {}).get("location", {}).get("lat", 0),
                    "lng": r.get("geometry", {}).get("location", {}).get("lng", 0),
                    "types": ','.join(r.get("types", [])[:5]),
                }
                new_count += 1
        
        # Get page 2 if available
        if next_token:
            time.sleep(2)  # Google requires delay before next_page_token works
            results2, _ = search_places(cat, next_token)
            for r in results2:
                pid = r.get("place_id")
                if pid and pid not in all_businesses:
                    all_businesses[pid] = {
                        "place_id": pid,
                        "name": r.get("name", ""),
                        "address": r.get("formatted_address", ""),
                        "category": cat.title(),
                        "rating": r.get("rating", 0),
                        "total_ratings": r.get("user_ratings_total", 0),
                        "lat": r.get("geometry", {}).get("location", {}).get("lat", 0),
                        "lng": r.get("geometry", {}).get("location", {}).get("lng", 0),
                        "types": ','.join(r.get("types", [])[:5]),
                    }
                    new_count += 1
        
        print(f"  Found {len(results)} results, {new_count} new unique")
        time.sleep(0.3)  # Rate limit
    
    print(f"\n{'='*60}")
    print(f"  TOTAL UNIQUE BUSINESSES: {len(all_businesses)}")
    print(f"{'='*60}")
    
    # Get phone/website details for top businesses (limit API calls)
    print(f"\nFetching phone/website details (this takes a minute)...")
    businesses_list = list(all_businesses.values())
    detail_count = 0
    
    for biz in businesses_list:
        try:
            details = get_place_details(biz["place_id"])
            biz["phone"] = details["phone"]
            biz["website"] = details["website"]
            biz["hours"] = details["hours"]
            detail_count += 1
            if detail_count % 50 == 0:
                print(f"  Details fetched: {detail_count}/{len(businesses_list)}")
            time.sleep(0.1)  # Rate limit
        except Exception as e:
            biz["phone"] = ""
            biz["website"] = ""
            biz["hours"] = ""
    
    print(f"  Details complete: {detail_count}")
    
    # Save to CSV
    output_path = os.path.join(os.path.dirname(__file__), 'lakeland_businesses.csv')
    with open(output_path, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=[
            'name', 'address', 'category', 'phone', 'website', 
            'rating', 'total_ratings', 'lat', 'lng', 'types', 'hours', 'place_id'
        ])
        writer.writeheader()
        for biz in businesses_list:
            writer.writerow(biz)
    
    print(f"\nCSV saved: {output_path}")
    print(f"Total rows: {len(businesses_list)}")
    
    # Category breakdown
    cats = {}
    for biz in businesses_list:
        c = biz['category']
        cats[c] = cats.get(c, 0) + 1
    
    print(f"\n{'='*60}")
    print("  CATEGORY BREAKDOWN")
    print(f"{'='*60}")
    for c, n in sorted(cats.items(), key=lambda x: -x[1])[:20]:
        print(f"  {c}: {n}")
    
    # Stats
    with_phone = sum(1 for b in businesses_list if b.get('phone'))
    with_website = sum(1 for b in businesses_list if b.get('website'))
    print(f"\n  With phone: {with_phone}")
    print(f"  With website: {with_website}")

if __name__ == "__main__":
    main()
