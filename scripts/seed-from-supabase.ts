/**
 * Seed Neon DB from Supabase contacts_master
 * Run: npx tsx scripts/seed-from-supabase.ts
 */
import { config } from 'dotenv';
config({ path: '.env.local' });
config({ path: '.env' });
import { neon } from '@neondatabase/serverless';

const SUPABASE_URL = 'https://rzcpfwkygdvoshtwxncs.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const DATABASE_URL = process.env.DATABASE_URL || '';

if (!SUPABASE_KEY) {
    console.error('❌ Missing SUPABASE_SERVICE_ROLE_KEY in .env.local');
    process.exit(1);
}

interface Contact {
    id: string;
    company_name: string;
    email?: string;
    phone?: string;
    website_url?: string;
    niche?: string;
    status?: string;
    source?: string;
    full_name?: string;
}

// Category mapping from niche/industry
function inferCategory(contact: Contact): string {
    const niche = (contact.niche || '').toLowerCase();
    if (niche.includes('hvac') || niche.includes('heating') || niche.includes('cooling') || niche.includes('air'))
        return 'HVAC';
    if (niche.includes('plumb')) return 'Plumbing';
    if (niche.includes('roof')) return 'Roofing';
    if (niche.includes('electric')) return 'Electrical';
    if (niche.includes('lawn') || niche.includes('landscape') || niche.includes('landscaping'))
        return 'Landscaping';
    if (niche.includes('pest')) return 'Pest Control';
    if (niche.includes('tow')) return 'Towing';
    if (niche.includes('locksmith')) return 'Locksmith';
    if (niche.includes('law') || niche.includes('legal') || niche.includes('attorney'))
        return 'Legal Services';
    if (niche.includes('water') || niche.includes('restoration') || niche.includes('flood'))
        return 'Water Damage Restoration';
    if (niche.includes('clean')) return 'Cleaning Services';
    return 'Local Business';
}

// Generate a random AI visibility score (simulate real audits)
function generateAiScore(): number {
    // Most small businesses score low — realistic distribution
    const ranges = [
        { min: 8, max: 30, weight: 40 },   // 40% score poorly
        { min: 31, max: 55, weight: 35 },   // 35% score average
        { min: 56, max: 75, weight: 20 },   // 20% score decent
        { min: 76, max: 95, weight: 5 },    // 5% score well
    ];
    const roll = Math.random() * 100;
    let cumulative = 0;
    for (const range of ranges) {
        cumulative += range.weight;
        if (roll <= cumulative) {
            return Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
        }
    }
    return 25;
}

async function seed() {
    console.log('============================================================');
    console.log('  LAKELAND LOCAL — SEED FROM SUPABASE');
    console.log('============================================================');

    // 1. Fetch contacts from Supabase (actual columns: id, company_name, email, phone, website_url, niche, status, source, full_name)
    const url = `${SUPABASE_URL}/rest/v1/contacts_master?select=id,company_name,email,phone,website_url,niche,status,source,full_name&company_name=not.is.null&limit=1000`;
    const res = await fetch(url, {
        headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
        },
    });

    if (!res.ok) {
        console.error('❌ Supabase fetch failed:', res.status, await res.text());
        process.exit(1);
    }

    const contacts: Contact[] = await res.json();
    console.log(`📊 Fetched ${contacts.length} contacts from Supabase`);

    // 2. Filter for businesses with names
    const businesses = contacts.filter(
        (c) => c.company_name && c.company_name.length > 2
    );
    console.log(`🏢 ${businesses.length} have valid company names`);

    // 3. Connect to Neon
    const sql = neon(DATABASE_URL);

    // 4. Create table if not exists (with new schema)
    await sql`
    CREATE TABLE IF NOT EXISTS businesses (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      name TEXT NOT NULL,
      address TEXT NOT NULL,
      category TEXT,
      city TEXT DEFAULT 'Lakeland',
      state TEXT DEFAULT 'FL',
      vibe_summary TEXT,
      claimed_status BOOLEAN DEFAULT false,
      contact_info JSONB,
      website_url TEXT,
      phone TEXT,
      email TEXT,
      ai_visibility_score INTEGER,
      ai_score_date TIMESTAMP,
      created_at TIMESTAMP DEFAULT now(),
      updated_at TIMESTAMP DEFAULT now()
    )
  `;

    // Add new columns if table already existed
    try { await sql`ALTER TABLE businesses ADD COLUMN IF NOT EXISTS city TEXT DEFAULT 'Lakeland'`; } catch { }
    try { await sql`ALTER TABLE businesses ADD COLUMN IF NOT EXISTS state TEXT DEFAULT 'FL'`; } catch { }
    try { await sql`ALTER TABLE businesses ADD COLUMN IF NOT EXISTS email TEXT`; } catch { }
    try { await sql`ALTER TABLE businesses ADD COLUMN IF NOT EXISTS ai_visibility_score INTEGER`; } catch { }
    try { await sql`ALTER TABLE businesses ADD COLUMN IF NOT EXISTS ai_score_date TIMESTAMP`; } catch { }

    console.log('✅ Table schema ready');

    // 5. Clear existing data for clean seed
    await sql`DELETE FROM businesses`;
    console.log('🧹 Cleared existing data');

    // 6. Insert businesses
    let inserted = 0;
    for (const biz of businesses) {
        const name = biz.company_name.trim();
        const address = 'Lakeland, FL';
        const city = 'Lakeland';
        const state = 'FL';
        const category = inferCategory(biz);
        const phone = biz.phone || null;
        const email = biz.email || null;
        const websiteUrl = biz.website_url || null;
        const aiScore = generateAiScore();
        const contactInfo = JSON.stringify({
            phone: phone,
            email: email,
            website: websiteUrl,
        });

        try {
            await sql`
        INSERT INTO businesses (name, address, category, city, state, phone, email, website_url, ai_visibility_score, ai_score_date, contact_info)
        VALUES (${name}, ${address}, ${category}, ${city}, ${state}, ${phone}, ${email}, ${websiteUrl}, ${aiScore}, NOW(), ${contactInfo})
      `;
            inserted++;
            if (inserted % 25 === 0) {
                console.log(`  📦 Inserted ${inserted}/${businesses.length}...`);
            }
        } catch (err: any) {
            console.error(`  ❌ Failed: ${name} — ${err.message}`);
        }
    }

    console.log('');
    console.log('============================================================');
    console.log(`  ✅ SEED COMPLETE: ${inserted}/${businesses.length} businesses inserted`);
    console.log('============================================================');

    // 7. Quick stats
    const stats = await sql`
    SELECT category, COUNT(*) as count 
    FROM businesses 
    GROUP BY category 
    ORDER BY count DESC
  `;
    console.log('\n📊 Category Breakdown:');
    for (const row of stats) {
        console.log(`  ${row.category}: ${row.count}`);
    }

    const scoreStats = await sql`
    SELECT 
      COUNT(*) as total,
      AVG(ai_visibility_score) as avg_score,
      MIN(ai_visibility_score) as min_score,
      MAX(ai_visibility_score) as max_score
    FROM businesses
  `;
    if (scoreStats[0]) {
        console.log(`\n🎯 AI Scores: avg=${Math.round(scoreStats[0].avg_score)} min=${scoreStats[0].min_score} max=${scoreStats[0].max_score}`);
    }
}

seed().catch(console.error);
