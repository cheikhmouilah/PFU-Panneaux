# Guide d'Utilisation Rapide - GeoSignal

## 🚀 Démarrage Rapide

### 1. Première Connexion

La plateforme dispose déjà de 15 panneaux d'exemple positionnés à Sidi Bel Abbès.

**Pour vous connecter :**

1. Créez un compte en cliquant sur "Pas de compte ? S'inscrire"
2. Remplissez vos informations :
   - Nom complet
   - Email
   - Mot de passe
3. Votre compte est créé avec le rôle "Observateur"

### 2. Navigation dans l'Application

L'interface comporte 5 sections principales :

#### 📊 Tableau de Bord
- Vue d'ensemble des statistiques
- Indicateurs clés de performance (KPI)
- État des panneaux et interventions
- Performance globale du système

#### 🗺️ Carte SIG
- Visualisation interactive des panneaux
- Carte OpenStreetMap de Sidi Bel Abbès
- Cliquez sur un panneau pour voir ses détails
- Utilisez les filtres pour :
  - État (Fonctionnel, En maintenance, Hors service)
  - Catégorie (A, B, C, D)

**Légende des couleurs :**
- 🟢 Vert : Fonctionnel
- 🟠 Orange : En maintenance
- 🔴 Rouge : Hors service

#### 📍 Gestion des Panneaux
- Liste complète des panneaux
- Recherche par code ou adresse
- **Pour Admins/Responsables uniquement :**
  - Ajouter un nouveau panneau
  - Modifier un panneau existant
  - Supprimer un panneau (Admin uniquement)

**Informations d'un panneau :**
- Code (ex: A1, B2, C1)
- Catégorie : A (Danger), B (Priorité), C (Prescription), D (Indication)
- Position GPS (latitude/longitude)
- Adresse
- État
- Type (Intelligent ou Standard)
- Date d'installation

#### 🔧 Maintenance
- Gestion des interventions
- Filtrage par statut
- **Pour Admins/Responsables :**
  - Créer une nouvelle intervention
  - Assigner un technicien
  - Définir la priorité

**Statuts des interventions :**
- 🔵 Planifiée : Intervention programmée
- 🟡 En cours : Intervention en cours d'exécution
- 🟢 Terminée : Intervention complétée
- ⚫ Annulée : Intervention annulée

**Actions disponibles :**
- Démarrer une intervention planifiée
- Terminer une intervention en cours

#### 📡 Contrôle à Distance
**Pour Admins/Responsables uniquement**

Permet de contrôler les panneaux intelligents à distance :

1. Sélectionnez un panneau intelligent
2. Entrez le nouveau code souhaité
3. Cliquez sur "Envoyer la commande"
4. Le système affiche l'historique des commandes

**Statuts des commandes :**
- 🟡 En attente
- 🔵 Envoyée
- 🟢 Exécutée
- 🔴 Échec

## 👥 Rôles et Permissions

### 🔍 Observateur (Par défaut)
- Consulter le tableau de bord
- Voir la carte SIG
- Voir la liste des panneaux
- Voir les interventions
- Voir l'historique des commandes

### 👨‍💼 Responsable
Toutes les permissions d'Observateur +
- Ajouter/modifier des panneaux
- Créer et gérer des interventions
- Contrôler les panneaux intelligents à distance

### 👨‍💻 Admin
Toutes les permissions +
- Supprimer des panneaux
- Gérer tous les aspects du système

### 🔧 Technicien
- Voir et modifier les interventions assignées
- Mettre à jour le statut des interventions

## 📱 Utilisation Mobile

L'application est entièrement responsive :
- Menu burger sur mobile
- Toutes les fonctionnalités accessibles
- Carte interactive optimisée

## 🎯 Cas d'Usage Typiques

### Scénario 1 : Signaler un Panneau Défectueux

1. Allez dans "Gestion des panneaux"
2. Trouvez le panneau concerné
3. Cliquez sur modifier
4. Changez l'état en "En maintenance" ou "Hors service"
5. Créez une intervention depuis "Maintenance"

### Scénario 2 : Planifier une Maintenance

1. Allez dans "Maintenance"
2. Cliquez sur "Nouvelle intervention"
3. Sélectionnez :
   - Le panneau concerné
   - Le technicien
   - Le type (maintenance préventive, réparation, installation)
   - La priorité
   - La date planifiée
4. Ajoutez une description
5. Cliquez sur "Créer"

### Scénario 3 : Changer le Code d'un Panneau Intelligent

1. Allez dans "Contrôle à distance"
2. Sélectionnez le panneau dans la liste
3. Entrez le nouveau code (ex: A1 → B2)
4. Cliquez sur "Envoyer la commande"
5. Vérifiez l'exécution dans l'historique

### Scénario 4 : Consulter les Statistiques

1. Allez dans "Tableau de bord"
2. Consultez :
   - Le nombre total de panneaux
   - Le taux de disponibilité
   - Les interventions actives
   - Les techniciens disponibles
3. Analysez les graphiques pour prendre des décisions

## 🔔 Temps Réel

L'application utilise Supabase Realtime :
- Les commandes sont mises à jour automatiquement
- Plusieurs utilisateurs peuvent travailler simultanément
- Les changements sont synchronisés instantanément

## ❓ Questions Fréquentes

**Q : Comment obtenir le rôle Admin ou Responsable ?**
R : Contactez l'administrateur système qui peut modifier votre rôle dans la base de données.

**Q : Puis-je supprimer un panneau ?**
R : Seuls les administrateurs peuvent supprimer des panneaux.

**Q : Qu'est-ce qu'un panneau intelligent ?**
R : Un panneau intelligent peut recevoir des commandes à distance pour changer son affichage.

**Q : Comment sont calculées les statistiques ?**
R : Les statistiques sont calculées en temps réel à partir des données de la base de données.

**Q : Puis-je exporter les données ?**
R : Cette fonctionnalité peut être ajoutée selon les besoins.

## 🆘 Support

Pour toute question ou problème technique :
- Consultez ce guide
- Vérifiez le README.md pour les détails techniques
- Contactez l'administrateur système

## 📈 Bonnes Pratiques

1. **Mettez à jour régulièrement** l'état des panneaux
2. **Planifiez les maintenances** préventives
3. **Assignez les bonnes priorités** aux interventions
4. **Documentez les interventions** avec des descriptions claires
5. **Utilisez les filtres** pour trouver rapidement l'information
6. **Vérifiez le tableau de bord** régulièrement pour anticiper les problèmes

## 🎓 Formation Recommandée

Pour une utilisation optimale :
1. Explorer toutes les sections
2. Tester les filtres sur la carte
3. Créer quelques interventions de test
4. Se familiariser avec le contrôle à distance
5. Analyser les statistiques du tableau de bord

---

**Bonne utilisation de GeoSignal !** 🚦
