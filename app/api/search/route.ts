import { db } from '@/lib/db';
import { businesses } from '@/lib/db/schema';
import { ilike, or, sql, desc } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    const q = req.nextUrl.searchParams.get('q')?.trim();

    if (!q || q.length < 2) {
        return NextResponse.json({ categories: [], businesses: [] });
    }

    const searchTerm = `%${q}%`;

    try {
        // Get matching categories (up to 5)
        const catResults = await db
            .select({
                category: businesses.category,
                count: sql<number>`count(*)::int`,
            })
            .from(businesses)
            .where(ilike(businesses.category, searchTerm))
            .groupBy(businesses.category)
            .orderBy(sql`count(*) DESC`)
            .limit(5);

        // Get matching businesses (up to 8)
        const bizResults = await db
            .select({
                id: businesses.id,
                name: businesses.name,
                category: businesses.category,
                rating: businesses.rating,
                address: businesses.address,
            })
            .from(businesses)
            .where(
                or(
                    ilike(businesses.name, searchTerm),
                    ilike(businesses.category, searchTerm),
                    ilike(businesses.address, searchTerm)
                )
            )
            .orderBy(desc(businesses.rating))
            .limit(8);

        return NextResponse.json({
            categories: catResults.filter(c => c.category),
            businesses: bizResults,
        });
    } catch (error) {
        console.error('Search API error:', error);
        return NextResponse.json({ categories: [], businesses: [] }, { status: 500 });
    }
}
