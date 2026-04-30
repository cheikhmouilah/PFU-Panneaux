import { pool } from './server/db.js';

async function verifyDataStructure() {
    try {
        console.log('--- Vérification Structure Données API ---');
        const res = await pool.query(`
            SELECT *, 
                   ST_AsGeoJSON(location)::json as location 
            FROM panels
            LIMIT 1
        `);

        if (res.rows.length === 0) {
            console.log('Aucun panneau trouvé dans la table.');
            return;
        }

        const panel = res.rows[0];
        console.log('Structure du premier panneau :');
        console.log('Type de "location" :', typeof panel.location);
        console.log('Valeur de "location" :', JSON.stringify(panel.location, null, 2));

        if (typeof panel.location === 'string') {
            console.log('⚠️ ATTENTION : La location est une chaîne de caractères, le frontend attend un objet !');
        } else if (panel.location && panel.location.coordinates) {
            console.log('✅ Structure location correcte (objet avec coordinates)');
        } else {
            console.log('❌ Structure location INCORRECTE');
        }

    } catch (error) {
        console.error('❌ Erreur :', error.message);
    } finally {
        process.exit(0);
    }
}

verifyDataStructure();
