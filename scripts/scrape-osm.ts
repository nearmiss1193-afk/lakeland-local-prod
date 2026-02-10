/**
 * OpenStreetMap Overpass API Scraper for Lakeland, FL businesses
 * Run: npx tsx scripts/scrape-osm.ts
 * 
 * Pulls amenity/shop/tourism/leisure nodes in Lakeland area,
 * maps OSM tags to our category system, de-duplicates, and inserts into Neon DB.
 */

import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load .env from project root
dotenv.config({ path: path.resolve(__dirname, '..', '.env.local') });
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
    console.error('❌ DATABASE_URL not found. Create .env.local with your Neon connection string.');
    process.exit(1);
}

const sql = neon(DATABASE_URL);

// Lakeland, FL bounding box (~20 mile radius)
const BBOX = {
    south: 27.85,
    west: -82.15,
    north: 28.20,
    east: -81.75,
};

// OSM tag → our category mapping
const CATEGORY_MAP: Record<string, string> = {
    // Amenity tags
    restaurant: 'Restaurant',
    cafe: 'Restaurant',
    fast_food: 'Restaurant',
    bar: 'Restaurant',
    pub: 'Restaurant',
    food_court: 'Restaurant',
    ice_cream: 'Restaurant',
    bank: 'Financial Services',
    atm: 'Financial Services',
    pharmacy: 'Health & Medical',
    hospital: 'Health & Medical',
    clinic: 'Health & Medical',
    doctors: 'Health & Medical',
    dentist: 'Health & Medical',
    veterinary: 'Pets',
    school: 'Education',
    university: 'Education',
    college: 'Education',
    library: 'Education',
    kindergarten: 'Education',
    place_of_worship: 'Religious Organizations',
    fuel: 'Automotive',
    car_repair: 'Automotive',
    car_wash: 'Automotive',
    car_rental: 'Automotive',
    parking: 'Automotive',
    hotel: 'Hotels & Travel',
    motel: 'Hotels & Travel',
    guest_house: 'Hotels & Travel',
    post_office: 'Public Services',
    police: 'Public Services',
    fire_station: 'Public Services',
    townhall: 'Public Services',
    community_centre: 'Public Services',
    cinema: 'Arts & Entertainment',
    theatre: 'Arts & Entertainment',
    nightclub: 'Nightlife',
    gym: 'Fitness & Instruction',
    childcare: 'Education',
    // Shop tags
    supermarket: 'Shopping',
    convenience: 'Shopping',
    clothes: 'Shopping',
    beauty: 'Beauty & Spas',
    hairdresser: 'Beauty & Spas',
    hardware: 'Home Services',
    furniture: 'Home Services',
    electronics: 'Shopping',
    books: 'Shopping',
    florist: 'Shopping',
    gift: 'Shopping',
    jewelry: 'Shopping',
    shoes: 'Shopping',
    pet: 'Pets',
    car: 'Automotive',
    car_parts: 'Automotive',
    tyres: 'Automotive',
    bakery: 'Restaurant',
    butcher: 'Restaurant',
    deli: 'Restaurant',
    greengrocer: 'Restaurant',
    alcohol: 'Shopping',
    tobacco: 'Shopping',
    optician: 'Health & Medical',
    mobile_phone: 'Shopping',
    laundry: 'Home Services',
    dry_cleaning: 'Home Services',
    garden_centre: 'Home Services',
    tattoo: 'Beauty & Spas',
    massage: 'Beauty & Spas',
    // Tourism tags
    museum: 'Arts & Entertainment',
    gallery: 'Arts & Entertainment',
    attraction: 'Arts & Entertainment',
    viewpoint: 'Arts & Entertainment',
    // Leisure tags
    fitness_centre: 'Fitness & Instruction',
    sports_centre: 'Fitness & Instruction',
    swimming_pool: 'Fitness & Instruction',
    golf_course: 'Active Life',
    park: 'Active Life',
    playground: 'Active Life',
    marina: 'Active Life',
};

interface OSMElement {
    type: string;
    id: number;
    lat?: number;
    lon?: number;
    center?: { lat: number; lon: number };
    tags?: Record<string, string>;
}

function mapCategory(tags: Record<string, string>): string | null {
    // Check amenity first, then shop, tourism, leisure
    for (const key of ['amenity', 'shop', 'tourism', 'leisure']) {
        const val = tags[key];
        if (val && CATEGORY_MAP[val]) {
            return CATEGORY_MAP[val];
        }
    }
    // Fallback: if it has a name and any of these tags, classify as "Other"
    if (tags.name && (tags.amenity || tags.shop || tags.tourism || tags.leisure)) {
        return 'Other';
    }
    return null;
}

function extractPhone(tags: Record<string, string>): string | null {
    return tags.phone || tags['contact:phone'] || tags['phone:main'] || null;
}

function extractWebsite(tags: Record<string, string>): string | null {
    return tags.website || tags['contact:website'] || tags.url || null;
}

function extractEmail(tags: Record<string, string>): string | null {
    return tags.email || tags['contact:email'] || null;
}

function extractAddress(tags: Record<string, string>): string {
    const parts = [];
    if (tags['addr:housenumber']) parts.push(tags['addr:housenumber']);
    if (tags['addr:street']) parts.push(tags['addr:street']);

    if (parts.length === 0) return 'Lakeland, FL';

    const city = tags['addr:city'] || 'Lakeland';
    const state = tags['addr:state'] || 'FL';
    const zip = tags['addr:postcode'] || '';

    return `${parts.join(' ')}, ${city}, ${state} ${zip}`.trim();
}

async function fetchFromOverpass(): Promise<OSMElement[]> {
    const query = `
    [out:json][timeout:120];
    (
      node["amenity"]["name"](${BBOX.south},${BBOX.west},${BBOX.north},${BBOX.east});
      node["shop"]["name"](${BBOX.south},${BBOX.west},${BBOX.north},${BBOX.east});
      node["tourism"]["name"](${BBOX.south},${BBOX.west},${BBOX.north},${BBOX.east});
      node["leisure"]["name"](${BBOX.south},${BBOX.west},${BBOX.north},${BBOX.east});
      way["amenity"]["name"](${BBOX.south},${BBOX.west},${BBOX.north},${BBOX.east});
      way["shop"]["name"](${BBOX.south},${BBOX.west},${BBOX.north},${BBOX.east});
    );
    out center body;
  `;

    console.log('🌐 Querying Overpass API for Lakeland businesses...');

    const res = await fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `data=${encodeURIComponent(query)}`,
    });

    if (!res.ok) {
        throw new Error(`Overpass API error: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();
    console.log(`📊 Received ${data.elements.length} raw OSM elements`);
    return data.elements;
}

async function getExistingBusinessNames(): Promise<Set<string>> {
    const rows = await sql`SELECT LOWER(name) as name FROM businesses`;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return new Set(rows.map((r: any) => r.name));
}

async function main() {
    console.log('═══════════════════════════════════════');
    console.log('  LakelandFinds OSM Business Scraper');
    console.log('═══════════════════════════════════════');

    // 1. Fetch from Overpass
    const elements = await fetchFromOverpass();

    // 2. Get existing business names for de-dup
    const existing = await getExistingBusinessNames();
    console.log(`📋 ${existing.size} businesses already in database`);

    // 3. Process elements
    let inserted = 0;
    let skippedDupe = 0;
    let skippedNoCategory = 0;
    const batchSize = 50;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const toInsert: any[] = [];

    for (const el of elements) {
        const tags = el.tags || {};
        const name = tags.name;
        if (!name) continue;

        // De-duplicate
        if (existing.has(name.toLowerCase())) {
            skippedDupe++;
            continue;
        }

        // Map category
        const category = mapCategory(tags);
        if (!category) {
            skippedNoCategory++;
            continue;
        }

        const lat = el.lat || el.center?.lat || null;
        const lon = el.lon || el.center?.lon || null;

        toInsert.push({
            name,
            address: extractAddress(tags),
            category,
            city: tags['addr:city'] || 'Lakeland',
            state: tags['addr:state'] || 'FL',
            phone: extractPhone(tags),
            email: extractEmail(tags),
            websiteUrl: extractWebsite(tags),
            lat,
            lng: lon,
        });

        // Mark as existing to prevent intra-batch dupes
        existing.add(name.toLowerCase());
    }

    console.log(`\n📊 Processing Summary:`);
    console.log(`   Total OSM elements: ${elements.length}`);
    console.log(`   Duplicates skipped: ${skippedDupe}`);
    console.log(`   No category match:  ${skippedNoCategory}`);
    console.log(`   Ready to insert:    ${toInsert.length}`);

    // 4. Batch insert
    if (toInsert.length === 0) {
        console.log('\n✅ No new businesses to insert.');
        return;
    }

    console.log(`\n🚀 Inserting ${toInsert.length} businesses in batches of ${batchSize}...`);

    for (let i = 0; i < toInsert.length; i += batchSize) {
        const batch = toInsert.slice(i, i + batchSize);

        for (const biz of batch) {
            try {
                await sql`
          INSERT INTO businesses (name, address, category, city, state, phone, email, website_url, lat, lng)
          VALUES (${biz.name}, ${biz.address}, ${biz.category}, ${biz.city}, ${biz.state}, ${biz.phone}, ${biz.email}, ${biz.websiteUrl}, ${biz.lat}, ${biz.lng})
        `;
                inserted++;
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } catch (err: any) {
                // Skip constraint violations silently
                if (!err.message?.includes('duplicate')) {
                    console.warn(`   ⚠ Failed to insert "${biz.name}": ${err.message}`);
                }
            }
        }

        const pct = Math.round(((i + batch.length) / toInsert.length) * 100);
        process.stdout.write(`   Progress: ${pct}% (${inserted} inserted)\r`);
    }

    console.log(`\n\n═══════════════════════════════════════`);
    console.log(`  ✅ COMPLETE: ${inserted} new businesses added`);
    console.log(`═══════════════════════════════════════`);
}

main().catch((err) => {
    console.error('❌ Scraper failed:', err);
    process.exit(1);
});
