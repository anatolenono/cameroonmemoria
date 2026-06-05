# Cameroon Memoria

Cameroon Memoria est une plateforme d'annonces nécrologiques visant principalement la communauté camerounaise (au pays et dans la diaspora).

## Fonctionnalités

- Annonces nécrologiques
- Système de dons
- Condoléances et hommages
- Gestion utilisateurs
- Portefeuille et retraits

## Intégration continue

Le projet utilise GitHub Actions pour l'intégration continue avec les workflows suivants :

- **CI principale** : Exécute les linters et construit l'application pour chaque commit et PR
- **Tests E2E** : Exécute les tests Playwright end-to-end dans un environnement conteneurisé
- **Dependabot** : Met à jour automatiquement les dépendances avec des PRs hebdomadaires

### Badges de statut

[![CI](https://github.com/yourusername/cameroonmemoria/actions/workflows/ci.yml/badge.svg)](https://github.com/yourusername/cameroonmemoria/actions/workflows/ci.yml)
[![E2E Tests](https://github.com/yourusername/cameroonmemoria/actions/workflows/e2e.yml/badge.svg)](https://github.com/yourusername/cameroonmemoria/actions/workflows/e2e.yml)

## Structure du Projet

Ce projet est organisé selon les principes de Clean Architecture :

```
features/              # Fonctionnalités métier
└── feature-auth/      # Authentification
   ├── domain/        # Entités et interfaces
   ├── application/   # Cas d'utilisation
   │   ├── useCases/  # Cas métier avec gestion offline
   │   └── sync/      # Stratégie de synchronisation
   ├── infrastructure/# Implémentations techniques
   │   ├── api/       # API client
   │   ├── database/  # Accès aux données
   │   └── store/     # État global (Zustand)
   └── presentation/  # Composants React
core/                  # Éléments partagés du système
├── domain/            # Entités communes
├── application/       # Application
├── infrastructure/    # Infrastructure
└── presentation/      # Presentation
components/            # Composants UI réutilisables
├── ui/                # Composants Shadcn UI
├── layout/            # Composants de mise en page
├── data/              # Composants de données
└── feedback/          # Composants de notification
utils/                 # Utilitaires génériques
```

## Technologies Utilisées

- **Frontend** : NextJS (dernière version)
- **Backend** : NextJS API Router / Node.js
- **Base de données** : PostgreSQL (Prisma ORM)
- **Paiement** : Mobile Money, Stripe, PayPal
- **Architecture** : Clean Architecture
- **Gestion d'état** : Zustand
- **UI** : TailwindCSS, shadcn
- **Authentification** : NextAuth
- **Multilinguisme** : i18next
- **Stockage de fichiers** : Minio

## Configuration requise

- Docker
- Docker Compose
- Node.js (version 20 ou supérieure)
- pnpm

## Installation

```bash
# Cloner le dépôt
git clone [URL_DU_REPO]
cd african-memoria

# Installer pnpm si nécessaire
npm install -g pnpm

# Installer les dépendances
pnpm install

# Lancer le serveur de développement
pnpm dev
```

## Commandes Disponibles

- `pnpm dev` : Démarrer le serveur de développement
- `pnpm build` : Compiler le projet pour la production
- `pnpm start` : Lancer la version de production
- `pnpm lint` : Analyser le code avec ESLint

## Environnement de Développement

Le projet utilise Docker pour gérer les services suivants :

1. **PostgreSQL**
   - Port: 5432
   - Utilisateur: postgres
   - Mot de passe: postgres
   - Base de données: cameroonmemoria

2. **Minio** (stockage d'objets compatible S3)
   - Port API: 9000
   - Port console: 9001
   - Accès console: http://localhost:9001
   - Utilisateur: minioadmin
   - Mot de passe: minioadmin
   - Bucket: cameroonmemoria-media (créé automatiquement)

3. **PgAdmin** (client PostgreSQL)
   - Port: 5050
   - Accès: http://localhost:5050
   - Email: admin@cameroonmemoria.com
   - Mot de passe: admin

### Démarrage de l'environnement

Pour lancer l'environnement de développement:

```bash
# Démarrer les services
docker-compose up -d
```

Pour arrêter les services:

```bash
docker-compose down
```

Pour arrêter les services et supprimer les volumes (supprime toutes les données):

```bash
docker-compose down -v
```

### Test de l'environnement

Un script de test est fourni pour vérifier que l'environnement Docker est correctement configuré:

```bash
# Rendre le script exécutable
chmod +x docker-test.sh

# Exécuter le script de test
./docker-test.sh
```

### Exploration de la Base de Données avec PgAdmin

PgAdmin est un outil de gestion et d'administration PostgreSQL avec une interface web.

1. **Premier accès à PgAdmin**:
   - Accédez à http://localhost:5050
   - Connectez-vous avec les identifiants (admin@cameroonmemoria.com / admin)

2. **Configuration de la connexion à PostgreSQL**:
   - Dans le menu de gauche, faites un clic-droit sur "Servers" et sélectionnez "Register" > "Server..."
   - Dans l'onglet "General", donnez un nom à la connexion (ex. "Cameroon Memoria DB")
   - Dans l'onglet "Connection", configurez les paramètres suivants:
     - Host name/address: `postgres` (nom du service dans docker-compose)
     - Port: `5432`
     - Maintenance database: `cameroonmemoria`
     - Username: `postgres`
     - Password: `postgres`
   - Cochez "Save password" si souhaité
   - Cliquez sur "Save"

3. **Explorer la base de données**:
   - Développez le serveur que vous venez de créer
   - Naviguez vers "Databases" > "cameroonmemoria" > "Schemas" > "public" > "Tables"
   - Vous pouvez maintenant voir toutes les tables générées par Prisma
   - Pour consulter les données d'une table, faites un clic-droit sur la table et sélectionnez "View/Edit Data" > "All Rows"

4. **Exécuter des requêtes SQL**:
   - Cliquez sur l'icône "Query Tool" (ou Menu Tools > Query Tool)
   - Écrivez vos requêtes SQL et exécutez-les avec le bouton "Execute/Refresh" (F5)
   - Exemple de requête:
     ```sql
     SELECT * FROM "User";
     ```

5. **Fonctionnalités utiles**:
   - Visualisation des relations entre tables
   - Édition directe des données
   - Export/Import de données
   - Analyse des performances des requêtes

L'utilisation de PgAdmin facilite considérablement la visualisation et la manipulation des données pendant le développement, sans avoir besoin d'outils en ligne de commande.

### Structure des volumes

- `postgres_data`: Stocke les données de PostgreSQL
- `minio_data`: Stocke les fichiers uploadés via Minio

### Intégration avec Next.js

Pour que l'application Next.js se connecte à ces services, configurez les variables d'environnement appropriées dans votre fichier `.env.local`:

```
# PostgreSQL
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/cameroonmemoria"

# Minio
MINIO_ENDPOINT="localhost"
MINIO_PORT=9000
MINIO_ACCESS_KEY="minioadmin"
MINIO_SECRET_KEY="minioadmin"
MINIO_BUCKET="cameroonmemoria-media"
MINIO_USE_SSL=false
```

## Déploiement

Le projet est configuré pour être déployé via Coolify sur un VPS.

### Configuration du déploiement

1. Importez le projet dans Coolify en utilisant le dépôt Git
2. Ajustez les variables d'environnement si nécessaire:
   - `NEXTAUTH_URL`: URL de votre site en production
   - `NEXTAUTH_SECRET`: Clé secrète pour l'authentification

### Variables d'environnement pour la production

```
# Application
NODE_ENV=production
NEXTAUTH_URL=https://votre-domaine.com
NEXTAUTH_SECRET=votre-secret-securise

# Base de données
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/cameroonmemoria

# Minio
MINIO_ENDPOINT=minio
MINIO_PORT=9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET=cameroonmemoria-media
MINIO_USE_SSL=false
```

### Sécurité en production

Pour la production, assurez-vous de:
1. Changer les mots de passe par défaut
2. Configurer HTTPS
3. Limiter l'accès aux ports de service
4. Mettre en place des sauvegardes régulières des données

## Licence

[Licence à définir]
