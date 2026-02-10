"""
Seed Neon DB with Lakeland businesses from Google Places CSV.
Reads lakeland_businesses.csv and inserts into the businesses table.
"""
import os, csv
from dotenv import load_dotenv

# Load env
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env.local'))
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

DATABASE_URL = os.getenv('DATABASE_URL', '')
if not DATABASE_URL:
    print("ERROR: No DATABASE_URL found")
    exit(1)

import psycopg2

# Read CSV
csv_path = os.path.join(os.path.dirname(__file__), 'lakeland_businesses.csv')
with open(csv_path, 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    businesses = list(reader)

print(f"Loaded {len(businesses)} businesses from CSV")
print(f"With phone: {sum(1 for b in businesses if b.get('phone'))}")
print(f"With website: {sum(1 for b in businesses if b.get('website'))}")

# Connect to Neon
conn = psycopg2.connect(DATABASE_URL)
cur = conn.cursor()

# Check existing count
cur.execute("SELECT COUNT(*) FROM businesses")
existing = cur.fetchone()[0]
print(f"Existing businesses in DB: {existing}")

# Clear old data and re-seed with full dataset
if existing > 0:
    print(f"Clearing {existing} old records...")
    cur.execute("DELETE FROM businesses")
    conn.commit()

# Add columns if they don't exist
try:
    cur.execute("""
        ALTER TABLE businesses 
        ADD COLUMN IF NOT EXISTS city TEXT,
        ADD COLUMN IF NOT EXISTS state TEXT,
        ADD COLUMN IF NOT EXISTS email TEXT,
        ADD COLUMN IF NOT EXISTS ai_visibility_score INTEGER,
        ADD COLUMN IF NOT EXISTS ai_score_date TIMESTAMP,
        ADD COLUMN IF NOT EXISTS lat DOUBLE PRECISION,
        ADD COLUMN IF NOT EXISTS lng DOUBLE PRECISION,
        ADD COLUMN IF NOT EXISTS rating REAL,
        ADD COLUMN IF NOT EXISTS total_ratings INTEGER,
        ADD COLUMN IF NOT EXISTS hours TEXT
    """)
    conn.commit()
    print("Schema updated with new columns")
except Exception as e:
    conn.rollback()
    print(f"Schema update note: {e}")

# Insert businesses
inserted = 0
skipped = 0

for biz in businesses:
    name = biz.get('name', '').strip()
    if not name:
        skipped += 1
        continue
    
    address = biz.get('address', 'Lakeland, FL')
    category = biz.get('category', 'Local Business')
    phone = biz.get('phone', '')
    website = biz.get('website', '')
    rating = float(biz.get('rating', 0) or 0)
    total_ratings = int(biz.get('total_ratings', 0) or 0)
    lat = float(biz.get('lat', 0) or 0)
    lng = float(biz.get('lng', 0) or 0)
    hours = biz.get('hours', '')
    
    try:
        cur.execute("""
            INSERT INTO businesses (name, address, category, phone, website_url, 
                                    city, state, rating, total_ratings, lat, lng)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, (name, address, category, phone, website,
              'Lakeland', 'FL', rating, total_ratings, lat, lng))
        inserted += 1
    except Exception as e:
        skipped += 1
        if skipped <= 3:
            print(f"  Skip: {name} - {e}")
        conn.rollback()

conn.commit()

# Verify
cur.execute("SELECT COUNT(*) FROM businesses")
final_count = cur.fetchone()[0]

cur.execute("SELECT category, COUNT(*) as cnt FROM businesses GROUP BY category ORDER BY cnt DESC LIMIT 15")
cats = cur.fetchall()

print(f"\n{'='*60}")
print(f"  SEEDING COMPLETE")
print(f"{'='*60}")
print(f"  Inserted: {inserted}")
print(f"  Skipped: {skipped}")
print(f"  Total in DB: {final_count}")
print(f"\n  Top categories:")
for cat, cnt in cats:
    print(f"    {cat}: {cnt}")

cur.close()
conn.close()
