import { db } from './lib/db/index';
import { businesses } from './lib/db/schema';
import { generateVibeSummary } from './lib/actions/ai';
import { eq, isNull } from 'drizzle-orm';
import * as dotenv from 'dotenv';
import { model } from './lib/gemini';

dotenv.config({ path: '.env.local' });

async function enrich() {
    console.log('🤖 Starting AI Enrichment...');

    // Fetch all businesses
    const allBusinesses = await db.select().from(businesses);

    for (const bus of allBusinesses) {
        if (bus.vibeSummary) {
            console.log(`⏩ Skipping ${bus.name} (Already has summary)`);
            continue;
        }

        console.log(`Analyzing: ${bus.name}...`);

        // Generate new summary
        const vibe = await generateVibeSummary(bus.name, bus.category || 'Business', bus.address);

        if (vibe) {
            console.log(`✨ Generated: "${vibe}"`);

            // Update DB
            await db.update(businesses)
                .set({ vibeSummary: vibe })
                .where(eq(businesses.id, bus.id));
        } else {
            console.log('⚠️ Skipped (AI Error)');
        }
    }

    console.log('✅ Enrichment complete');
    process.exit(0);
}

enrich();
