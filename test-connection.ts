import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL!);

async function test() {
    console.log('Testing connection...');
    try {
        const result = await sql`SELECT version()`;
        console.log('✅ Connection success:', result[0]);
    } catch (err) {
        console.error('❌ Connection failed:', err);
    }
}

test();
