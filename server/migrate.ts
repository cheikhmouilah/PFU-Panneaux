import { pool } from './db.js';
import fs from 'fs';
import path from 'path';

async function runMigrations() {
    try {
        console.log('Running migrations...');
        const schemaSql = fs.readFileSync(path.join(process.cwd(), 'server', 'geosignal_schema.sql'), 'utf-8');
        const sampleSql = fs.readFileSync(path.join(process.cwd(), 'supabase', 'migrations', '20251217190320_sample_data.sql'), 'utf-8');

        await pool.query(schemaSql);
        console.log('✅ Schema created successfully!');

        await pool.query(sampleSql);
        console.log('✅ Sample data inserted successfully!');
    } catch (e) {
        console.error('Migration error:', e);
    } finally {
        await pool.end();
    }
}

runMigrations();
