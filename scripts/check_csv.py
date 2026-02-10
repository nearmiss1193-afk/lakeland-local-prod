"""Check the scraped CSV results"""
import csv

with open('scripts/lakeland_businesses.csv', 'r', encoding='utf-8') as f:
    rows = list(csv.DictReader(f))

print(f"Total businesses: {len(rows)}")
print(f"With phone: {sum(1 for x in rows if x.get('phone'))}")
print(f"With website: {sum(1 for x in rows if x.get('website'))}")
print(f"With rating: {sum(1 for x in rows if float(x.get('rating', 0)) > 0)}")

print("\nFirst 8 businesses:")
for x in rows[:8]:
    print(f"  {x['name']} | {x['category']} | {x['address'][:40]}...")
    print(f"    Phone: {x.get('phone','N/A')} | Web: {x.get('website','N/A')[:50]}")

# Category counts
cats = {}
for x in rows:
    c = x['category']
    cats[c] = cats.get(c, 0) + 1

print(f"\nTop 15 categories:")
for c, n in sorted(cats.items(), key=lambda x: -x[1])[:15]:
    print(f"  {c}: {n}")
