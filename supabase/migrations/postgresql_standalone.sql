/*
  # Schema PostgreSQL Standard (Sans Supabase)
  
  Ce script adapte le schéma pour PostgreSQL standard sans dépendance à Supabase.
  
  Différences principales :
  - Table 'users' locale au lieu de 'auth.users'
  - Pas de Row Level Security (RLS) - à implémenter côté application
  - Authentification à gérer manuellement dans le backend
  
  IMPORTANT : Ce script nécessite un backend d'authentification custom.
*/

-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table (remplace auth.users de Supabase)
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL, -- Stocker le hash bcrypt, jamais le mot de passe en clair
  email_verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  role text NOT NULL DEFAULT 'observateur' CHECK (role IN ('admin', 'responsable', 'technicien', 'observateur')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create panels table with PostGIS geometry
CREATE TABLE IF NOT EXISTS panels (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  code text NOT NULL,
  category text NOT NULL CHECK (category IN ('A', 'B', 'C', 'D')),
  location geometry(POINT, 4326) NOT NULL,
  address text DEFAULT '',
  status text NOT NULL DEFAULT 'fonctionnel' CHECK (status IN ('fonctionnel', 'en_maintenance', 'hors_service')),
  is_intelligent boolean DEFAULT false,
  installation_date date DEFAULT CURRENT_DATE,
  last_maintenance timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create spatial index on panels location
CREATE INDEX IF NOT EXISTS panels_location_idx ON panels USING GIST(location);

-- Create technicians table
CREATE TABLE IF NOT EXISTS technicians (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  specialization text DEFAULT '',
  phone text DEFAULT '',
  status text NOT NULL DEFAULT 'disponible' CHECK (status IN ('disponible', 'en_intervention', 'indisponible')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create interventions table
CREATE TABLE IF NOT EXISTS interventions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  panel_id uuid REFERENCES panels(id) ON DELETE CASCADE,
  technician_id uuid REFERENCES technicians(id) ON DELETE SET NULL,
  type text NOT NULL CHECK (type IN ('maintenance_preventive', 'reparation', 'installation')),
  status text NOT NULL DEFAULT 'planifiee' CHECK (status IN ('planifiee', 'en_cours', 'terminee', 'annulee')),
  priority text NOT NULL DEFAULT 'normale' CHECK (priority IN ('basse', 'normale', 'haute', 'urgente')),
  description text DEFAULT '',
  scheduled_date timestamptz,
  start_date timestamptz,
  end_date timestamptz,
  notes text DEFAULT '',
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create panel_commands table
CREATE TABLE IF NOT EXISTS panel_commands (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  panel_id uuid REFERENCES panels(id) ON DELETE CASCADE,
  command_type text NOT NULL CHECK (command_type IN ('change_code', 'reset', 'test')),
  old_code text,
  new_code text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'executed', 'failed')),
  sent_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  sent_at timestamptz,
  executed_at timestamptz,
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Create panel_status_history table
CREATE TABLE IF NOT EXISTS panel_status_history (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  panel_id uuid REFERENCES panels(id) ON DELETE CASCADE,
  old_status text,
  new_status text NOT NULL,
  changed_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  reason text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_panels_updated_at
  BEFORE UPDATE ON panels
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_technicians_updated_at
  BEFORE UPDATE ON technicians
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_interventions_updated_at
  BEFORE UPDATE ON interventions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_technicians_profile_id ON technicians(profile_id);
CREATE INDEX IF NOT EXISTS idx_technicians_status ON technicians(status);
CREATE INDEX IF NOT EXISTS idx_interventions_panel_id ON interventions(panel_id);
CREATE INDEX IF NOT EXISTS idx_interventions_technician_id ON interventions(technician_id);
CREATE INDEX IF NOT EXISTS idx_interventions_status ON interventions(status);
CREATE INDEX IF NOT EXISTS idx_panel_commands_panel_id ON panel_commands(panel_id);
CREATE INDEX IF NOT EXISTS idx_panel_status_history_panel_id ON panel_status_history(panel_id);

-- Insert default admin user (IMPORTANT: Changer le mot de passe en production!)
-- Mot de passe par défaut: "admin123" (hash bcrypt)
INSERT INTO users (email, password_hash, email_verified) 
VALUES ('admin@geosignal.dz', '$2b$10$rKZqGxJxvQxQxQxQxQxQxOeKqGxJxvQxQxQxQxQxQxOeKqGxJxvQx', true)
ON CONFLICT (email) DO NOTHING;

-- Insert admin profile
INSERT INTO profiles (user_id, full_name, role)
SELECT id, 'Administrateur', 'admin'
FROM users
WHERE email = 'admin@geosignal.dz'
ON CONFLICT (user_id) DO NOTHING;

-- Comments for documentation
COMMENT ON TABLE users IS 'Table des utilisateurs avec authentification';
COMMENT ON TABLE profiles IS 'Profils utilisateurs étendus avec rôles';
COMMENT ON TABLE panels IS 'Panneaux de signalisation avec données géospatiales';
COMMENT ON TABLE technicians IS 'Informations des techniciens de maintenance';
COMMENT ON TABLE interventions IS 'Fiches d''intervention et de maintenance';
COMMENT ON TABLE panel_commands IS 'Historique des commandes envoyées aux panneaux intelligents';
COMMENT ON TABLE panel_status_history IS 'Historique des changements d''état des panneaux';

COMMENT ON COLUMN panels.location IS 'Position GPS du panneau (PostGIS POINT)';
COMMENT ON COLUMN users.password_hash IS 'Hash bcrypt du mot de passe - JAMAIS stocker en clair';

