import { pool } from './server/db.js';

async function checkRLS() {
    try {
        console.log('--- Vérification RLS (Row Level Security) ---');
        const res = await pool.query(`
            SELECT 
                relname as table_name, 
                relrowsecurity as rls_enabled 
            FROM pg_class 
            JOIN pg_namespace ON pg_namespace.oid = pg_class.relnamespace
            WHERE relkind = 'r' 
            AND nspname = 'public'
            AND relname IN ('users', 'profiles', 'panels', 'interventions', 'technicians');
        `);

        console.log('État RLS par table :');
        res.rows.forEach(row => {
            console.log(`- ${row.table_name} : ${row.rls_enabled ? 'Activé (⚠️)' : 'Désactivé (✅)'}`);
        });

        const rlsActive = res.rows.some(row => row.rls_enabled);
        if (rlsActive) {
            console.log('\n💡 CONSEIL : Si le RLS est activé sur une base locale, cela peut bloquer les données.');
            console.log('Pour désactiver : ALTER TABLE <table_name> DISABLE ROW LEVEL SECURITY;');
        }

    } catch (error) {
        console.error('❌ Erreur :', error.message);
    } finally {
        process.exit(0);
    }
}

checkRLS();
