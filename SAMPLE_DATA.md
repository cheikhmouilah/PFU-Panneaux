# Données d'Exemple - GeoSignal

## 📍 Panneaux Pré-installés

La base de données contient **15 panneaux** répartis dans Sidi Bel Abbès :

### Panneaux de Type A (Danger)

| Code | Adresse | État | Type |
|------|---------|------|------|
| A1 | Avenue de la République | Fonctionnel | Intelligent |
| A14 | Boulevard Mohamed V | Fonctionnel | Intelligent |
| A30 | Rue Commandant Ferradj | Fonctionnel | Standard |
| A3 | Avenue Boumediene | Fonctionnel | Intelligent |

### Panneaux de Type B (Priorité)

| Code | Adresse | État | Type |
|------|---------|------|------|
| B1 | Rue Larbi Ben M'hidi | En maintenance | Standard |
| B7 | Avenue Colonel Lotfi | Fonctionnel | Intelligent |
| B14 | Avenue de la Liberté | En maintenance | Intelligent |
| B2 | Rue Didouche Mourad | Hors service | Standard |

### Panneaux de Type C (Prescription)

| Code | Adresse | État | Type |
|------|---------|------|------|
| C1 | Rue Emir Abdelkader | Fonctionnel | Standard |
| C13 | Boulevard du 1er Novembre | Hors service | Standard |
| C15 | Boulevard Bentoumi Ali | Fonctionnel | Intelligent |
| C18 | Boulevard Zabana | Fonctionnel | Intelligent |

### Panneaux de Type D (Indication)

| Code | Adresse | État | Type |
|------|---------|------|------|
| D1 | Avenue Ibn Khaldoun | Fonctionnel | Intelligent |
| D3 | Rue Ali Benbarka | Fonctionnel | Standard |
| D5 | Avenue Thaalbi | En maintenance | Standard |

## 📊 Statistiques des Données d'Exemple

- **Total panneaux** : 15
- **Panneaux intelligents** : 8 (53%)
- **Panneaux standards** : 7 (47%)
- **État fonctionnel** : 10 (67%)
- **En maintenance** : 3 (20%)
- **Hors service** : 2 (13%)

## 🗺️ Répartition Géographique

Les panneaux sont répartis dans un rayon de ~2km autour du centre-ville :

- **Centre** : 35.1875246°N, -0.6400233°E
- **Zone couverte** : ~12 km²
- **Densité** : 1.25 panneaux/km²

## 📝 Ajouter des Données Manuellement

### Via l'Interface Web

1. Connectez-vous avec un compte Admin/Responsable
2. Allez dans "Gestion des panneaux"
3. Cliquez sur "Ajouter un panneau"
4. Remplissez le formulaire :
   - Code (ex: A15, B20)
   - Catégorie (A, B, C, D)
   - Latitude et Longitude
   - Adresse
   - État
   - Type (intelligent ou non)
   - Date d'installation

### Via SQL (Supabase Dashboard)

```sql
-- Ajouter un nouveau panneau
INSERT INTO panels (code, category, location, address, status, is_intelligent, installation_date)
VALUES (
  'A20',
  'A',
  ST_SetSRID(ST_MakePoint(-0.6410000, 35.1880000), 4326),
  'Nouvelle adresse',
  'fonctionnel',
  true,
  '2024-04-01'
);
```

### Ajouter un Technicien

1. **Créer d'abord un profil utilisateur** avec le rôle "technicien"
2. **Ensuite ajouter l'entrée technicien** :

```sql
-- Via SQL
INSERT INTO technicians (profile_id, specialization, phone, status)
VALUES (
  'uuid-du-profil',
  'Électricien',
  '+213 555 123 456',
  'disponible'
);
```

### Créer une Intervention

Via l'interface web :
1. Allez dans "Maintenance"
2. Cliquez sur "Nouvelle intervention"
3. Sélectionnez le panneau et le technicien
4. Définissez le type, la priorité et la date

## 🌍 Coordonnées GPS de Référence

### Points d'Intérêt à Sidi Bel Abbès

```javascript
const landmarks = {
  centreVille: { lat: 35.1875246, lng: -0.6400233 },
  gare: { lat: 35.1950123, lng: -0.6350456 },
  universite: { lat: 35.1800567, lng: -0.6480234 },
  hopital: { lat: 35.1920789, lng: -0.6420345 },
  stade: { lat: 35.1840123, lng: -0.6380567 },
};
```

### Générer des Coordonnées Aléatoires

```javascript
// JavaScript pour générer des panneaux aléatoires
function generateRandomPanel() {
  const centerLat = 35.1875246;
  const centerLng = -0.6400233;
  const radius = 0.02; // ~2km

  const lat = centerLat + (Math.random() - 0.5) * radius;
  const lng = centerLng + (Math.random() - 0.5) * radius;

  const categories = ['A', 'B', 'C', 'D'];
  const category = categories[Math.floor(Math.random() * categories.length)];

  const codeNum = Math.floor(Math.random() * 30) + 1;
  const code = `${category}${codeNum}`;

  return {
    code,
    category,
    lat,
    lng
  };
}
```

## 📈 Données de Test Complètes

### Script SQL pour Plus de Données

```sql
-- Ajouter 10 panneaux supplémentaires
INSERT INTO panels (code, category, location, address, status, is_intelligent, installation_date)
VALUES
  ('A5', 'A', ST_SetSRID(ST_MakePoint(-0.6355, 35.1910), 4326), 'Rue des Martyrs', 'fonctionnel', true, '2024-01-15'),
  ('B10', 'B', ST_SetSRID(ST_MakePoint(-0.6440, 35.1850), 4326), 'Avenue de l''Indépendance', 'fonctionnel', false, '2024-02-01'),
  ('C20', 'C', ST_SetSRID(ST_MakePoint(-0.6375, 35.1895), 4326), 'Boulevard de la Victoire', 'en_maintenance', true, '2024-02-15'),
  ('D10', 'D', ST_SetSRID(ST_MakePoint(-0.6425, 35.1865), 4326), 'Rue de la Paix', 'fonctionnel', true, '2024-03-01'),
  ('A25', 'A', ST_SetSRID(ST_MakePoint(-0.6390, 35.1920), 4326), 'Avenue Souidani', 'hors_service', false, '2024-03-10'),
  ('B15', 'B', ST_SetSRID(ST_MakePoint(-0.6410, 35.1840), 4326), 'Rue Boukhari', 'fonctionnel', true, '2024-03-20'),
  ('C25', 'C', ST_SetSRID(ST_MakePoint(-0.6365, 35.1885), 4326), 'Boulevard Taleb Abderrahmane', 'fonctionnel', false, '2024-04-01'),
  ('D12', 'D', ST_SetSRID(ST_MakePoint(-0.6445, 35.1875), 4326), 'Avenue Pasteur', 'en_maintenance', false, '2024-04-10'),
  ('A35', 'A', ST_SetSRID(ST_MakePoint(-0.6380, 35.1905), 4326), 'Rue Khemisti', 'fonctionnel', true, '2024-04-20'),
  ('B20', 'B', ST_SetSRID(ST_MakePoint(-0.6420, 35.1855), 4326), 'Avenue Boudiaf', 'fonctionnel', true, '2024-05-01');
```

## 🎲 Scénarios de Test

### Scénario 1 : Ville Moyenne

- 50-100 panneaux
- 70% fonctionnels
- 5-10 techniciens
- 20-30 interventions

### Scénario 2 : Grande Ville

- 500+ panneaux
- 80% fonctionnels
- 30-50 techniciens
- 100+ interventions

### Scénario 3 : Zone Pilote

- 15-30 panneaux (actuel)
- Mix intelligent/standard
- 3-5 techniciens
- 10-15 interventions

## 🔄 Script de Génération de Données

### Python Script

```python
import random
from datetime import datetime, timedelta

def generate_panels(count=50):
    """Générer des panneaux de test"""
    center_lat = 35.1875246
    center_lng = -0.6400233
    categories = ['A', 'B', 'C', 'D']
    statuses = ['fonctionnel', 'en_maintenance', 'hors_service']

    panels = []
    for i in range(count):
        lat = center_lat + (random.random() - 0.5) * 0.04
        lng = center_lng + (random.random() - 0.5) * 0.04
        category = random.choice(categories)
        code = f"{category}{random.randint(1, 50)}"
        status = random.choices(statuses, weights=[70, 20, 10])[0]
        is_intelligent = random.random() > 0.5

        panels.append({
            'code': code,
            'category': category,
            'lat': lat,
            'lng': lng,
            'status': status,
            'is_intelligent': is_intelligent,
        })

    return panels

# Générer SQL
panels = generate_panels(50)
for p in panels:
    print(f"('{p['code']}', '{p['category']}', ST_SetSRID(ST_MakePoint({p['lng']}, {p['lat']}), 4326), '', '{p['status']}', {str(p['is_intelligent']).lower()}, CURRENT_DATE),")
```

## 📊 Import en Masse

### Via CSV (Supabase Dashboard)

1. Préparez un fichier CSV :
```csv
code,category,longitude,latitude,address,status,is_intelligent,installation_date
A40,A,-0.6355,35.1910,Rue Test,fonctionnel,true,2024-01-01
B30,B,-0.6440,35.1850,Avenue Test,fonctionnel,false,2024-01-02
```

2. Utilisez l'interface Supabase pour importer

**Note** : Pour la colonne `location`, vous devrez exécuter une mise à jour SQL après l'import :

```sql
UPDATE panels
SET location = ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)
WHERE location IS NULL;
```

## 🧪 Données de Développement

Pour le développement local, vous pouvez utiliser des données fictives :

```typescript
const mockPanels = [
  { code: 'TEST1', category: 'A', lat: 35.1875, lng: -0.6400, status: 'fonctionnel' },
  { code: 'TEST2', category: 'B', lat: 35.1880, lng: -0.6405, status: 'en_maintenance' },
  // ...
];
```

## 🗑️ Nettoyer les Données

### Supprimer Toutes les Données de Test

```sql
-- ⚠️ ATTENTION : Supprime TOUTES les données

-- Supprimer les interventions
DELETE FROM interventions;

-- Supprimer les commandes
DELETE FROM panel_commands;

-- Supprimer l'historique
DELETE FROM panel_status_history;

-- Supprimer les techniciens
DELETE FROM technicians;

-- Supprimer les panneaux
DELETE FROM panels;
```

### Réinitialiser avec les Données d'Exemple

Après avoir nettoyé, réexécutez la migration `sample_data`.

---

**Bon test avec GeoSignal !** 🚦
