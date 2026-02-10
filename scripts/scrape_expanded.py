"""
EXPANDED Google Places scraper for Lakeland, FL.
- 150+ subcategories (vs 50 before)
- 6 GPS search points across the city (vs 1 before)  
- Deduplicates by place_id
- Fetches phone + website details
Target: 3,000-5,000 unique businesses
"""
import os, json, csv, time, hashlib
import requests
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env.local'))

GOOGLE_API_KEY = "AIzaSyABzZ31Qqw91JbI1cDWRhU8AxvnJPhIErY"
RADIUS = 8000  # 8km per point — overlaps intentionally for coverage

# 6 GPS points spread across Lakeland + nearby
SEARCH_POINTS = [
    {"name": "Downtown Lakeland",    "lat": 28.0395, "lng": -81.9498},
    {"name": "North Lakeland",       "lat": 28.0800, "lng": -81.9500},
    {"name": "South Lakeland",       "lat": 28.0000, "lng": -81.9500},
    {"name": "East Lakeland",        "lat": 28.0395, "lng": -81.9000},
    {"name": "West Lakeland",        "lat": 28.0395, "lng": -82.0000},
    {"name": "Mulberry/Highland",    "lat": 27.9600, "lng": -81.9700},
]

# 150+ subcategories for deep coverage
CATEGORIES = [
    # HOME SERVICES (biggest revenue niche)
    "hvac contractor", "hvac repair", "air conditioning",
    "plumber", "plumbing repair", "emergency plumber",
    "roofing contractor", "roof repair", "metal roofing",
    "electrician", "electrical repair", "electrical contractor",
    "pest control", "termite control", "mosquito control",
    "landscaping", "lawn care", "lawn mowing", "tree trimming", "tree removal",
    "painter", "house painting", "interior painting",
    "carpet cleaning", "upholstery cleaning",
    "handyman", "home repair",
    "garage door repair", "garage door installation",
    "fence contractor", "fence repair",
    "pressure washing", "power washing",
    "pool service", "pool cleaning", "pool repair",
    "locksmith", "emergency locksmith",
    "moving company", "local movers",
    "house cleaning", "maid service", "janitorial service",
    "flooring contractor", "tile installation", "hardwood flooring",
    "home inspector", "home inspection",
    "window cleaning", "gutter cleaning",
    "appliance repair", "washer dryer repair",
    "concrete contractor", "driveway repair",
    "insulation contractor", "spray foam insulation",
    "solar panel installation",
    "foundation repair",
    "water damage restoration", "mold remediation",
    
    # AUTO
    "auto repair", "mechanic", "auto mechanic",
    "car dealership", "used cars", "new cars",
    "auto body shop", "collision repair",
    "tire shop", "tire repair",
    "towing service", "roadside assistance",
    "car wash", "auto detailing",
    "oil change", "brake repair",
    "transmission repair", "auto electric",
    "windshield repair", "auto glass",
    
    # FOOD & DRINK
    "restaurant", "fine dining",
    "Mexican restaurant", "Italian restaurant", "Chinese restaurant",
    "Thai restaurant", "Japanese restaurant", "sushi",
    "Indian restaurant", "Vietnamese restaurant",
    "BBQ restaurant", "steakhouse",
    "seafood restaurant", "fish and chips",
    "breakfast restaurant", "brunch",
    "pizza", "pizza delivery",
    "fast food", "burger",
    "sandwich shop", "deli",
    "coffee shop", "cafe", "espresso",
    "bakery", "donuts", "cupcakes",
    "ice cream", "frozen yogurt",
    "bar", "sports bar", "pub",
    "food truck",
    "juice bar", "smoothie",
    "wing restaurant", "chicken restaurant",
    "vegetarian restaurant", "vegan restaurant",
    
    # HEALTH & WELLNESS
    "dentist", "orthodontist", "cosmetic dentist", "dental implants",
    "chiropractor", "chiropractic",
    "gym", "fitness center", "crossfit",
    "yoga studio", "pilates",
    "spa", "day spa", "med spa",
    "barber shop", "men's haircuts",
    "hair salon", "women's hair salon", "color specialist",
    "nail salon", "manicure pedicure",
    "massage therapy", "deep tissue massage",
    "veterinarian", "animal hospital", "pet grooming",
    "physical therapy", "sports medicine",
    "dermatologist", "skin care clinic",
    "optometrist", "eye doctor", "glasses",
    "pharmacy", "compounding pharmacy",
    "urgent care", "walk in clinic",
    "mental health counselor", "therapist",
    "weight loss clinic",
    
    # PROFESSIONAL SERVICES
    "lawyer", "personal injury lawyer", "family lawyer", "criminal lawyer",
    "real estate lawyer", "DUI lawyer",
    "accountant", "CPA", "bookkeeper",
    "real estate agent", "realtor", "property management",
    "insurance agent", "auto insurance", "home insurance", "life insurance",
    "financial advisor", "financial planner",
    "tax preparation", "tax service",
    "notary public",
    "mortgage broker", "home loans",
    
    # RETAIL
    "vape shop", "smoke shop",
    "liquor store", "wine shop",
    "pet store", "pet supplies",
    "hardware store",
    "thrift store", "consignment shop",
    "jewelry store", "pawn shop",
    "cell phone repair", "phone screen repair",
    "furniture store", "mattress store",
    "clothing store", "boutique",
    "shoe store",
    "gun shop", "firearms",
    "grocery store", "supermarket",
    "convenience store",
    "florist", "flower shop",
    
    # OTHER SERVICES
    "daycare", "child care", "preschool",
    "tutoring", "learning center",
    "storage facility", "self storage",
    "printing service", "print shop",
    "photographer", "wedding photographer",
    "wedding venue", "event venue",
    "funeral home",
    "church", "place of worship",
    "dry cleaner", "laundromat",
    "tattoo shop", "tattoo parlor",
    "dog grooming", "dog training",
    "martial arts", "karate", "jiu jitsu",
    "dance studio",
    "music lessons", "guitar lessons",
    "driving school",
    "boat repair", "marine service",
]

def search_places(query, lat, lng, page_token=None):
    url = "https://maps.googleapis.com/maps/api/place/textsearch/json"
    if page_token:
        params = {"pagetoken": page_token, "key": GOOGLE_API_KEY}
    else:
        params = {
            "query": f"{query} in Lakeland FL",
            "location": f"{lat},{lng}",
            "radius": RADIUS,
            "key": GOOGLE_API_KEY,
        }
    
    resp = requests.get(url, params=params, timeout=15)
    if resp.status_code != 200:
        return [], None
    
    data = resp.json()
    if data.get("status") not in ["OK", "ZERO_RESULTS"]:
        if "OVER_QUERY_LIMIT" in str(data.get("status", "")):
            print(f"  ⚠️ RATE LIMITED — waiting 30s...")
            time.sleep(30)
            return search_places(query, lat, lng, page_token)
        return [], None
    
    return data.get("results", []), data.get("next_page_token")

def get_place_details(place_id):
    url = "https://maps.googleapis.com/maps/api/place/details/json"
    params = {
        "place_id": place_id,
        "fields": "formatted_phone_number,website",
        "key": GOOGLE_API_KEY,
    }
    try:
        resp = requests.get(url, params=params, timeout=10)
        if resp.status_code == 200:
            result = resp.json().get("result", {})
            return result.get("formatted_phone_number", ""), result.get("website", "")
    except:
        pass
    return "", ""

def main():
    all_businesses = {}  # dedupe by place_id
    api_calls = 0
    
    total_searches = len(CATEGORIES) * len(SEARCH_POINTS)
    print("=" * 60)
    print("  EXPANDED GOOGLE PLACES SCRAPER")
    print(f"  {len(CATEGORIES)} categories × {len(SEARCH_POINTS)} locations")
    print(f"  ~{total_searches} searches planned")
    print("=" * 60)
    
    search_count = 0
    for point in SEARCH_POINTS:
        print(f"\n📍 {point['name']} ({point['lat']}, {point['lng']})")
        
        for cat in CATEGORIES:
            results, next_token = search_places(cat, point['lat'], point['lng'])
            api_calls += 1
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
                time.sleep(2)
                results2, _ = search_places(cat, point['lat'], point['lng'], next_token)
                api_calls += 1
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
            
            search_count += 1
            if search_count % 20 == 0:
                print(f"  [{search_count}/{total_searches}] Unique: {len(all_businesses)} | New from '{cat}': {new_count}")
            
            time.sleep(0.2)  # Light rate limit
    
    print(f"\n{'='*60}")
    print(f"  TEXT SEARCH COMPLETE")
    print(f"  Unique businesses: {len(all_businesses)}")
    print(f"  API calls (search): {api_calls}")
    print(f"{'='*60}")
    
    # Fetch details (phone + website) for ALL businesses
    businesses_list = list(all_businesses.values())
    print(f"\nFetching phone/website for {len(businesses_list)} businesses...")
    
    for i, biz in enumerate(businesses_list):
        phone, website = get_place_details(biz["place_id"])
        biz["phone"] = phone
        biz["website"] = website
        api_calls += 1
        if (i + 1) % 100 == 0:
            print(f"  Details: {i+1}/{len(businesses_list)}")
        time.sleep(0.05)  # 20/sec — well under limit
    
    print(f"  Details complete!")
    
    # Save CSV
    output_path = os.path.join(os.path.dirname(__file__), 'lakeland_businesses_expanded.csv')
    with open(output_path, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=[
            'name', 'address', 'category', 'phone', 'website',
            'rating', 'total_ratings', 'lat', 'lng', 'types', 'place_id'
        ])
        writer.writeheader()
        for biz in businesses_list:
            writer.writerow(biz)
    
    # Stats
    with_phone = sum(1 for b in businesses_list if b.get('phone'))
    with_website = sum(1 for b in businesses_list if b.get('website'))
    
    cats = {}
    for biz in businesses_list:
        c = biz['category']
        cats[c] = cats.get(c, 0) + 1
    
    print(f"\n{'='*60}")
    print(f"  FINAL RESULTS")
    print(f"{'='*60}")
    print(f"  Total unique businesses: {len(businesses_list)}")
    print(f"  With phone: {with_phone}")
    print(f"  With website: {with_website}")
    print(f"  Total API calls: {api_calls}")
    print(f"  CSV: {output_path}")
    
    print(f"\n  Top 25 categories:")
    for c, n in sorted(cats.items(), key=lambda x: -x[1])[:25]:
        print(f"    {c}: {n}")
    
    # Copy to Desktop
    import shutil
    desktop = os.path.join(os.path.expanduser('~'), 'Desktop', 'lakeland_businesses_expanded.csv')
    shutil.copy2(output_path, desktop)
    print(f"\n  Copied to Desktop!")

if __name__ == "__main__":
    main()
