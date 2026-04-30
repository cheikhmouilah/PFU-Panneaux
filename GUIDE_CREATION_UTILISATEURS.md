# Guide : Créer des Utilisateurs (Migration Locale)

Depuis la migration vers la base de données locale PostgreSQL, la gestion des utilisateurs se fait directement via des scripts ou l'application.

## 🎯 Méthode Recommandée : Script de Création

Nous avons créé des scripts utilitaires pour configurer votre base de données et créer des utilisateurs.

### Étape 1 : Initialiser la Base de Données (Une seule fois)

Cette commande va créer toutes les tables nécessaires (profiles, users, panels, etc.) dans votre base de données PostgreSQL locale.

```bash
npx tsx server/scripts/setup_db.ts
```

### Étape 2 : Créer un Utilisateur

Une fois la base de données initialisée, vous pouvez créer des utilisateurs :

```bash
npx tsx server/scripts/create_user.ts
```

3. Suivez les instructions à l'écran :
   - Entrez le **Nom complet**
   - Entrez l' **Email**
   - Entrez le **Mot de passe**
   - Entrez le **Rôle** (admin, responsable, technicien, ou observateur)

### Exemple

```text
--- Création d'un nouvel utilisateur ---
Nom complet: Admin Principal
Email: admin@geosignal.dz
Mot de passe: admin123
Rôle (admin, responsable, technicien, observateur) [observateur]: admin

✅ Utilisateur admin@geosignal.dz créé avec succès avec le rôle 'admin'
```

---

## 🌐 Méthode Alternative : Inscription via l'Application

Vous pouvez toujours utiliser la page d'inscription de l'application, mais les utilisateurs seront créés avec le rôle **"observateur"** par défaut.

1. Allez sur `http://localhost:5173/auth` (ou déconnectez-vous)
2. Cliquez sur "S'inscrire"
3. Créez le compte
4. Pour changer le rôle, vous devrez modifier la base de données manuellement (via SQL).

### Changer le rôle via SQL

Si vous avez accès à votre base de données locale (via pgAdmin ou psql) :

```sql
UPDATE profiles 
SET role = 'admin' 
WHERE id IN (SELECT profile_id FROM users WHERE email = 'votre@email.com');
```

---

## 📋 Rôles Disponibles

- **admin** : Accès complet (Gestion utilisateurs, configuration système)
- **responsable** : Gestion des panneaux et interventions
- **technicien** : Accès aux interventions assignées
- **observateur** : Lecture seule

npm run dev:full