import { pool } from '../db.js';
import bcrypt from 'bcryptjs';
import readline from 'readline';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const question = (query: string): Promise<string> => {
    return new Promise((resolve) => {
        rl.question(query, resolve);
    });
};

async function createUser() {
    try {
        console.log('--- Création d\'un nouvel utilisateur ---');

        const fullName = await question('Nom complet: ');
        const email = await question('Email: ');
        const password = await question('Mot de passe: ');
        const role = await question('Rôle (admin, responsable, technicien, observateur) [observateur]: ') || 'observateur';

        if (!['admin', 'responsable', 'technicien', 'observateur'].includes(role)) {
            console.error('Rôle invalide. Les rôles permis sont: admin, responsable, technicien, observateur');
            process.exit(1);
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // Generate UUID
            const profileIdRes = await client.query('SELECT gen_random_uuid()');
            const profileId = profileIdRes.rows[0].gen_random_uuid;

            // Insert profile
            await client.query(
                'INSERT INTO profiles (id, full_name, role) VALUES ($1, $2, $3)',
                [profileId, fullName, role]
            );

            // Insert user
            await client.query(
                'INSERT INTO users (email, password_hash, profile_id) VALUES ($1, $2, $3)',
                [email, hashedPassword, profileId]
            );

            await client.query('COMMIT');
            console.log(`\n✅ Utilisateur ${email} créé avec succès avec le rôle '${role}'`);
        } catch (e) {
            await client.query('ROLLBACK');
            console.error('Erreur lors de la création:', e);
        } finally {
            client.release();
        }

    } catch (error) {
        console.error('Erreur:', error);
    } finally {
        rl.close();
        await pool.end();
    }
}

createUser();
