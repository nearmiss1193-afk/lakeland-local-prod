'use server';

import { db } from '@/lib/db';
import { businesses } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function getBusiness(id: string) {
    try {
        const data = await db.select().from(businesses).where(eq(businesses.id, id)).limit(1);
        return { success: true, data: data[0] };
    } catch (error) {
        console.error('Failed to fetch business:', error);
        return { success: false, error: 'Failed to fetch business' };
    }
}
