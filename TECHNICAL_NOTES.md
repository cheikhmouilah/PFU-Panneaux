# Notes Techniques - GeoSignal

## 🗄️ Architecture de la Base de Données

### Extensions PostgreSQL Activées

- **PostGIS** : Gestion des données spatiales (géométries, coordonnées GPS)
- **pgcrypto** : Fonctions cryptographiques
- **uuid-ossp** : Génération d'UUID

### Schéma Spatial

Les panneaux utilisent le type `geometry(POINT, 4326)` :
- **POINT** : Type de géométrie pour représenter un point
- **4326** : Code EPSG pour WGS 84 (système de coordonnées GPS standard)

Format de stockage :
```sql
location geometry(POINT, 4326)
```

Exemple de requête spatiale :
```sql
-- Trouver tous les panneaux dans un rayon de 1km
SELECT * FROM panels
WHERE ST_DWithin(
  location::geography,
  ST_SetSRID(ST_MakePoint(-1.14099, 35.28954), 4326)::geography,
  1000
);
```

### Index Spatiaux

Index GIST créé sur la colonne location pour des performances optimales :
```sql
CREATE INDEX panels_location_idx ON panels USING GIST(location);
```

## 🔐 Sécurité Row Level Security (RLS)

### Politiques Implémentées

#### Profiles
- SELECT : Tous les utilisateurs authentifiés
- UPDATE : Utilisateur peut modifier son propre profil
- INSERT : Admins uniquement

#### Panels
- SELECT : Tous les utilisateurs authentifiés
- INSERT/UPDATE : Admins et Responsables
- DELETE : Admins uniquement

#### Interventions
- SELECT : Tous les utilisateurs authentifiés
- INSERT : Admins et Responsables
- UPDATE : Admins, Responsables et Technicien assigné
- DELETE : Admins uniquement

#### Panel Commands
- SELECT : Tous les utilisateurs authentifiés
- INSERT/UPDATE : Admins et Responsables

### Vérification des Rôles dans RLS

Les politiques utilisent des jointures pour vérifier les rôles :
```sql
EXISTS (
  SELECT 1 FROM profiles
  WHERE id = auth.uid() AND role IN ('admin', 'responsable')
)
```

## 🔄 Triggers et Fonctions

### Trigger updated_at

Fonction automatique pour mettre à jour `updated_at` :
```sql
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

Appliqué sur :
- profiles
- panels
- technicians
- interventions

## 📡 Temps Réel avec Supabase

### Configuration Realtime

Le composant RemoteControl utilise Supabase Realtime pour les mises à jour en temps réel :

```typescript
const subscription = supabase
  .channel('panel_commands')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'panel_commands'
  }, () => {
    loadCommands();
  })
  .subscribe();
```

## 🗺️ OpenLayers - Carte Interactive

### Configuration de Base

```typescript
const map = new Map({
  target: mapRef.current,
  layers: [
    new TileLayer({
      source: new OSM(), // OpenStreetMap
    }),
  ],
  view: new View({
    center: fromLonLat([0.6400233, 35.28954]), // Aïn Témouchent
    zoom: 13,
  }),
});
```

### Conversion de Coordonnées

OpenLayers utilise la projection Web Mercator (EPSG:3857) :
```typescript
fromLonLat([longitude, latitude])
```

### Styles de Panneaux

```typescript
new Style({
  image: new Circle({
    radius: 8,
    fill: new Fill({ color: '#10b981' }),
    stroke: new Stroke({ color: '#ffffff', width: 2 }),
  }),
  text: new Text({
    text: panel.code,
    offsetY: -15,
  }),
});
```

## 🎨 Design System

### Palette de Couleurs

- **Primaire** : Bleu (#2563eb)
- **Succès** : Vert (#10b981)
- **Attention** : Orange (#f59e0b)
- **Danger** : Rouge (#ef4444)
- **Neutre** : Gris (#6b7280)

### Classes Tailwind Personnalisées

Utilisation extensive de :
- Grilles responsive : `grid-cols-1 md:grid-cols-2 lg:grid-cols-4`
- Espacements cohérents : système 8px
- Transitions fluides : `transition-colors`
- Ombres adaptées : `shadow-sm`, `shadow-lg`

## 📊 Performance

### Optimisations Appliquées

1. **Index de base de données**
   - Index spatial GIST sur location
   - Index sur les colonnes fréquemment filtrées

2. **Chargement de données**
   - Utilisation de `.maybeSingle()` au lieu de `.single()`
   - Requêtes avec `count: 'exact', head: true` pour les comptages

3. **Composants React**
   - useState et useEffect appropriés
   - Pas de re-renders inutiles
   - Chargement des données au montage

### Taille du Bundle

Build de production :
- CSS : ~24 KB (gzippé ~5 KB)
- JS : ~630 KB (gzippé ~180 KB)
- Total : ~185 KB gzippé

## 🔧 Variables d'Environnement

### Configuration Supabase

Fichier `.env` :
```env
VITE_SUPABASE_URL=https://icosmmaysmevbenbtzct.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Variables Disponibles

Ces variables sont automatiquement injectées par Supabase :
- SUPABASE_URL
- SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY (backend uniquement)
- SUPABASE_DB_URL

## 🚀 Déploiement

### Build Production

```bash
npm run build
```

Génère le dossier `dist/` contenant :
- index.html
- assets/index-*.css
- assets/index-*.js

### Hébergement Recommandé

- **Vercel** : Déploiement automatique depuis Git
- **Netlify** : Configuration zero
- **Supabase Hosting** : Intégration native

### Configuration Vercel

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite"
}
```

## 🧪 Tests

### Tests Recommandés

1. **Tests Unitaires** : Jest + React Testing Library
2. **Tests d'Intégration** : Playwright
3. **Tests E2E** : Cypress

### Points Critiques à Tester

- Authentification (login, signup, logout)
- CRUD des panneaux
- Création d'interventions
- Envoi de commandes
- Filtres et recherche
- Affichage de la carte

## 📈 Monitoring et Logs

### Supabase Dashboard

Accès aux métriques :
- Requêtes par seconde
- Utilisation du stockage
- Connexions actives
- Logs temps réel

### Console Logs

L'application log :
- Erreurs de chargement de données
- Erreurs d'authentification
- Erreurs de sauvegarde

## 🔒 Sécurité

### Bonnes Pratiques Implémentées

1. **RLS activé** sur toutes les tables
2. **Validation côté serveur** via RLS
3. **Pas de secrets** dans le code frontend
4. **HTTPS** obligatoire (Supabase)
5. **JWT** pour l'authentification

### À Ajouter (Production)

- Rate limiting sur les endpoints
- Validation des données en profondeur
- Logs d'audit
- CAPTCHA sur l'inscription
- Rotation des secrets
- Monitoring de sécurité

## 🌐 Internationalisation

### Textes Actuels

- Interface en français
- Formatage des dates : `toLocaleDateString('fr-FR')`

### Extension i18n

Pour ajouter d'autres langues :
1. Installer `react-i18next`
2. Créer fichiers de traduction
3. Wrapper l'app avec `I18nextProvider`

## 📱 Progressive Web App (PWA)

### Extension Possible

1. Ajouter `vite-plugin-pwa`
2. Créer manifest.json
3. Ajouter service worker
4. Implémenter offline mode

## 🔄 CI/CD

### GitHub Actions Exemple

```yaml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm ci
      - run: npm run build
      - run: npm run deploy
```

## 📊 Métriques Recommandées

### KPIs à Suivre

1. Taux de disponibilité moyen
2. MTTR (Mean Time To Repair)
3. Nombre de pannes par mois
4. Temps de réponse des interventions
5. Utilisation par rôle

## 🎯 Roadmap Technique

### Phase 2

- [ ] Export PDF des rapports
- [ ] Graphiques avec Chart.js
- [ ] Application mobile React Native
- [ ] API REST publique
- [ ] Webhooks pour intégrations

### Phase 3

- [ ] ML pour prédiction des pannes
- [ ] Intégration capteurs IoT
- [ ] Alertes automatiques
- [ ] Planification optimisée des routes
- [ ] Reconnaissance d'image (détection panneaux)

## 🔧 Dépannage

### Problèmes Courants

**Carte ne s'affiche pas :**
- Vérifier les imports OpenLayers
- Vérifier ol.css est importé
- Console pour erreurs JS

**RLS bloque les requêtes :**
- Vérifier l'utilisateur est authentifié
- Vérifier le rôle dans profiles
- Vérifier les politiques RLS

**Build échoue :**
- Nettoyer node_modules
- Vérifier les versions
- Lancer `npm run typecheck`

---

**Développé avec ❤️ pour Aïn Témouchent**
