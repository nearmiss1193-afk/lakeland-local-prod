"""
Scrape Lakeland FL businesses from OpenStreetMap via Overpass API.
Completely free, no API key, no bot blocking.
"""
import os, csv, json, time
import requests

# Overpass API endpoint (public, free)
OVERPASS_URL = "https://overpass-api.de/api/interpreter"

# Lakeland bounding box (generous coverage)
# SW corner: 27.95, -82.05  NE corner: 28.13, -81.85
BBOX = "27.95,-82.05,28.13,-81.85"

def query_overpass(query):
    """Run an Overpass QL query"""
    resp = requests.post(OVERPASS_URL, data={"data": query}, timeout=60)
    if resp.status_code != 200:
        print(f"  Overpass HTTP {resp.status_code}")
        return []
    return resp.json().get("elements", [])

def main():
    print("=" * 60)
    print("  OPENSTREETMAP SCRAPER - LAKELAND FL")
    print("=" * 60)
    
    # Query all businesses/shops/amenities in Lakeland area
    # This gets anything tagged as a business, shop, restaurant, office, etc.
    query = f"""
    [out:json][timeout:120];
    (
      node["name"]["shop"]({BBOX});
      way["name"]["shop"]({BBOX});
      node["name"]["amenity"]({BBOX});
      way["name"]["amenity"]({BBOX});
      node["name"]["office"]({BBOX});
      way["name"]["office"]({BBOX});
      node["name"]["craft"]({BBOX});
      way["name"]["craft"]({BBOX});
      node["name"]["healthcare"]({BBOX});
      way["name"]["healthcare"]({BBOX});
      node["name"]["leisure"]({BBOX});
      way["name"]["leisure"]({BBOX});
    );
    out center body;
    """
    
    print("\nQuerying OpenStreetMap for all businesses in Lakeland area...")
    elements = query_overpass(query)
    print(f"Raw results: {len(elements)}")
    
    # Process results
    businesses = []
    seen_names = set()
    
    # Category mapping from OSM tags
    OSM_CATEGORIES = {
        # Shops
        'supermarket': 'Grocery', 'convenience': 'Convenience Store',
        'clothes': 'Clothing', 'electronics': 'Electronics',
        'hardware': 'Hardware Store', 'furniture': 'Furniture',
        'car_repair': 'Auto Repair', 'car': 'Car Dealership',
        'car_parts': 'Auto Parts', 'beauty': 'Beauty Supply',
        'hairdresser': 'Hair Salon', 'florist': 'Florist',
        'jewelry': 'Jewelry Store', 'optician': 'Optician',
        'pet': 'Pet Store', 'shoes': 'Shoe Store',
        'mobile_phone': 'Phone Repair', 'tobacco': 'Vape/Smoke Shop',
        'e-cigarette': 'Vape Shop', 'alcohol': 'Liquor Store',
        'bakery': 'Bakery', 'butcher': 'Butcher',
        'tyres': 'Tire Shop', 'bicycle': 'Bike Shop',
        'books': 'Book Store', 'gift': 'Gift Shop',
        'department_store': 'Department Store', 'mall': 'Shopping Mall',
        'storage_rental': 'Storage', 'pawnbroker': 'Pawn Shop',
        'second_hand': 'Thrift Store', 'tattoo': 'Tattoo Shop',
        'massage': 'Massage', 'laundry': 'Laundromat',
        'dry_cleaning': 'Dry Cleaning',
        # Amenities
        'restaurant': 'Restaurant', 'fast_food': 'Fast Food',
        'cafe': 'Cafe', 'bar': 'Bar & Nightlife', 'pub': 'Bar & Nightlife',
        'ice_cream': 'Ice Cream', 'pharmacy': 'Pharmacy',
        'bank': 'Bank', 'fuel': 'Gas Station',
        'car_wash': 'Car Wash', 'dentist': 'Dentist',
        'doctors': 'Doctor', 'hospital': 'Hospital',
        'veterinary': 'Veterinarian', 'gym': 'Gym & Fitness',
        'fitness_centre': 'Gym & Fitness', 'childcare': 'Daycare',
        'kindergarten': 'Daycare', 'school': 'School',
        'place_of_worship': 'Church', 'community_centre': 'Community Center',
        # Offices
        'lawyer': 'Attorney', 'accountant': 'Accountant',
        'insurance': 'Insurance', 'estate_agent': 'Real Estate',
        'financial': 'Financial Services', 'tax_advisor': 'Tax Preparation',
        # Crafts
        'plumber': 'Plumbing', 'electrician': 'Electrical',
        'hvac': 'HVAC', 'painter': 'Painting', 'roofer': 'Roofing',
        'carpenter': 'Carpentry', 'locksmith': 'Locksmith',
        # Healthcare
        'chiropractor': 'Chiropractor', 'optometrist': 'Optometrist',
        'physiotherapist': 'Physical Therapy',
        # Leisure
        'fitness_centre': 'Gym & Fitness', 'spa': 'Spa',
        'bowling_alley': 'Bowling', 'golf_course': 'Golf',
    }
    
    for elem in elements:
        tags = elem.get("tags", {})
        name = tags.get("name", "")
        
        if not name or name.lower() in seen_names:
            continue
        seen_names.add(name.lower())
        
        # Determine category
        category = "Local Business"
        for tag_key in ['shop', 'amenity', 'office', 'craft', 'healthcare', 'leisure']:
            tag_val = tags.get(tag_key, '')
            if tag_val in OSM_CATEGORIES:
                category = OSM_CATEGORIES[tag_val]
                break
        
        # Get coordinates
        lat = elem.get("lat") or elem.get("center", {}).get("lat", 0)
        lon = elem.get("lon") or elem.get("center", {}).get("lon", 0)
        
        # Build address from tags
        street = tags.get("addr:street", "")
        housenumber = tags.get("addr:housenumber", "")
        city = tags.get("addr:city", "Lakeland")
        state = tags.get("addr:state", "FL")
        postcode = tags.get("addr:postcode", "")
        
        if housenumber and street:
            address = f"{housenumber} {street}, {city}, {state} {postcode}".strip()
        elif street:
            address = f"{street}, {city}, {state}".strip()
        else:
            address = f"Lakeland, FL"
        
        phone = tags.get("phone", "") or tags.get("contact:phone", "")
        website = tags.get("website", "") or tags.get("contact:website", "") or tags.get("url", "")
        
        businesses.append({
            'name': name,
            'address': address,
            'category': category,
            'phone': phone,
            'website': website,
            'rating': 0,
            'total_ratings': 0,
            'lat': lat,
            'lon': lon,
            'source': 'openstreetmap',
        })
    
    print(f"\nUnique businesses: {len(businesses)}")
    
    # Save CSV
    output_path = os.path.join(os.path.dirname(__file__), 'lakeland_businesses.csv')
    with open(output_path, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=[
            'name', 'address', 'category', 'phone', 'website',
            'rating', 'total_ratings', 'lat', 'lon', 'source'
        ])
        writer.writeheader()
        for biz in businesses:
            writer.writerow(biz)
    
    print(f"CSV saved: {output_path}")
    
    # Stats
    cats = {}
    for biz in businesses:
        c = biz['category']
        cats[c] = cats.get(c, 0) + 1
    
    print(f"\nCategory breakdown:")
    for c, n in sorted(cats.items(), key=lambda x: -x[1])[:25]:
        print(f"  {c}: {n}")
    
    with_phone = sum(1 for b in businesses if b.get('phone'))
    with_website = sum(1 for b in businesses if b.get('website'))
    with_address = sum(1 for b in businesses if 'Lakeland, FL' not in b.get('address', '') or len(b.get('address', '')) > 15)
    print(f"\n  With phone: {with_phone}")
    print(f"  With website: {with_website}")
    print(f"  With real address: {with_address}")
    
    # Copy to Desktop
    import shutil
    desktop = os.path.join(os.path.expanduser('~'), 'Desktop', 'lakeland_businesses.csv')
    shutil.copy2(output_path, desktop)
    print(f"  Copied to Desktop!")


if __name__ == "__main__":
    main()
