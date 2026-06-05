# Guide de mise en production — Cameroon Memoria

Ce document décrit les étapes nécessaires pour mettre en production Cameroon Memoria : intégration des paiements (Stripe, Mobile Money), emails transactionnels (SendGrid), et déploiement sur un VPS dédié avec Caddy et Docker.

---

## Table des matières

1. [Paiements Stripe](#1-paiements-stripe)
2. [Mobile Money (Orange Money & MTN MoMo)](#2-mobile-money-orange-money--mtn-momo)
3. [Emails transactionnels via OVH SMTP](#3-emails-transactionnels-via-ovh-smtp)
4. [Déploiement VPS avec Caddy et Docker](#4-déploiement-vps-avec-caddy-et-docker)
5. [CI/CD GitHub Actions](#5-cicd-github-actions)
6. [Checklist de mise en production](#6-checklist-de-mise-en-production)

---

## 1. Paiements Stripe

### 1.1 État actuel

L'intégration Stripe est déjà fonctionnelle dans le projet :

- **Checkout Session** : `app/api/stripe/checkout/route.ts` crée une session Stripe Checkout
- **Webhook** : `app/api/stripe/webhook/route.ts` traite les événements `checkout.session.completed`
- **Devise** : XAF (Franc CFA), montants convertis en centimes pour Stripe
- **Librairies** : `stripe` (serveur) et `@stripe/stripe-js` (client) installées

### 1.2 Créer un compte Stripe

1. Créer un compte sur [dashboard.stripe.com](https://dashboard.stripe.com)
2. Activer le compte en fournissant les informations légales (entreprise ou association)
3. Vérifier que la devise **XAF** est supportée pour votre pays

### 1.3 Récupérer les clés API

Dans le Dashboard Stripe → **Developers** → **API keys** :

| Variable d'environnement             | Où la trouver                                         |
|--------------------------------------|-------------------------------------------------------|
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Clé publiable (commence par `pk_live_` ou `pk_test_`) |
| `STRIPE_SECRET_KEY`                  | Clé secrète (commence par `sk_live_` ou `sk_test_`)   |

### 1.4 Configurer le Webhook

Le webhook permet à Stripe de notifier l'application quand un paiement est complété.

**En développement (avec Stripe CLI)** :

```bash
# Installer Stripe CLI
brew install stripe/stripe-cli/stripe  # macOS

# Se connecter
stripe login

# Écouter les webhooks en local
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

La commande affiche un **webhook signing secret** (`whsec_...`). L'ajouter comme `STRIPE_WEBHOOK_SECRET` dans `.env`.

**En production** :

1. Dashboard Stripe → **Developers** → **Webhooks** → **Add endpoint**
2. URL : `https://votre-domaine.com/api/stripe/webhook`
3. Événements à écouter : `checkout.session.completed`
4. Copier le **Signing secret** → `STRIPE_WEBHOOK_SECRET`

### 1.5 Variables d'environnement

```env
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### 1.6 Tester le flux complet

1. Utiliser les clés **test** (`pk_test_`, `sk_test_`) en développement
2. Carte de test : `4242 4242 4242 4242`, expiration future, CVC quelconque
3. Vérifier dans le Dashboard Stripe → **Payments** que le paiement apparaît
4. Vérifier que le webhook crée bien un `Transaction` en base de données

### 1.7 Passage en production

1. Remplacer les clés test par les clés live dans les variables d'environnement du VPS
2. Mettre à jour l'URL du webhook vers le domaine de production
3. Activer le mode live dans le Dashboard Stripe

---

## 2. Mobile Money (Orange Money & MTN MoMo)

### 2.1 Choix de l'agrégateur

Pour intégrer Orange Money et MTN Mobile Money avec une seule API, utiliser un agrégateur de paiement mobile. Options recommandées pour le Cameroun :

| Agrégateur      | Avantages                                                                   | Site            |
|-----------------|-----------------------------------------------------------------------------|-----------------|
| **CinetPay**    | Populaire en Afrique francophone, supporte Orange/MTN/Wave, API REST simple | cinetpay.com    |
| **NotchPay**    | Basé au Cameroun, supporte OM/MoMo, API moderne, bon support                | notchpay.co     |
| **Monetbil**    | Spécialisé Cameroun, intégration simple                                     | monetbil.com    |
| **Flutterwave** | International, supporte le Cameroun, documentation riche                    | flutterwave.com |

> **Recommandation** : **NotchPay** ou **CinetPay** — les deux sont bien adaptés au marché camerounais et offrent une API REST facile à intégrer.

### 2.2 Flux d'intégration (exemple avec NotchPay)

Le flux est similaire à Stripe Checkout :

```
Utilisateur → Choix Mobile Money → API NotchPay (initialisation) → Redirect/USSD Push
→ Paiement confirmé → Webhook NotchPay → Création Transaction en BDD
```

### 2.3 Étapes d'implémentation

#### A. Créer un compte agrégateur

1. S'inscrire sur le site de l'agrégateur choisi
2. Compléter la vérification KYC (pièce d'identité, infos entreprise)
3. Récupérer les clés API (publique + secrète)

#### B. Ajouter les variables d'environnement

```env
# Exemple avec NotchPay
NOTCHPAY_PUBLIC_KEY=pk_...
NOTCHPAY_SECRET_KEY=sk_...
NOTCHPAY_WEBHOOK_SECRET=whsec_...

# Ou avec CinetPay
CINETPAY_API_KEY=...
CINETPAY_SITE_ID=...
CINETPAY_SECRET_KEY=...
```

#### C. Créer la route API

Créer `app/api/mobile-money/checkout/route.ts` sur le même modèle que le checkout Stripe :

```typescript
// Exemple de structure (à adapter selon l'agrégateur)
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { amount, announcementId, phoneNumber, provider } = await req.json();

  // Initialiser le paiement via l'API de l'agrégateur
  const response = await fetch("https://api.notchpay.co/payments/initialize", {
    method: "POST",
    headers: {
      "Authorization": process.env.NOTCHPAY_SECRET_KEY!,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount,
      currency: "XAF",
      phone: phoneNumber,
      channel: provider, // "om" ou "momo"
      reference: `DON-${announcementId}-${Date.now()}`,
      callback: `${process.env.NEXT_PUBLIC_APP_URL}/api/mobile-money/webhook`,
      description: `Don pour annonce ${announcementId}`,
    }),
  });

  const data = await response.json();
  return NextResponse.json(data);
}
```

#### D. Créer le webhook

Créer `app/api/mobile-money/webhook/route.ts` :

```typescript
import { NextRequest, NextResponse } from "next/server";
import { transactionService } from "@/features/feature-transaction";

export async function POST(req: NextRequest) {
  const payload = await req.json();

  // Vérifier la signature du webhook (selon l'agrégateur)
  // ...

  if (payload.status === "complete") {
    // Créer la transaction en base
    await transactionService.createTransaction({
      amount: payload.amount,
      type: "DONATION",
      status: "COMPLETED",
      description: `Mobile Money - ${payload.channel}`,
      currency: "XAF",
      userId: payload.metadata.userId,
    });
  }

  return NextResponse.json({ received: true });
}
```

#### E. Connecter le formulaire existant

Le formulaire de don (`features/feature-wallet/`) a déjà les champs pour Mobile Money (numéro de téléphone, fournisseur). Il suffit de brancher l'appel API dans le composant de paiement existant.

### 2.4 Points d'attention

- **Délai de confirmation** : les paiements Mobile Money peuvent prendre 30s à 2min. Prévoir un statut `PENDING` et confirmer via webhook
- **Format téléphone** : le projet valide déjà le format camerounais (`^(\+237|237)?[6-9]\d{8}$`)
- **Frais** : les agrégateurs prélèvent généralement 1.5% à 3.5% par transaction
- **Montants** : respecter les limites min/max déjà définies (500 – 1 000 000 FCFA)

---

## 3. Emails transactionnels via OVH SMTP

### 3.1 État actuel

Le projet a un `emailService` (`lib/services/emailService.ts`) qui supporte l'envoi par SMTP. Le service est déjà fonctionnel.

### 3.2 Pourquoi OVH SMTP ?

Le nom de domaine étant géré chez OVHcloud, le service email (MX Plan) est inclus ou disponible à faible coût. Cela évite de créer un compte chez un service tiers comme SendGrid. La limite de **200 emails/heure** est largement suffisante pour le lancement.

> Si la plateforme grandit et dépasse cette limite, on pourra migrer vers SendGrid ou un service spécialisé sans modifier le code (simple changement de variables d'environnement).

### 3.3 Créer le compte email d'envoi

1. Dans l'espace client OVHcloud → **Emails** → **Créer une adresse email**
2. Créer l'adresse `noreply@cameroonmemoria.com` (ou autre adresse souhaitée)
3. Définir un mot de passe pour ce compte

### 3.4 Paramètres SMTP OVH

| Paramètre        | Valeur                        |
|------------------|-------------------------------|
| Serveur SMTP     | `ssl0.ovh.net`                |
| Port             | `465` (SSL)                   |
| Authentification | Oui                           |
| Utilisateur      | `noreply@cameroonmemoria.com` |
| Mot de passe     | Mot de passe du compte email  |

### 3.5 Variables d'environnement

```env
EMAIL_PROVIDER=smtp
SMTP_HOST=ssl0.ovh.net
SMTP_PORT=465
SMTP_USER=noreply@cameroonmemoria.com
SMTP_PASSWORD=mot-de-passe-du-compte
SMTP_FROM=noreply@cameroonmemoria.com
SMTP_FROM_NAME=Cameroon Memoria
```

### 3.6 Emails à envoyer

| Événement                     | Destinataire                   | Contenu                                    |
|-------------------------------|--------------------------------|--------------------------------------------|
| Don reçu                      | Donateur                       | Confirmation + reçu du montant             |
| Don reçu                      | Famille (propriétaire annonce) | Notification d'un nouveau don              |
| Inscription                   | Nouvel utilisateur             | Email de bienvenue                         |
| Réinitialisation mot de passe | Utilisateur                    | Lien de réinitialisation (déjà implémenté) |
| Annonce publiée               | Auteur                         | Confirmation de publication                |
| Condoléance reçue             | Propriétaire annonce           | Notification d'une nouvelle condoléance    |

### 3.7 Points d'attention

- **Limite** : 200 emails/heure, 100 destinataires max par message
- **SPF/DKIM** : OVHcloud configure automatiquement les enregistrements DNS pour le domaine géré chez eux, ce qui améliore la délivrabilité
- **Templates** : on garde le HTML inline existant dans le `emailService`
- **Évolution** : si le volume dépasse la limite OVH, migrer vers SendGrid (changement de variables d'environnement uniquement)

---

## 4. Déploiement VPS avec Caddy et Docker

### 4.1 Prérequis sur le VPS

- Ubuntu 22.04+ ou Debian 12+
- Docker et Docker Compose installés
- Un nom de domaine pointant vers l'IP du VPS (enregistrement DNS A)

#### Installer Docker

```bash
# Installer Docker
curl -fsSL https://get.docker.com | sh

# Ajouter l'utilisateur au groupe docker
sudo usermod -aG docker $USER

# Installer Docker Compose plugin
sudo apt install docker-compose-plugin
```

#### Installer Caddy

```bash
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https curl
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt update
sudo apt install caddy
```

### 4.2 Structure sur le serveur

```
/opt/cameroonmemoria/
├── docker-compose.prod.yml
├── .env
└── Caddyfile
```

### 4.3 Fichier .env de production

Créer `/opt/cameroonmemoria/.env` avec toutes les variables :

```env
# Base de données (PostgreSQL externe ou managée)
DATABASE_URL=postgresql://user:password@host:5432/cameroonmemoria

# Auth
BETTER_AUTH_SECRET=une-clé-secrète-longue-et-aléatoire
BETTER_AUTH_URL=https://votre-domaine.com

# Stripe
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Mobile Money (agrégateur)
NOTCHPAY_SECRET_KEY=sk_...
NOTCHPAY_WEBHOOK_SECRET=whsec_...

# Emails (OVH SMTP)
EMAIL_PROVIDER=smtp
SMTP_HOST=ssl0.ovh.net
SMTP_PORT=465
SMTP_USER=noreply@cameroonmemoria.com
SMTP_PASSWORD=mot-de-passe-du-compte
SMTP_FROM=noreply@cameroonmemoria.com
SMTP_FROM_NAME=Cameroon Memoria

# Minio (stockage fichiers)
MINIO_ENDPOINT=minio.votre-domaine.com
MINIO_PORT=9000
MINIO_BUCKET=cameroonmemoria
MINIO_ACCESS_KEY=...
MINIO_SECRET_KEY=...
MINIO_USE_SSL=true

# App
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://votre-domaine.com

# Admin
ADMIN_EMAIL=admin@cameroonmemoria.com
ADMIN_PASSWORD=un-mot-de-passe-fort
ADMIN_NAME=Administrateur
```

### 4.4 Configurer Caddy

Caddy gère automatiquement les certificats SSL (Let's Encrypt).

Créer `/opt/cameroonmemoria/Caddyfile` :

```caddyfile
votre-domaine.com {
    reverse_proxy localhost:3000
}
```

C'est tout. Caddy s'occupe automatiquement du HTTPS, du renouvellement des certificats, et de la redirection HTTP → HTTPS.

Pour activer la config :

```bash
sudo cp /opt/cameroonmemoria/Caddyfile /etc/caddy/Caddyfile
sudo systemctl reload caddy
```

### 4.5 docker-compose.prod.yml

Le fichier actuel du projet fonctionne. S'assurer que les variables de paiement et email sont passées au conteneur. Ajouter les variables manquantes :

```yaml
services:
  app:
    container_name: cameroonmemoria-app
    build:
      context: .
      dockerfile: Dockerfile
    restart: always
    ports:
      - '127.0.0.1:3000:3000'
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - BETTER_AUTH_SECRET=${BETTER_AUTH_SECRET}
      - BETTER_AUTH_URL=${BETTER_AUTH_URL}
      - MINIO_ENDPOINT=${MINIO_ENDPOINT}
      - MINIO_PORT=${MINIO_PORT}
      - MINIO_BUCKET=${MINIO_BUCKET}
      - MINIO_ACCESS_KEY=${MINIO_ACCESS_KEY}
      - MINIO_SECRET_KEY=${MINIO_SECRET_KEY}
      - MINIO_USE_SSL=${MINIO_USE_SSL:-false}
      - STRIPE_SECRET_KEY=${STRIPE_SECRET_KEY}
      - NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=${NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY}
      - STRIPE_WEBHOOK_SECRET=${STRIPE_WEBHOOK_SECRET}
      - EMAIL_PROVIDER=${EMAIL_PROVIDER}
      - SMTP_HOST=${SMTP_HOST}
      - SMTP_PORT=${SMTP_PORT}
      - SMTP_USER=${SMTP_USER}
      - SMTP_PASSWORD=${SMTP_PASSWORD}
      - SMTP_FROM=${SMTP_FROM}
      - SMTP_FROM_NAME=${SMTP_FROM_NAME}
      - ADMIN_EMAIL=${ADMIN_EMAIL}
      - ADMIN_NAME=${ADMIN_NAME}
      - ADMIN_PASSWORD=${ADMIN_PASSWORD}
      - NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL}
      - NODE_ENV=production
    healthcheck:
      test: ['CMD', 'wget', '--no-verbose', '--tries=1', '--spider', 'http://localhost:3000']
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 20s
```

> **Note** : le port est bindé sur `127.0.0.1:3000` pour que seul Caddy (en reverse proxy) puisse y accéder. Le port n'est pas exposé publiquement.

### 4.6 Premier déploiement manuel

```bash
# Sur le VPS
cd /opt/cameroonmemoria

# Cloner le repo (première fois)
git clone https://github.com/votre-org/cameroonmemoria.git .

# Copier le .env
cp .env.example .env
# Éditer .env avec les vraies valeurs

# Build et démarrage
docker compose -f docker-compose.prod.yml up -d --build

# Vérifier les logs
docker compose -f docker-compose.prod.yml logs -f app

# Exécuter les migrations
docker exec cameroonmemoria-app npx prisma migrate deploy

# Seeder l'admin
docker exec cameroonmemoria-app node prisma/seeds/admin-seed.js
```

---

## 5. CI/CD GitHub Actions

### 5.1 Workflow de déploiement

Le CI existant (`.github/workflows/ci.yml`) lint et build le projet. Ajouter un workflow de déploiement qui se connecte en SSH au VPS pour pull et redémarrer.

Créer `.github/workflows/deploy.yml` :

```yaml
name: Deploy

on:
  push:
    branches: [main]

concurrency:
  group: deploy-production
  cancel-in-progress: false

jobs:
  ci:
    uses: ./.github/workflows/ci.yml

  deploy:
    needs: ci
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'

    steps:
      - name: Deploy via SSH
        uses: appleboy/ssh-action@v1
        with:
          host: ${{ secrets.VPS_HOST }}
          username: ${{ secrets.VPS_USER }}
          key: ${{ secrets.VPS_SSH_KEY }}
          script: |
            cd /opt/cameroonmemoria
            git pull origin main
            docker compose -f docker-compose.prod.yml up -d --build
            docker exec cameroonmemoria-app npx prisma migrate deploy
            echo "Déploiement terminé !"
```

### 5.2 Configurer les secrets GitHub

Dans le repo GitHub → **Settings** → **Secrets and variables** → **Actions** :

| Secret        | Valeur                                                  |
|---------------|---------------------------------------------------------|
| `VPS_HOST`    | Adresse IP ou domaine du VPS                            |
| `VPS_USER`    | Utilisateur SSH (ex: `deploy`)                          |
| `VPS_SSH_KEY` | Clé privée SSH (contenu complet de `~/.ssh/id_ed25519`) |

### 5.3 Préparer le VPS pour le déploiement SSH

```bash
# Sur le VPS, créer un utilisateur dédié au déploiement
sudo adduser deploy
sudo usermod -aG docker deploy

# Générer une clé SSH (sur votre machine locale)
ssh-keygen -t ed25519 -C "deploy@cameroonmemoria" -f ~/.ssh/africanmemoria_deploy

# Copier la clé publique sur le VPS
ssh-copy-id -i ~/.ssh/africanmemoria_deploy.pub deploy@votre-vps

# La clé privée (~/.ssh/africanmemoria_deploy) va dans le secret GitHub VPS_SSH_KEY
```

### 5.4 Flux complet

```
Push sur main → CI (lint + build) → Deploy (SSH → git pull → docker build → migrate)
```

---

## 6. Checklist de mise en production

### Infrastructure

- [ ] VPS provisionné (Ubuntu 22.04+, min 2 Go RAM)
- [ ] Docker et Docker Compose installés
- [ ] Caddy installé et configuré
- [ ] Nom de domaine configuré (DNS A vers IP du VPS)
- [ ] Certificat SSL actif (automatique via Caddy)
- [ ] Base de données PostgreSQL accessible (locale ou managée)
- [ ] Minio/S3 configuré pour le stockage des médias

### Paiements

- [ ] Compte Stripe activé (mode live)
- [ ] Clés API Stripe en production
- [ ] Webhook Stripe configuré avec l'URL de production
- [ ] Compte agrégateur Mobile Money créé et vérifié
- [ ] API Mobile Money intégrée et testée
- [ ] Tests de paiement en mode live réussis

### Emails

- [ ] Adresse email d'envoi créée sur OVH (`noreply@cameroonmemoria.com`)
- [ ] Paramètres SMTP configurés dans les variables d'environnement
- [ ] Emails de test envoyés et reçus
- [ ] Templates d'email vérifiés (don reçu, bienvenue, reset mot de passe)

### CI/CD

- [ ] Secrets GitHub configurés (VPS_HOST, VPS_USER, VPS_SSH_KEY)
- [ ] Workflow de déploiement testé
- [ ] Utilisateur SSH dédié créé sur le VPS
- [ ] Clé SSH déployée

### Application

- [ ] Variables d'environnement de production configurées
- [ ] Migrations Prisma exécutées
- [ ] Utilisateur admin créé
- [ ] `BETTER_AUTH_SECRET` unique et sécurisé
- [ ] `NEXT_PUBLIC_APP_URL` correctement défini
- [ ] Healthcheck Docker fonctionnel

### Sécurité

- [ ] Port 3000 accessible uniquement via localhost (Caddy en proxy)
- [ ] Fichier `.env` non versionné
- [ ] Clés API en mode production (pas test)
- [ ] Firewall configuré (UFW : 22, 80, 443 uniquement)

```bash
# Configuration firewall recommandée
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```
