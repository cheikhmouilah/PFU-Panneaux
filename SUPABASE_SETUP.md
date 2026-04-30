# Guide de Configuration Supabase

Ce guide vous accompagne pas à pas pour configurer Supabase pour le projet GeoSignal.

## 📋 Prérequis

- Un compte Google ou GitHub (pour créer un compte Supabase)
- Accès internet
- Le projet déjà cloné localement

## 🚀 Étape 1 : Créer un Compte Supabase

1. Allez sur [https://supabase.com](https://supabase.com)
2. Cliquez sur **"Start your project"** ou **"Sign in"**
3. Connectez-vous avec votre compte **Google** ou **GitHub**
4. Acceptez les conditions d'utilisation

## 🏗️ Étape 2 : Créer un Nouveau Projet

1. Une fois connecté, cliquez sur **"New Project"**
2. Remplissez les informations :
   - **Name** : `geosignal-panneaux` (ou un nom de votre choix)
   - **Database Password** : Créez un mot de passe fort et **NOTEZ-LE** (vous en aurez besoin)
   - **Region** : Choisissez `Europe (Frankfurt)` ou la région la plus proche
   - **Pricing Plan** : Sélectionnez **"Free"** (suffisant pour le développement)
3. Cliquez sur **"Create new project"**
4. ⏳ Attendez 1-2 minutes que le projet soit créé

## 🔑 Étape 3 : Récupérer les Clés d'API

1. Dans votre projet Supabase, allez dans **Settings** (⚙️ en bas à gauche)
2. Cliquez sur **API** dans le menu latéral
3. Vous verrez plusieurs informations importantes :

### Informations à copier :

- **Project URL** : `https://xxxxxxxxxxxxx.supabase.co`
- **anon public** (API Key) : Une longue clé commençant par `eyJ...`

> [!IMPORTANT]
> Gardez ces informations à portée de main, vous en aurez besoin à l'étape suivante.

## 📝 Étape 4 : Configurer les Variables d'Environnement

1. Ouvrez le fichier `.env` à la racine du projet
2. Remplacez les valeurs par celles de votre projet Supabase :

```env
VITE_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

3. **Sauvegardez** le fichier `.env`

> [!WARNING]
> Ne partagez JAMAIS votre fichier `.env` ou vos clés API publiquement (GitHub, etc.)

## 🗄️ Étape 5 : Exécuter les Migrations

### Via l'Interface Web Supabase (Méthode Recommandée) ✅

1. Dans votre projet Supabase, allez dans **SQL Editor** (icône `</>` dans le menu latéral)
2. Cliquez sur **"New query"**
3. Ouvrez le fichier `supabase/migrations/20251217185810_initial_schema_with_postgis.sql`
4. **Copiez tout le contenu** du fichier
5. **Collez-le** dans l'éditeur SQL de Supabase
6. Cliquez sur **"Run"** (ou appuyez sur `Ctrl+Enter`)
7. ✅ Vous devriez voir "Success. No rows returned"

8. Répétez l'opération pour le fichier de données d'exemple :
   - Ouvrez `supabase/migrations/20251217190320_sample_data.sql`
   - Copiez et collez dans une nouvelle requête
   - Cliquez sur **"Run"**

> [!TIP]
> Cette méthode est simple, rapide et ne nécessite aucune installation supplémentaire !

## ✅ Étape 6 : Vérifier l'Installation

1. Dans Supabase, allez dans **Table Editor** (icône tableau dans le menu)
2. Vous devriez voir les tables suivantes :
   - ✅ `profiles`
   - ✅ `panels`
   - ✅ `technicians`
   - ✅ `interventions`
   - ✅ `panel_commands`
   - ✅ `panel_status_history`

3. Cliquez sur la table `panels` - vous devriez voir 15 panneaux d'exemple

## 🧪 Étape 7 : Tester l'Application

1. Ouvrez un terminal dans le dossier du projet
2. Installez les dépendances (si pas déjà fait) :
   ```bash
   npm install
   ```

3. Lancez l'application en mode développement :
   ```bash
   npm run dev
   ```

4. Ouvrez votre navigateur à l'adresse indiquée (généralement `http://localhost:5173`)

5. Créez un compte utilisateur :
   - Cliquez sur **"S'inscrire"**
   - Entrez vos informations
   - Connectez-vous

## 🔐 Étape 8 : Promouvoir un Utilisateur en Admin (Optionnel)

Par défaut, les nouveaux utilisateurs ont le rôle "observateur". Pour avoir accès complet :

1. Dans Supabase, allez dans **Table Editor**
2. Ouvrez la table `profiles`
3. Trouvez votre profil (par votre nom ou email)
4. Cliquez sur la ligne pour l'éditer
5. Changez le champ `role` de `observateur` à `admin`
6. Cliquez sur **"Save"**
7. Déconnectez-vous et reconnectez-vous dans l'application

## 🎯 Fonctionnalités Disponibles

Avec Supabase configuré, vous avez accès à :

- ✅ **Authentification** : Inscription, connexion, gestion des sessions
- ✅ **Base de données** : PostgreSQL avec PostGIS pour les données géospatiales
- ✅ **Temps réel** : Mises à jour automatiques des données
- ✅ **Sécurité** : Row Level Security (RLS) basé sur les rôles
- ✅ **API REST** : Générée automatiquement pour toutes les tables

## 🐛 Dépannage

### Erreur : "Invalid API key"
- Vérifiez que vous avez copié la clé `anon public` (pas la clé `service_role`)
- Vérifiez qu'il n'y a pas d'espaces avant/après dans le fichier `.env`

### Erreur : "Failed to fetch"
- Vérifiez que l'URL Supabase est correcte
- Vérifiez votre connexion internet
- Vérifiez que le projet Supabase est bien actif

### Les tables n'apparaissent pas
- Vérifiez que les migrations ont été exécutées sans erreur
- Regardez les logs dans l'onglet "Logs" de Supabase

### Impossible de se connecter
- Vérifiez que l'email est confirmé (regardez vos emails)
- Vérifiez que le mot de passe respecte les critères (min 6 caractères)

## 📚 Ressources Supplémentaires

- [Documentation Supabase](https://supabase.com/docs)
- [Guide PostGIS](https://postgis.net/documentation/)
- [Supabase Auth](https://supabase.com/docs/guides/auth)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

## 💡 Conseils

- Le tier gratuit Supabase offre :
  - 500 MB de stockage base de données
  - 1 GB de stockage fichiers
  - 2 GB de bande passante
  - Suffisant pour le développement et les petits projets

- Pour la production, considérez le plan Pro si nécessaire

- Activez l'authentification à deux facteurs (2FA) sur votre compte Supabase pour plus de sécurité

---

**Vous êtes maintenant prêt à utiliser l'application GeoSignal ! 🎉**
