/*
  # Schema Initial - Plateforme SIG de Gestion des Panneaux de Signalisation
  
  1. Extensions
     - Enable PostGIS for spatial data support
  
  2. New Tables
     - `profiles`
       - `id` (uuid, references auth.users)
       - `full_name` (text)
       - `role` (text) - admin, responsable, technicien, observateur
       - `created_at` (timestamptz)
       - `updated_at` (timestamptz)
     
     - `panels` (panneaux de signalisation)
       - `id` (uuid, primary key)
       - `code` (text) - Type de panneau (A1, B1, C1, etc.)
       - `category` (text) - Catégorie (A, B, C, D)
       - `location` (geometry POINT) - Position GPS avec PostGIS
       - `address` (text) - Adresse descriptive
       - `status` (text) - fonctionnel, en_maintenance, hors_service
       - `is_intelligent` (boolean) - Panneau intelligent ou non
       - `installation_date` (date)
       - `last_maintenance` (timestamptz)
       - `created_at` (timestamptz)
       - `updated_at` (timestamptz)
     
     - `technicians`
       - `id` (uuid, primary key)
       - `profile_id` (uuid, references profiles)
       - `specialization` (text)
       - `phone` (text)
       - `status` (text) - disponible, en_intervention, indisponible
       - `created_at` (timestamptz)
       - `updated_at` (timestamptz)
     
     - `interventions`
       - `id` (uuid, primary key)
       - `panel_id` (uuid, references panels)
       - `technician_id` (uuid, references technicians)
       - `type` (text) - maintenance_preventive, reparation, installation
       - `status` (text) - planifiee, en_cours, terminee, annulee
       - `priority` (text) - basse, normale, haute, urgente
       - `description` (text)
       - `scheduled_date` (timestamptz)
       - `start_date` (timestamptz)
       - `end_date` (timestamptz)
       - `notes` (text)
       - `created_by` (uuid, references profiles)
       - `created_at` (timestamptz)
       - `updated_at` (timestamptz)
     
     - `panel_commands` (commandes envoyées aux panneaux intelligents)
       - `id` (uuid, primary key)
       - `panel_id` (uuid, references panels)
       - `command_type` (text) - change_code, reset, test
       - `old_code` (text)
       - `new_code` (text)
       - `status` (text) - pending, sent, executed, failed
       - `sent_by` (uuid, references profiles)
       - `sent_at` (timestamptz)
       - `executed_at` (timestamptz)
       - `notes` (text)
       - `created_at` (timestamptz)
     
     - `panel_status_history` (historique des changements d'état)
       - `id` (uuid, primary key)
       - `panel_id` (uuid, references panels)
       - `old_status` (text)
       - `new_status` (text)
       - `changed_by` (uuid, references profiles)
       - `reason` (text)
       - `created_at` (timestamptz)
  
  3. Security
     - Enable RLS on all tables
     - Add policies for role-based access control
*/

-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  role text NOT NULL DEFAULT 'observateur' CHECK (role IN ('admin', 'responsable', 'technicien', 'observateur')),
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

-- Create spatial index on panels location
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

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE panels ENABLE ROW LEVEL SECURITY;
ALTER TABLE technicians ENABLE ROW LEVEL SECURITY;
ALTER TABLE interventions ENABLE ROW LEVEL SECURITY;
ALTER TABLE panel_commands ENABLE ROW LEVEL SECURITY;
ALTER TABLE panel_status_history ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can insert profiles"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Panels policies
CREATE POLICY "Authenticated users can view panels"
  ON panels FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins and responsables can insert panels"
  ON panels FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'responsable')
    )
  );

CREATE POLICY "Admins and responsables can update panels"
  ON panels FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'responsable')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'responsable')
    )
  );

CREATE POLICY "Admins can delete panels"
  ON panels FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Technicians policies
CREATE POLICY "Authenticated users can view technicians"
  ON technicians FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage technicians"
  ON technicians FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Interventions policies
CREATE POLICY "Authenticated users can view interventions"
  ON interventions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins and responsables can insert interventions"
  ON interventions FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'responsable')
    )
  );

CREATE POLICY "Admins, responsables and assigned technicians can update interventions"
  ON interventions FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      LEFT JOIN technicians t ON t.profile_id = p.id
      WHERE p.id = auth.uid() 
      AND (p.role IN ('admin', 'responsable') OR t.id = interventions.technician_id)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p
      LEFT JOIN technicians t ON t.profile_id = p.id
      WHERE p.id = auth.uid() 
      AND (p.role IN ('admin', 'responsable') OR t.id = interventions.technician_id)
    )
  );

-- Panel commands policies
CREATE POLICY "Authenticated users can view commands"
  ON panel_commands FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins and responsables can send commands"
  ON panel_commands FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'responsable')
    )
  );

CREATE POLICY "Admins and responsables can update commands"
  ON panel_commands FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'responsable')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'responsable')
    )
  );

-- Panel status history policies
CREATE POLICY "Authenticated users can view status history"
  ON panel_status_history FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "System can insert status history"
  ON panel_status_history FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
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
