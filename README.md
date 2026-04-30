# GeoSignal - Plateforme SIG de Gestion des Panneaux de Signalisation

Plateforme intelligente de gestion, contrôle et maintenance des panneaux de signalisation pour la ville de Sidi Bel Abbès, Algérie.

## 🎯 Objectifs

- Localiser et visualiser les panneaux de signalisation sur une carte interactive
- Contrôler des panneaux intelligents à distance
- Suivre les opérations de maintenance en temps réel
- Fournir des tableaux de bord décisionnels pour les responsables

## 🏗️ Architecture Technique

### Frontend
- **React 18** avec TypeScript
- **Vite** pour le développement et le build
- **Tailwind CSS** pour le styling
- **OpenLayers** pour la cartographie SIG interactive
- **Lucide React** pour les icônes

### Backend & Base de données
- **Supabase** (PostgreSQL + PostGIS)
- **PostGIS** pour les données spatiales
- Extension PostGIS activée pour la gestion des coordonnées GPS
- **Supabase Realtime** pour les mises à jour en temps réel

### Sécurité
- Authentification par email/mot de passe (Supabase Auth)
- Row Level Security (RLS) activé sur toutes les tables
- Contrôle d'accès basé sur les rôles (RBAC)

## 👥 Rôles Utilisateurs

1. **Admin** : Accès complet à toutes les fonctionnalités
2. **Responsable** : Gestion des panneaux et interventions
3. **Technicien** : Accès aux interventions assignées
4. **Observateur** : Lecture seule

## 📦 Structure de la Base de Données

### Tables principales

- **profiles** : Profils utilisateurs étendus
- **panels** : Panneaux de signalisation avec géométrie PostGIS
- **technicians** : Informations des techniciens
- **interventions** : Fiches d'intervention et maintenance
- **panel_commands** : Historique des commandes envoyées aux panneaux
- **panel_status_history** : Historique des changements d'état

## 🚀 Démarrage

### Prérequis

- Node.js 18+ et npm
- Compte Supabase (déjà configuré)

### Installation

```bash
# Installer les dépendances
npm install

# Lancer en mode développement
npm run dev

# Build pour la production
npm run build
```

## 🗺️ Fonctionnalités Principales

### 1. Tableau de Bord
- Vue d'ensemble des statistiques (KPI)
- Nombre total de panneaux
- Taux de disponibilité
- Interventions en cours
- Techniciens disponibles

### 2. Carte SIG Interactive
- Visualisation des panneaux sur une carte OpenStreetMap
- Symbolisation par état (fonctionnel, en maintenance, hors service)
- Filtrage par type et catégorie
- Informations détaillées au clic
- Légende interactive

### 3. Gestion des Panneaux
- Inventaire complet
- Ajout/modification/suppression (selon rôle)
- Types de panneaux : A (Danger), B (Priorité), C (Prescription), D (Indication)
- Panneaux intelligents et standards
- Position GPS avec PostGIS
- Recherche et filtrage

### 4. Suivi de la Maintenance
- Création de fiches d'intervention
- Affectation aux techniciens
- Suivi des statuts (planifiée, en cours, terminée, annulée)
- Priorités (basse, normale, haute, urgente)
- Types : maintenance préventive, réparation, installation
- Historique complet

### 5. Contrôle à Distance
- Envoi de commandes aux panneaux intelligents
- Changement de code de panneau à distance
- Historique des commandes
- Statuts en temps réel (envoyée, exécutée, échec)
- Liste des panneaux intelligents actifs

## 🔐 Authentification

### Inscription
1. Accéder à la page d'accueil
2. Cliquer sur "Pas de compte ? S'inscrire"
3. Remplir le formulaire
4. Le compte est créé avec le rôle "observateur" par défaut

### Connexion
1. Entrer email et mot de passe
2. Accès aux fonctionnalités selon le rôle

### Gestion des rôles
Les admins peuvent modifier les rôles directement dans la base de données Supabase.

## 📊 Technologies Utilisées

- React 18
- TypeScript
- Vite
- Tailwind CSS
- OpenLayers
- Supabase (PostgreSQL + PostGIS)
- Lucide React

## 🌍 Données Géographiques

- Centre : Sidi Bel Abbès (35.1875246°N, -0.6400233°E)
- Projection : EPSG:4326 (WGS 84)
- 15 panneaux d'exemple répartis dans la ville

## 🎨 Interface

- Design moderne et professionnel
- Responsive (mobile, tablette, desktop)
- Navigation intuitive
- Couleurs adaptées au contexte algérien
- Feedback visuel en temps réel

## 🔄 Temps Réel

- Supabase Realtime pour les mises à jour automatiques
- Actualisation instantanée des commandes
- Synchronisation multi-utilisateurs

## 📈 Évolutions Futures Possibles

- Intégration avec des capteurs IoT physiques
- Alertes automatiques en cas de panne
- Rapports PDF exportables
- Intégration GPS pour les techniciens sur terrain
- Application mobile dédiée
- Analyses prédictives avec IA
- API publique pour intégration Smart City

## 🛠️ Développement

### Structure du projet

```
src/
├── components/          # Composants React
│   ├── Auth.tsx        # Authentification
│   ├── Layout.tsx      # Layout principal
│   ├── Dashboard.tsx   # Tableau de bord
│   ├── MapView.tsx     # Carte SIG
│   ├── PanelManagement.tsx    # Gestion panneaux
│   ├── InterventionManagement.tsx  # Maintenance
│   └── RemoteControl.tsx      # Contrôle distance
├── contexts/           # Contextes React
│   └── AuthContext.tsx # Context d'authentification
├── lib/               # Librairies
│   └── supabase.ts    # Client Supabase
├── types/             # Types TypeScript
│   └── database.ts    # Types de la BD
├── App.tsx            # Composant principal
└── main.tsx          # Point d'entrée
```

## 📝 License

Projet académique - Ville de Sidi Bel Abbès

## 🤝 Contribution

Ce projet est destiné à une expérimentation pilote et peut être étendu pour d'autres villes ou dans le cadre d'une initiative Smart City.
