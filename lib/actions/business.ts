'use server';

import { db } from '@/lib/db';
import { businesses } from '@/lib/db/schema';
import { desc, ilike, or, sql } from 'drizzle-orm';

export async function getBusinesses(limit = 24) {
    try {
        const data = await db.select().from(businesses)
            .orderBy(desc(businesses.rating))
            .limit(limit);
        return { success: true, data };
    } catch (error) {
        console.error('Failed to fetch businesses:', error);
        return { success: false, data: [], error: 'Failed to fetch businesses' };
    }
}

export async function getBusinessCount() {
    try {
        const result = await db.select({ count: sql<number>`count(*)::int` }).from(businesses);
        return result[0]?.count || 0;
    } catch {
        return 0;
    }
}

export async function getCategories() {
    try {
        const result = await db
            .select({
                category: businesses.category,
                count: sql<number>`count(*)::int`,
            })
            .from(businesses)
            .groupBy(businesses.category)
            .orderBy(sql`count(*) DESC`);

        return { success: true, data: result.filter(r => r.category) as { category: string; count: number }[] };
    } catch (error) {
        console.error('Failed to fetch categories:', error);
        return { success: false, data: [] };
    }
}

export async function searchBusinesses(query?: string, category?: string) {
    try {
        let q = db.select().from(businesses).$dynamic();

        if (query && query.trim()) {
            const searchTerm = `%${query.trim()}%`;
            q = q.where(
                or(
                    ilike(businesses.name, searchTerm),
                    ilike(businesses.category, searchTerm),
                    ilike(businesses.address, searchTerm)
                )
            );
        }

        if (category && category.trim()) {
            q = q.where(ilike(businesses.category, category.trim()));
        }

        const data = await q.orderBy(desc(businesses.rating)).limit(100);

        return { success: true, data };
    } catch (error) {
        console.error('Failed to search businesses:', error);
        return { success: false, data: [], error: 'Search failed' };
    }
}
