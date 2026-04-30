import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const poolConfig = process.env.DATABASE_URL 
    ? { connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } }
    : {
        user: process.env.DB_USER || 'postgres',
        host: process.env.DB_HOST || '127.0.0.1',
        database: process.env.DB_NAME || 'postgis',
        password: process.env.DB_PASSWORD || 'postgresql',
        port: parseInt(process.env.DB_PORT || '5432'),
    };

export const pool = new Pool(poolConfig as any);

pool.connect((err, client, release) => {
    if (err) {
        console.error('❌ Erreur de connexion initiale à la base de données:', err.message);
        console.error('Détails config:', {
            user: process.env.DB_USER || 'postgres',
            host: process.env.DB_HOST || '127.0.0.1',
            database: process.env.DB_NAME || 'postgis',
            port: process.env.DB_PORT || '5432'
        });
    } else {
        client.query('SET search_path TO geosignal, public', (err) => {
            if (err) {
                console.error('❌ Erreur lors de la configuration du search_path:', err);
            } else {
                console.log('✅ Connexion à la base de données PostgreSQL réussie (schema geosignal).');
            }
            release();
        });
    }
});

pool.on('connect', (client) => {
    client.query('SET search_path TO geosignal, public', (err) => {
        if (err) console.error('Erreur lors du paramétrage du search_path:', err);
    });
});

pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
});
