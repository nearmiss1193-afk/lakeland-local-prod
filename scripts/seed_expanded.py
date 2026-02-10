"""
Seed Neon DB with expanded Lakeland businesses from Google Places CSV.
Uses lakeland_businesses_expanded.csv and inserts into the businesses table.
"""
import os, csv
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env.local'))
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

DATABASE_URL = os.getenv('DATABASE_URL', '')
if not DATABASE_URL:
    print("ERROR: No DATABASE_URL found")
    exit(1)

import psycopg2

csv_path = os.path.join(os.path.dirname(__file__), 'lakeland_businesses_expanded.csv')
with open(csv_path, 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    businesses = list(reader)

print(f"Loaded {len(businesses)} from expanded CSV")
print(f"  With phone: {sum(1 for b in businesses if b.get('phone'))}")
print(f"  With website: {sum(1 for b in businesses if b.get('website'))}")

conn = psycopg2.connect(DATABASE_URL)
cur = conn.cursor()

# Check existing
cur.execute("SELECT COUNT(*) FROM businesses")
existing = cur.fetchone()[0]
print(f"  Existing in DB: {existing}")

# Clear old and re-seed
print(f"  Clearing {existing} old records...")
cur.execute("DELETE FROM businesses")
conn.commit()

# Batch insert for speed
inserted = 0
skipped = 0
batch = []
BATCH_SIZE = 100

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
    
    batch.append((name, address, category, phone, website, 'Lakeland', 'FL', rating, total_ratings, lat, lng))
    
    if len(batch) >= BATCH_SIZE:
        try:
            args_str = ','.join(
                cur.mogrify("(%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)", b).decode('utf-8')
                for b in batch
            )
            cur.execute(f"""
                INSERT INTO businesses (name, address, category, phone, website_url, 
                                        city, state, rating, total_ratings, lat, lng)
                VALUES {args_str}
            """)
            inserted += len(batch)
            conn.commit()
        except Exception as e:
            conn.rollback()
            # Fall back to individual inserts
            for b in batch:
                try:
                    cur.execute("""
                        INSERT INTO businesses (name, address, category, phone, website_url, 
                                                city, state, rating, total_ratings, lat, lng)
                        VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
                    """, b)
                    inserted += 1
                    conn.commit()
                except:
                    skipped += 1
                    conn.rollback()
        batch = []
        if inserted % 500 == 0:
            print(f"  Inserted: {inserted}...")

# Final batch
if batch:
    try:
        args_str = ','.join(
            cur.mogrify("(%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)", b).decode('utf-8')
            for b in batch
        )
        cur.execute(f"""
            INSERT INTO businesses (name, address, category, phone, website_url, 
                                    city, state, rating, total_ratings, lat, lng)
            VALUES {args_str}
        """)
        inserted += len(batch)
        conn.commit()
    except:
        conn.rollback()
        for b in batch:
            try:
                cur.execute("""
                    INSERT INTO businesses (name, address, category, phone, website_url, 
                                            city, state, rating, total_ratings, lat, lng)
                    VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
                """, b)
                inserted += 1
                conn.commit()
            except:
                skipped += 1
                conn.rollback()

# Verify
cur.execute("SELECT COUNT(*) FROM businesses")
final = cur.fetchone()[0]
cur.execute("SELECT category, COUNT(*) FROM businesses GROUP BY category ORDER BY COUNT(*) DESC LIMIT 20")
cats = cur.fetchall()

print(f"\n{'='*60}")
print(f"  SEEDING COMPLETE")
print(f"{'='*60}")
print(f"  Inserted: {inserted}")
print(f"  Skipped: {skipped}")
print(f"  Total in DB: {final}")
print(f"\n  Top 20 categories:")
for cat, cnt in cats:
    print(f"    {cat}: {cnt}")

cur.close()
conn.close()
