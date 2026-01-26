import { pgTable, text, boolean, timestamp, uuid, jsonb } from 'drizzle-orm/pg-core';

export const businesses = pgTable('businesses', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  address: text('address').notNull(),
  category: text('category'),
  vibeSummary: text('vibe_summary'),
  claimedStatus: boolean('claimed_status').default(false),
  contactInfo: jsonb('contact_info'), // Stores flexible JSON data like { phone, email, etc. }
  websiteUrl: text('website_url'),
  phone: text('phone'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
