CREATE SCHEMA IF NOT EXISTS geosignal;
SET search_path TO geosignal, public;

CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  role text NOT NULL DEFAULT 'observateur' CHECK (role IN ('admin', 'responsable', 'technicien', 'observateur')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  email_verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create panels table with PostGIS geometry
CREATE TABLE IF NOT EXISTS panels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
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

CREATE INDEX IF NOT EXISTS panels_location_idx ON panels USING GIST(location);

-- Create technicians table
CREATE TABLE IF NOT EXISTS technicians (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  specialization text DEFAULT '',
  phone text DEFAULT '',
  status text NOT NULL DEFAULT 'disponible' CHECK (status IN ('disponible', 'en_intervention', 'indisponible')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create interventions table
CREATE TABLE IF NOT EXISTS interventions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
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
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
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
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  panel_id uuid REFERENCES panels(id) ON DELETE CASCADE,
  old_status text,
  new_status text NOT NULL,
  changed_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  reason text DEFAULT '',
  created_at timestamptz DEFAULT now()
);
