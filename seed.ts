import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as dotenv from 'dotenv';
import { pgTable, text, boolean, timestamp, uuid, jsonb } from 'drizzle-orm/pg-core';

dotenv.config({ path: '.env.local' });

// Inline Schema Definition (to avoid import issues during this script execution)
const businesses = pgTable('businesses', {
    id: uuid('id').defaultRandom().primaryKey(),
    name: text('name').notNull(),
    address: text('address').notNull(),
    category: text('category'),
    vibeSummary: text('vibe_summary'),
    claimedStatus: boolean('claimed_status').default(false),
    contactInfo: jsonb('contact_info'),
    websiteUrl: text('website_url'),
    phone: text('phone'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
});

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

async function seed() {
    console.log('🌱 Seeding database...');

    try {
        await db.insert(businesses).values([
            {
                name: 'Lakeland Coffee Co',
                address: '123 Main St, Lakeland, FL 33801',
                category: 'Cafe',
                vibeSummary: 'Cozy spot with artisanal roasts and free wifi. Great for remote work.',
                contactInfo: { phone: '863-555-0101', website: 'lakelandcoffee.com' },
                websiteUrl: 'https://lakelandcoffee.com',
                phone: '863-555-0101',
            },
            {
                name: 'Swan City Cycles',
                address: '456 Lake Morton Dr, Lakeland, FL 33801',
                category: 'Retail',
                vibeSummary: 'Friendly bike shop offering rentals and repairs. Community focused.',
                contactInfo: { phone: '863-555-0102' },
                phone: '863-555-0102',
            },
        ]);
        console.log('✅ Seeding complete!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    }
}

seed();
