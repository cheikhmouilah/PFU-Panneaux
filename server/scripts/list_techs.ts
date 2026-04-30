import { pool } from '../db.js';

async function listProfiles() {
    try {
        const res = await pool.query("SELECT * FROM profiles WHERE role = 'technicien'");
        console.log('Technician Profiles:', JSON.stringify(res.rows, null, 2));

        const res2 = await pool.query("SELECT * FROM technicians");
        console.log('Existing Technicians:', JSON.stringify(res2.rows, null, 2));
    } catch (error) {
        console.error('Error:', error);
    } finally {
        process.exit(0);
    }
}

listProfiles();
