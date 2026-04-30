import { pool } from '../db.js';

async function setupDatabase() {
    const client = await pool.connect();
    try {
        console.log('--- Initialisation de la base de données ---');

        // Enable PostGIS and uuid-ossp
        await client.query('CREATE EXTENSION IF NOT EXISTS postgis;');
        await client.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');
        await client.query('CREATE EXTENSION IF NOT EXISTS pgcrypto;');

        console.log('Extensions vérifiées.');

        // Create Profiles table
        await client.query(`
      CREATE TABLE IF NOT EXISTS profiles (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        full_name TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'observateur' CHECK (role IN ('admin', 'responsable', 'technicien', 'observateur')),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
        console.log('Table "profiles" créée ou vérifiée.');

        // Create Users table
        await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
        console.log('Table "users" créée ou vérifiée.');

        // Create Panels table
        await client.query(`
      CREATE TABLE IF NOT EXISTS panels (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        code TEXT UNIQUE NOT NULL,
        category TEXT NOT NULL CHECK (category IN ('A', 'B', 'C', 'D')),
        location GEOGRAPHY(Point, 4326) NOT NULL,
        address TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'fonctionnel' CHECK (status IN ('fonctionnel', 'en_maintenance', 'hors_service')),
        is_intelligent BOOLEAN DEFAULT FALSE,
        installation_date TIMESTAMPTZ DEFAULT NOW(),
        last_maintenance TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
        console.log('Table "panels" créée ou vérifiée.');

        // Create Technicians table
        await client.query(`
      CREATE TABLE IF NOT EXISTS technicians (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        profile_id UUID UNIQUE NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
        specialization TEXT NOT NULL,
        phone TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'disponible' CHECK (status IN ('disponible', 'en_intervention', 'indisponible')),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
        console.log('Table "technicians" créée ou vérifiée.');

        // Create Interventions table
        await client.query(`
      CREATE TABLE IF NOT EXISTS interventions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        panel_id UUID NOT NULL REFERENCES panels(id) ON DELETE CASCADE,
        technician_id UUID REFERENCES technicians(id) ON DELETE SET NULL,
        type TEXT NOT NULL CHECK (type IN ('maintenance_preventive', 'reparation', 'installation')),
        status TEXT NOT NULL DEFAULT 'planifiee' CHECK (status IN ('planifiee', 'en_cours', 'terminee', 'annulee')),
        priority TEXT NOT NULL DEFAULT 'normale' CHECK (priority IN ('basse', 'normale', 'haute', 'urgente')),
        description TEXT,
        scheduled_date TIMESTAMPTZ,
        start_date TIMESTAMPTZ,
        end_date TIMESTAMPTZ,
        notes TEXT,
        created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
        console.log('Table "interventions" créée ou vérifiée.');

        // Create Panel Commands table
        await client.query(`
      CREATE TABLE IF NOT EXISTS panel_commands (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        panel_id UUID NOT NULL REFERENCES panels(id) ON DELETE CASCADE,
        command_type TEXT NOT NULL CHECK (command_type IN ('change_code', 'reset', 'test')),
        old_code TEXT,
        new_code TEXT,
        status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'executed', 'failed')),
        sent_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
        sent_at TIMESTAMPTZ,
        executed_at TIMESTAMPTZ,
        notes TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
        console.log('Table "panel_commands" créée ou vérifiée.');

        console.log('\n✅ Base de données initialisée avec succès !');

    } catch (error) {
        console.error('❌ Erreur lors de l\'initialisation:', error);
    } finally {
        client.release();
        await pool.end();
    }
}

setupDatabase();
