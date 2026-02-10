import { pgTable, text, boolean, timestamp, uuid, jsonb, integer, real, doublePrecision } from 'drizzle-orm/pg-core';

export const businesses = pgTable('businesses', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  address: text('address').notNull(),
  category: text('category'),
  city: text('city').default('Lakeland'),
  state: text('state').default('FL'),
  vibeSummary: text('vibe_summary'),
  claimedStatus: boolean('claimed_status').default(false),
  contactInfo: jsonb('contact_info'),
  websiteUrl: text('website_url'),
  phone: text('phone'),
  email: text('email'),
  rating: real('rating'),
  totalRatings: integer('total_ratings'),
  lat: doublePrecision('lat'),
  lng: doublePrecision('lng'),
  aiVisibilityScore: integer('ai_visibility_score'),
  aiScoreDate: timestamp('ai_score_date'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
