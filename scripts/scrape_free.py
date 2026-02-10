"""
Scrape Lakeland FL businesses from public web sources.
Uses Yelp's public search pages — no API key needed.
"""
import os, csv, time, json, re, hashlib
import requests
from urllib.parse import quote_plus

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml",
    "Accept-Language": "en-US,en;q=0.9",
}

CATEGORIES = [
    # Home Services
    "hvac", "plumbers", "roofing", "electricians",
    "pest_control", "landscaping", "painters", "carpet_cleaning",
    "handyman", "garage_door_services", "fences_gates", "tree_services",
    "pressure_washers", "pool_cleaners", "locksmiths", "movers",
    "house_cleaning", "flooring", "home_inspectors",
    # Auto
    "auto_repair", "car_dealers", "body_shops", "tires",
    "towing", "car_wash",
    # Food
    "restaurants", "bars", "coffee", "bakeries", "pizza",
    # Health
    "dentists", "chiropractors", "gyms", "yoga", "day_spas",
    "barbers", "hair_salons", "nail_salons", "massage_therapy", "veterinarians",
    # Professional
    "lawyers", "accountants", "real_estate_agents", "insurance",
    # Retail
    "vape_shops", "pet_stores", "hardware_stores", "thrift_stores",
    "jewelry", "mobile_phone_repair",
    # Other
    "child_care", "self_storage", "photographers", "wedding_planning",
]

CATEGORY_LABELS = {
    "hvac": "HVAC", "plumbers": "Plumbing", "roofing": "Roofing",
    "electricians": "Electrical", "pest_control": "Pest Control",
    "landscaping": "Landscaping", "painters": "Painting",
    "carpet_cleaning": "Carpet Cleaning", "handyman": "Handyman",
    "garage_door_services": "Garage Door", "fences_gates": "Fencing",
    "tree_services": "Tree Service", "pressure_washers": "Pressure Washing",
    "pool_cleaners": "Pool Service", "locksmiths": "Locksmith",
    "movers": "Moving", "house_cleaning": "Cleaning Service",
    "flooring": "Flooring", "home_inspectors": "Home Inspector",
    "auto_repair": "Auto Repair", "car_dealers": "Car Dealership",
    "body_shops": "Auto Body", "tires": "Tire Shop",
    "towing": "Towing", "car_wash": "Car Wash",
    "restaurants": "Restaurant", "bars": "Bar & Nightlife",
    "coffee": "Cafe & Coffee", "bakeries": "Bakery", "pizza": "Pizza",
    "dentists": "Dentist", "chiropractors": "Chiropractor",
    "gyms": "Gym & Fitness", "yoga": "Yoga Studio", "day_spas": "Spa",
    "barbers": "Barber Shop", "hair_salons": "Hair Salon",
    "nail_salons": "Nail Salon", "massage_therapy": "Massage",
    "veterinarians": "Veterinarian", "lawyers": "Attorney",
    "accountants": "Accountant", "real_estate_agents": "Real Estate",
    "insurance": "Insurance", "vape_shops": "Vape Shop",
    "pet_stores": "Pet Store", "hardware_stores": "Hardware Store",
    "thrift_stores": "Thrift Store", "jewelry": "Jewelry Store",
    "mobile_phone_repair": "Phone Repair", "child_care": "Daycare",
    "self_storage": "Storage", "photographers": "Photographer",
    "wedding_planning": "Wedding Venue",
}

def scrape_yelp_category(category, location="Lakeland, FL"):
    """Scrape businesses from Yelp search results"""
    businesses = []
    
    url = f"https://www.yelp.com/search?find_desc={quote_plus(category.replace('_', ' '))}&find_loc={quote_plus(location)}"
    
    try:
        resp = requests.get(url, headers=HEADERS, timeout=15)
        if resp.status_code != 200:
            print(f"  HTTP {resp.status_code}")
            return businesses
        
        html = resp.text
        
        # Extract JSON-LD structured data if available
        json_ld_matches = re.findall(r'<script[^>]*type="application/ld\+json"[^>]*>(.*?)</script>', html, re.DOTALL)
        for match in json_ld_matches:
            try:
                data = json.loads(match)
                if isinstance(data, dict) and data.get('@type') == 'ItemList':
                    for item in data.get('itemListElement', []):
                        biz = item.get('item', {})
                        if biz.get('name'):
                            businesses.append({
                                'name': biz.get('name', ''),
                                'address': biz.get('address', {}).get('streetAddress', '') if isinstance(biz.get('address'), dict) else '',
                                'phone': biz.get('telephone', ''),
                                'website': '',
                                'rating': biz.get('aggregateRating', {}).get('ratingValue', 0) if isinstance(biz.get('aggregateRating'), dict) else 0,
                                'total_ratings': biz.get('aggregateRating', {}).get('reviewCount', 0) if isinstance(biz.get('aggregateRating'), dict) else 0,
                            })
            except json.JSONDecodeError:
                pass
        
        # Also try regex extraction from the HTML for business names and info
        # Look for business card patterns
        name_matches = re.findall(r'class="css-19v1rkv"[^>]*>(.*?)</a>', html)
        if not name_matches:
            name_matches = re.findall(r'<a[^>]*href="/biz/[^"]*"[^>]*class="[^"]*"[^>]*>(.*?)</a>', html)
        
        phone_matches = re.findall(r'\((\d{3})\)\s*(\d{3})-(\d{4})', html)
        address_matches = re.findall(r'(\d+\s+[A-Z][a-zA-Z\s]+(?:St|Ave|Blvd|Dr|Rd|Ln|Ct|Way|Hwy|Pkwy)[^<,]*)', html)
        
        # If we got names from regex but not from JSON-LD
        if not businesses and name_matches:
            for i, name in enumerate(name_matches[:20]):
                clean_name = re.sub(r'<[^>]+>', '', name).strip()
                if clean_name and len(clean_name) > 2:
                    phone = f"({phone_matches[i][0]}) {phone_matches[i][1]}-{phone_matches[i][2]}" if i < len(phone_matches) else ""
                    addr = address_matches[i] if i < len(address_matches) else ""
                    businesses.append({
                        'name': clean_name,
                        'address': addr,
                        'phone': phone,
                        'website': '',
                        'rating': 0,
                        'total_ratings': 0,
                    })
    
    except Exception as e:
        print(f"  Error: {e}")
    
    return businesses

def scrape_yellowpages_category(category, location="Lakeland", state="FL"):
    """Scrape businesses from Yellow Pages"""
    businesses = []
    search_term = category.replace('_', '-')
    url = f"https://www.yellowpages.com/search?search_terms={quote_plus(search_term)}&geo_location_terms={quote_plus(f'{location}, {state}')}"
    
    try:
        resp = requests.get(url, headers=HEADERS, timeout=15)
        if resp.status_code != 200:
            return businesses
        
        html = resp.text
        
        # Extract business data from Yellow Pages HTML
        # Business names
        names = re.findall(r'class="business-name"[^>]*>(?:<[^>]+>)*(.*?)(?:</[^>]+>)*</a>', html)
        phones = re.findall(r'class="phones phone primary"[^>]*>(.*?)</div>', html)
        streets = re.findall(r'class="street-address"[^>]*>(.*?)</div>', html)
        localities = re.findall(r'class="locality"[^>]*>(.*?)</div>', html)
        links = re.findall(r'class="track-visit-website"[^>]*href="([^"]*)"', html)
        
        for i in range(len(names)):
            clean_name = re.sub(r'<[^>]+>', '', names[i]).strip()
            if clean_name:
                phone = re.sub(r'<[^>]+>', '', phones[i]).strip() if i < len(phones) else ""
                street = re.sub(r'<[^>]+>', '', streets[i]).strip() if i < len(streets) else ""
                locality = re.sub(r'<[^>]+>', '', localities[i]).strip() if i < len(localities) else ""
                website = links[i] if i < len(links) else ""
                
                address = f"{street}, {locality}" if street and locality else street or locality
                
                businesses.append({
                    'name': clean_name,
                    'address': address,
                    'phone': phone,
                    'website': website,
                    'rating': 0,
                    'total_ratings': 0,
                })
    
    except Exception as e:
        print(f"  YP Error: {e}")
    
    return businesses


def main():
    all_businesses = {}  # dedupe by name+address hash
    
    print("=" * 60)
    print("  FREE WEB SCRAPER - LAKELAND FL BUSINESSES")
    print(f"  {len(CATEGORIES)} categories to search")
    print("=" * 60)
    
    for i, cat in enumerate(CATEGORIES):
        label = CATEGORY_LABELS.get(cat, cat.replace('_', ' ').title())
        print(f"\n[{i+1}/{len(CATEGORIES)}] {label}")
        
        # Try Yelp first
        yelp_results = scrape_yelp_category(cat)
        new_count = 0
        
        for biz in yelp_results:
            key = hashlib.md5(f"{biz['name'].lower()}{biz.get('address','').lower()[:20]}".encode()).hexdigest()
            if key not in all_businesses:
                biz['category'] = label
                biz['source'] = 'yelp'
                all_businesses[key] = biz
                new_count += 1
        
        print(f"  Yelp: {len(yelp_results)} found, {new_count} new")
        
        # Also try Yellow Pages
        yp_results = scrape_yellowpages_category(cat)
        yp_new = 0
        
        for biz in yp_results:
            key = hashlib.md5(f"{biz['name'].lower()}{biz.get('address','').lower()[:20]}".encode()).hexdigest()
            if key not in all_businesses:
                biz['category'] = label
                biz['source'] = 'yellowpages'
                all_businesses[key] = biz
                yp_new += 1
        
        print(f"  YellowPages: {len(yp_results)} found, {yp_new} new")
        
        time.sleep(1.5)  # Be polite
    
    businesses_list = list(all_businesses.values())
    
    print(f"\n{'='*60}")
    print(f"  TOTAL UNIQUE BUSINESSES: {len(businesses_list)}")
    print(f"{'='*60}")
    
    # Save CSV
    output_path = os.path.join(os.path.dirname(__file__), 'lakeland_businesses.csv')
    with open(output_path, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=[
            'name', 'address', 'category', 'phone', 'website',
            'rating', 'total_ratings', 'source'
        ])
        writer.writeheader()
        for biz in businesses_list:
            writer.writerow({k: biz.get(k, '') for k in writer.fieldnames})
    
    print(f"\nCSV saved: {output_path}")
    
    # Stats
    cats = {}
    for biz in businesses_list:
        c = biz.get('category', 'Unknown')
        cats[c] = cats.get(c, 0) + 1
    
    print(f"\nTop categories:")
    for c, n in sorted(cats.items(), key=lambda x: -x[1])[:20]:
        print(f"  {c}: {n}")
    
    with_phone = sum(1 for b in businesses_list if b.get('phone'))
    with_website = sum(1 for b in businesses_list if b.get('website'))
    print(f"\n  With phone: {with_phone}")
    print(f"  With website: {with_website}")
    
    # Also copy to desktop
    import shutil
    desktop_path = os.path.join(os.path.expanduser('~'), 'Desktop', 'lakeland_businesses.csv')
    shutil.copy2(output_path, desktop_path)
    print(f"\n  Also copied to: {desktop_path}")


if __name__ == "__main__":
    main()
