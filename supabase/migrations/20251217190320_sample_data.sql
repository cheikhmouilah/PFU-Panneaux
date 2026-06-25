/*
  # Données d'exemple pour la plateforme GeoSignal
  
  1. Données insérées
     - Panneaux de signalisation à Aïn Témouchent
       - 15 panneaux variés (intelligents et standards)
       - Répartis dans différentes zones de la ville
       - États variés (fonctionnel, en maintenance, hors service)
     
  2. Notes importantes
     - Les panneaux sont positionnés autour de Aïn Témouchent
     - Coordonnées GPS réelles de la région
     - Diversité des types et catégories
*/

-- Insert sample panels for Aïn Témouchent
INSERT INTO panels (code, category, location, address, status, is_intelligent, installation_date) VALUES
  ('A1', 'A', ST_SetSRID(ST_MakePoint(-1.14099, 35.28954), 4326), 'Avenue de la République', 'fonctionnel', true, '2023-01-15'),
  ('A14', 'A', ST_SetSRID(ST_MakePoint(-0.6380445, 35.1892341), 4326), 'Boulevard Mohamed V', 'fonctionnel', true, '2023-02-20'),
  ('B1', 'B', ST_SetSRID(ST_MakePoint(-0.6420156, 35.1858123), 4326), 'Rue Larbi Ben M''hidi', 'en_maintenance', false, '2023-03-10'),
  ('B7', 'B', ST_SetSRID(ST_MakePoint(-0.6395678, 35.1905467), 4326), 'Avenue Colonel Lotfi', 'fonctionnel', true, '2023-04-05'),
  ('C1', 'C', ST_SetSRID(ST_MakePoint(-0.6445890, 35.1843256), 4326), 'Rue Emir Abdelkader', 'fonctionnel', false, '2023-05-12'),
  ('C13', 'C', ST_SetSRID(ST_MakePoint(-0.6360234, 35.1920789), 4326), 'Boulevard du 1er Novembre', 'hors_service', false, '2023-06-18'),
  ('D1', 'D', ST_SetSRID(ST_MakePoint(-0.6405123, 35.1868945), 4326), 'Avenue Ibn Khaldoun', 'fonctionnel', true, '2023-07-22'),
  ('A30', 'A', ST_SetSRID(ST_MakePoint(-0.6425567, 35.1895632), 4326), 'Rue Commandant Ferradj', 'fonctionnel', false, '2023-08-14'),
  ('B14', 'B', ST_SetSRID(ST_MakePoint(-0.6385234, 35.1850123), 4326), 'Avenue de la Liberté', 'en_maintenance', true, '2023-09-08'),
  ('C15', 'C', ST_SetSRID(ST_MakePoint(-0.6410789, 35.1910456), 4326), 'Boulevard Bentoumi Ali', 'fonctionnel', true, '2023-10-03'),
  ('D3', 'D', ST_SetSRID(ST_MakePoint(-0.6390456, 35.1883567), 4326), 'Rue Ali Benbarka', 'fonctionnel', false, '2023-11-20'),
  ('A3', 'A', ST_SetSRID(ST_MakePoint(-0.6435123, 35.1862345), 4326), 'Avenue Boumediene', 'fonctionnel', true, '2023-12-05'),
  ('B2', 'B', ST_SetSRID(ST_MakePoint(-0.6370890, 35.1898234), 4326), 'Rue Didouche Mourad', 'hors_service', false, '2024-01-10'),
  ('C18', 'C', ST_SetSRID(ST_MakePoint(-0.6415234, 35.1878901), 4326), 'Boulevard Zabana', 'fonctionnel', true, '2024-02-14'),
  ('D5', 'D', ST_SetSRID(ST_MakePoint(-0.6395123, 35.1855678), 4326), 'Avenue Thaalbi', 'en_maintenance', false, '2024-03-01')
ON CONFLICT DO NOTHING;
