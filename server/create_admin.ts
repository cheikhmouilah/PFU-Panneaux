import { pool } from './db.js';
import bcrypt from 'bcryptjs';

async function createAdmin() {
    try {
        const fullName = 'Admin';
        const email = 'admin@admin.com';
        const password = 'admin';
        const role = 'admin';

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const profileIdRes = await client.query('SELECT gen_random_uuid()');
            const profileId = profileIdRes.rows[0].gen_random_uuid;

            await client.query(
                'INSERT INTO profiles (id, full_name, role) VALUES ($1, $2, $3)',
                [profileId, fullName, role]
            );

            await client.query(
                'INSERT INTO users (email, password_hash, profile_id) VALUES ($1, $2, $3)',
                [email, hashedPassword, profileId]
            );

            await client.query('COMMIT');
            console.log(`✅ Utilisateur ${email} créé avec succès avec le rôle '${role}'`);
        } catch (e) {
            await client.query('ROLLBACK');
            console.error('Erreur lors de la création:', e);
        } finally {
            client.release();
        }

    } catch (error) {
        console.error('Erreur:', error);
    } finally {
        await pool.end();
    }
}

createAdmin();
