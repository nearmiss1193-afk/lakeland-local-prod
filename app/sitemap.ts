import { MetadataRoute } from 'next';
import { neon } from '@neondatabase/serverless';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = 'https://lakeland-local-prod.vercel.app';

    // Static pages
    const staticPages: MetadataRoute.Sitemap = [
        { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
        { url: `${baseUrl}/search`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
        { url: `${baseUrl}/categories`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
        { url: `${baseUrl}/claim`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    ];

    // Dynamic business pages (only when DATABASE_URL is available)
    let businessPages: MetadataRoute.Sitemap = [];
    if (process.env.DATABASE_URL) {
        try {
            const sql = neon(process.env.DATABASE_URL);
            const rows = await sql`SELECT id, updated_at FROM businesses ORDER BY updated_at DESC LIMIT 5000`;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            businessPages = rows.map((row: any) => ({
                url: `${baseUrl}/business/${row.id}`,
                lastModified: row.updated_at ? new Date(row.updated_at) : new Date(),
                changeFrequency: 'weekly' as const,
                priority: 0.7,
            }));
        } catch (err) {
            console.error('Sitemap: Failed to load businesses', err);
        }
    }

    return [...staticPages, ...businessPages];
}
