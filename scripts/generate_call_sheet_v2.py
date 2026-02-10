"""
Generate an improved cold call sheet for Dan from the expanded Lakeland businesses CSV.
Sorts by "easiest sell" — businesses without websites come first.
Includes a pre-written opener/hook for each call.
"""
import os, csv

csv_path = os.path.join(os.path.dirname(__file__), 'lakeland_businesses_expanded.csv')
with open(csv_path, 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    businesses = list(reader)

print(f"Loaded {len(businesses)} businesses")

# Filter: must have a phone number
with_phone = [b for b in businesses if b.get('phone', '').strip()]
print(f"With phone: {len(with_phone)}")

# Categorize by opportunity type
no_website = []
has_website = []
low_rated = []

for biz in with_phone:
    website = biz.get('website', '').strip()
    rating = float(biz.get('rating', 0) or 0)
    total_ratings = int(biz.get('total_ratings', 0) or 0)
    
    if not website:
        no_website.append(biz)
    else:
        has_website.append(biz)
    
    if rating > 0 and rating < 3.5 and total_ratings >= 5:
        low_rated.append(biz)

print(f"\nOpportunity breakdown:")
print(f"  No website (EASY SELL): {len(no_website)}")
print(f"  Has website: {len(has_website)}")
print(f"  Low rated (<3.5 stars, 5+ reviews): {len(low_rated)}")

# Sort no-website first (by rating desc so best businesses are at top)
# Then has-website sorted by those with low ratings
no_website.sort(key=lambda b: float(b.get('rating', 0) or 0), reverse=True)
has_website.sort(key=lambda b: float(b.get('rating', 0) or 0))  # low rated first

# Build call sheet rows
rows = []

for biz in no_website:
    rating = float(biz.get('rating', 0) or 0)
    total = int(biz.get('total_ratings', 0) or 0)
    
    hook = "NO WEBSITE — needs online presence"
    if rating >= 4.5 and total >= 20:
        opener = f"Your customers love you ({rating}★, {total} reviews) but you have no website — people searching online can't find you. We can fix that."
    elif rating >= 4.0:
        opener = f"You've got great reviews ({rating}★) but no website. People searching 'best {biz['category'].lower()} Lakeland' can't find you online."
    else:
        opener = f"I noticed you don't have a website yet. These days, most customers search online first — we can help you get set up."
    
    rows.append({
        'Priority': '🔴 HIGH',
        'Business Name': biz.get('name', ''),
        'Phone': biz.get('phone', ''),
        'Category': biz.get('category', ''),
        'Rating': f"{rating}★ ({total})" if rating > 0 else "No reviews",
        'Website': 'NONE',
        'Address': biz.get('address', ''),
        'Hook': hook,
        'Opener': opener,
    })

for biz in has_website:
    rating = float(biz.get('rating', 0) or 0)
    total = int(biz.get('total_ratings', 0) or 0)
    website = biz.get('website', '')
    
    if rating > 0 and rating < 3.5 and total >= 5:
        hook = f"LOW REVIEWS ({rating}★) — reputation management"
        opener = f"I noticed your Google rating is {rating}★ — that can hurt when customers are comparing options. We help businesses improve their online reputation."
        priority = '🟡 MEDIUM'
    elif rating >= 4.5 and total >= 50:
        hook = f"TOP RATED ({rating}★, {total} reviews) — premium listing"
        opener = f"You're one of the top-rated {biz['category'].lower()}s in Lakeland ({rating}★, {total} reviews). We'd love to feature you prominently on our directory."
        priority = '🟢 WARM'
    else:
        hook = "Directory listing awareness"
        opener = f"I'm calling from Lakeland Local, a new business directory for the area. We've already listed your business and wanted to let you know — you can claim your listing for free."
        priority = '⚪ STANDARD'
    
    rows.append({
        'Priority': priority,
        'Business Name': biz.get('name', ''),
        'Phone': biz.get('phone', ''),
        'Category': biz.get('category', ''),
        'Rating': f"{rating}★ ({total})" if rating > 0 else "No reviews",
        'Website': website,
        'Address': biz.get('address', ''),
        'Hook': hook,
        'Opener': opener,
    })

# Save call sheet CSV
output_path = os.path.join(os.path.dirname(__file__), 'lakeland_call_sheet.csv')
with open(output_path, 'w', newline='', encoding='utf-8') as f:
    writer = csv.DictWriter(f, fieldnames=[
        'Priority', 'Business Name', 'Phone', 'Category', 'Rating',
        'Website', 'Address', 'Hook', 'Opener'
    ])
    writer.writeheader()
    for row in rows:
        writer.writerow(row)

# Copy to Desktop
import shutil
desktop = os.path.join(os.path.expanduser('~'), 'Desktop', 'lakeland_call_sheet.csv')
shutil.copy2(output_path, desktop)

print(f"\n{'='*60}")
print(f"  COLD CALL SHEET GENERATED")
print(f"{'='*60}")
print(f"  Total calls: {len(rows)}")
print(f"  🔴 HIGH (no website): {sum(1 for r in rows if r['Priority'] == '🔴 HIGH')}")
print(f"  🟡 MEDIUM (low reviews): {sum(1 for r in rows if r['Priority'] == '🟡 MEDIUM')}")
print(f"  🟢 WARM (top rated): {sum(1 for r in rows if r['Priority'] == '🟢 WARM')}")
print(f"  ⚪ STANDARD: {sum(1 for r in rows if r['Priority'] == '⚪ STANDARD')}")
print(f"\n  Saved to: {output_path}")
print(f"  Copied to Desktop!")
print(f"\n  TIP: Start with 🔴 HIGH priority — these businesses")
print(f"  have NO website and need you the most.")
