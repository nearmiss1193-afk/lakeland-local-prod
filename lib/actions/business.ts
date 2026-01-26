'use server';

import { db } from '@/lib/db';
import { businesses } from '@/lib/db/schema';
import { desc } from 'drizzle-orm';

export async function getBusinesses() {
    try {
        const data = await db.select().from(businesses).orderBy(desc(businesses.createdAt));
        return { success: true, data };
    } catch (error) {
        console.error('Failed to fetch businesses:', error);
        return { success: false, error: 'Failed to fetch businesses' };
    }
}
