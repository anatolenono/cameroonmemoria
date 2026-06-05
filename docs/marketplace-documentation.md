# Marketplace CameronMemoria — Documentation fonctionnelle

## Vue d'ensemble

Le Marketplace CameronMemoria est une extension de la plateforme d'annonces funéraires. Il permet aux familles endeuillées de commander des prestations de services (fleurs, corbillard, traiteur, etc.) directement depuis le site, sans jamais connaître l'identité du prestataire qui exécutera la commande. **CameronMemoria est le seul interlocuteur visible** : elle collecte les paiements, assigne les commandes aux prestataires, et reverse les montants nets après déduction de sa commission.

---

## Acteurs du système

### 1. L'Administrateur CameronMemoria
- Gère les catégories de services disponibles sur le marketplace
- Valide ou rejette les demandes d'inscription des prestataires
- Définit les frais d'activation et le taux de commission pour chaque prestataire
- Assigne manuellement les commandes payées aux prestataires
- Change le statut des factures prestataires (versement effectué ou non)
- Accède aux rapports financiers complets

### 2. Le Prestataire (fournisseur)
- S'inscrit sur la plateforme en soumettant un dossier (informations entreprise + représentant + Mobile Money)
- Attend la validation de l'admin
- Paie des frais d'activation uniques (montant défini par l'admin, avec remise possible)
- Crée et gère son catalogue de produits/services avec des prix publics
- Reçoit les commandes assignées par l'admin
- Consulte ses factures avec la décomposition claire du montant CM et du montant net reçu
- Accède à un reporting de son activité (commandes, chiffre d'affaires, commissions)

### 3. Le Client (famille endeuillée)
- Crée un compte ou se connecte sur le site
- Cherche des services par catégorie
- Passe une commande en fournissant des instructions et le nom du défunt
- Paie 100 % du montant à l'avance (Mobile Money ou carte bancaire)
- Télécharge sa facture client
- Ne connaît jamais l'identité du prestataire (CameronMemoria est le seul contact)

---

## Modèle économique

```
Client paie 100 % du montant → CameronMemoria collecte
CameronMemoria reverse au prestataire : montant total - commission CM
```

**Deux flux financiers pour CameronMemoria :**
1. **Frais d'activation** : payés une seule fois par le prestataire lors de son activation. Montant défini manuellement par l'admin (base + remise possible en %). Non récurrents.
2. **Commission par commande** : pourcentage prélevé sur chaque commande. Taux défini par l'admin prestataire par prestataire (valeur par défaut : 10 %).

---

## Fonctionnalités implémentées (Phase 1)

### Gestion des catégories (Admin)

Les catégories structurent l'offre du marketplace. Exemples : Fleuriste, Corbillard, Traiteur, Pompes funèbres, Photographe, etc.

**Ce que l'admin peut faire :**
- Créer une catégorie (nom, description, slug unique généré automatiquement, ordre d'affichage)
- Modifier une catégorie existante
- Activer ou désactiver une catégorie (les catégories inactives n'apparaissent pas sur le site public)
- Supprimer une catégorie (uniquement si elle ne contient aucun prestataire ni produit)

**Page admin :** `/admin/marketplace/categories`

---

### Inscription des prestataires

Le prestataire suit un parcours en deux étapes :

**Étape 1 — Création de compte utilisateur**
Le prestataire crée un compte standard sur `/register` (nom, email, mot de passe). Ce compte est partagé avec le reste de la plateforme.

**Étape 2 — Soumission du dossier prestataire**
Une fois connecté, le prestataire accède à `/marketplace/become-provider` et remplit le formulaire :

*Informations entreprise :*
- Nom de l'entreprise
- Ville et adresse
- Téléphone professionnel
- Email professionnel
- Description de l'activité

*Informations représentant légal :*
- Nom complet
- Téléphone (obligatoire)
- Email

*Mobile Money (pour les versements) :*
- Numéro de téléphone Mobile Money
- Opérateur (MTN Mobile Money, Orange Money, Express Union)

*Catégorie d'activité :*
- Sélection dans la liste des catégories actives

À la soumission, le dossier passe en statut **PENDING**. Le prestataire voit un message de confirmation et ne peut pas soumettre un second dossier.

---

### Validation des prestataires (Admin)

**Page admin :** `/admin/marketplace/providers`

L'admin voit la liste de tous les prestataires avec filtres par statut et recherche textuelle.

**Actions disponibles par prestataire :**

| Action | Effet |
|---|---|
| **Valider** | Passe le statut à ACTIVE, définit le taux de commission |
| **Suspendre** | Passe le statut à SUSPENDED (le prestataire ne peut plus opérer) |
| **Rejeter** | Passe le statut à SUSPENDED avec une note interne explicative |
| **Modifier** | Met à jour le taux de commission et les notes internes |

Les notes internes admin ne sont jamais visibles par le prestataire.

---

### Frais d'activation (Admin)

**Accessible depuis :** bouton "Définir frais" sur la fiche prestataire

L'admin définit les frais d'activation pour chaque prestataire :
- **Montant de base** (en XAF)
- **Remise (%)** : optionnelle, le montant final est calculé automatiquement
- **Notes** : précisions sur les modalités de paiement

`Montant final = Montant de base × (1 - remise / 100)`

**Suivi du paiement :**
Les frais d'activation ont un statut **PENDING** ou **PAID**. L'admin peut marquer les frais comme payés en un clic depuis la liste des prestataires. La date de paiement est enregistrée automatiquement.

Les frais d'activation sont **uniques** : ils ne sont définis qu'une seule fois par prestataire. L'admin peut modifier les montants tant que le statut est PENDING.

---

## Architecture technique

### Structure des fichiers

```
features/feature-marketplace/
├── domain/types/
│   └── marketplace.ts              ← Types TypeScript purs (interfaces, enums, DTOs)
├── infrastructure/repositories/
│   ├── categoryRepository.ts       ← Accès base de données catégories (Prisma)
│   └── providerRepository.ts       ← Accès base de données prestataires (Prisma)
└── application/services/
    ├── categoryService.ts           ← Logique métier catégories
    └── providerService.ts           ← Logique métier prestataires
```

**Pattern Repository Factory** : chaque service crée et détruit son instance Prisma de façon autonome. Les transactions multi-tables utilisent `prisma.$transaction()`.

### Routes API

#### Publiques (accessible à tous)
| Méthode | URL | Description |
|---|---|---|
| `GET` | `/api/marketplace/categories` | Liste des catégories actives |

#### Prestataire connecté
| Méthode | URL | Description |
|---|---|---|
| `GET` | `/api/marketplace/provider/register` | Vérifie si l'utilisateur a déjà un profil prestataire |
| `POST` | `/api/marketplace/provider/register` | Soumet le dossier d'inscription |

#### Admin uniquement
| Méthode | URL | Description |
|---|---|---|
| `GET` | `/api/admin/marketplace/categories` | Liste toutes les catégories |
| `POST` | `/api/admin/marketplace/categories` | Crée une catégorie |
| `GET` | `/api/admin/marketplace/categories/[id]` | Détail d'une catégorie |
| `PATCH` | `/api/admin/marketplace/categories/[id]` | Modifie une catégorie |
| `DELETE` | `/api/admin/marketplace/categories/[id]` | Supprime une catégorie |
| `GET` | `/api/admin/marketplace/providers` | Liste les prestataires (filtres : statut, catégorie, recherche) |
| `GET` | `/api/admin/marketplace/providers/[id]` | Détail d'un prestataire |
| `PATCH` | `/api/admin/marketplace/providers/[id]` | Action : activate / suspend / reject / update |
| `GET` | `/api/admin/marketplace/providers/[id]/activation` | Récupère les frais d'activation |
| `POST` | `/api/admin/marketplace/providers/[id]/activation` | Crée ou met à jour les frais d'activation |
| `PATCH` | `/api/admin/marketplace/providers/[id]/activation` | Met à jour le statut de paiement |

### Modèle de données (base de données)

```
MarketplaceCategory
  id, name, description, slug (unique), imageUrl
  isActive, displayOrder
  → relations : providers[], products[]

Provider
  id, userId (→ User), categoryId (→ MarketplaceCategory)
  status : PENDING | ACTIVE | SUSPENDED
  companyName, companyAddress, companyCity, companyPhone, companyEmail, companyDescription
  repName, repPhone, repEmail
  mobileMoneyNumber, mobileMoneyOperator
  commissionRate (défaut 10%)
  adminNotes (privé)
  → relations : activation?, products[], assignedOrders[], providerInvoices[]

ProviderActivation
  id, providerId (→ Provider)
  baseAmount, discountPct, finalAmount
  status : PENDING | PAID
  paidAt?, notes

ProviderProduct
  id, providerId (→ Provider), categoryId (→ MarketplaceCategory)
  name, description, price, currency, imageUrl, conditions
  isActive

MarketplaceOrder
  id, clientId (→ User)
  status : PENDING_PAYMENT | PAID | ASSIGNED | IN_PROGRESS | DELIVERED | CANCELLED | REFUNDED
  orderType : RECENT_DEATH | COMMEMORATION
  totalAmount, currency, paymentMethod, paymentReference, paidAt
  announcementId? (→ Announcement)
  deceasedName?, clientInstructions?
  assignedProviderId? (→ Provider)
  assignedAt?, assignmentNote?
  → relations : items[], invoices[]

MarketplaceOrderItem
  id, orderId (→ MarketplaceOrder), productId (→ ProviderProduct)
  productName, productPrice, quantity, subtotal

MarketplaceInvoice
  id, orderId (→ MarketplaceOrder), providerId? (→ Provider)
  type : CLIENT | PROVIDER
  invoiceNumber (unique), totalAmount
  commissionAmount?, providerAmount?
  status : PENDING | PAID
  paidAt?, pdfUrl?, issuedAt
```

---

## Pages existantes

| URL | Accès | Description |
|---|---|---|
| `/register` | Public | Création de compte utilisateur standard |
| `/login` | Public | Connexion |
| `/marketplace/become-provider` | Utilisateur connecté | Formulaire d'inscription prestataire |
| `/admin/marketplace/categories` | Admin | Gestion des catégories |
| `/admin/marketplace/providers` | Admin | Liste et gestion des prestataires |

---

## Ce qui reste à développer

### Bug à corriger
- À l'activation d'un prestataire, le champ `User.role` doit passer à `PROVIDER` (actuellement seul `Provider.status` change)

### Phase 2 — Catalogue produits / services
- Espace prestataire : dashboard, gestion des produits/services (créer, modifier, activer/désactiver)
- Affichage public des produits par catégorie (sans révéler l'identité du prestataire)
- Recherche et filtrage des produits

### Phase 3 — Commandes et paiements
- Panier client
- Tunnel de commande avec saisie des instructions et nom du défunt
- Intégration paiement Mobile Money et carte bancaire
- Paiement 100 % à l'avance
- Confirmation de commande par email
- Interface admin d'assignation manuelle des commandes aux prestataires

### Phase 4 — Facturation et reporting
- Génération de la facture client (PDF téléchargeable)
- Génération de la facture prestataire avec décomposition : montant brut / commission CM / montant net
- Changement de statut manuel des factures prestataires par l'admin (versement effectué)
- Reporting admin : chiffre d'affaires total, commissions perçues, versements effectués, par période
- Reporting prestataire : commandes reçues, CA, commissions déduites, net reçu, par période

---

## Règles métier importantes

1. **Anonymat des prestataires** : les clients ne voient jamais le nom, les coordonnées ni aucune information identifiant un prestataire. CameronMemoria est l'unique interlocuteur.
2. **Frais d'activation uniques** : un prestataire ne paie les frais d'activation qu'une seule fois, à son entrée sur la plateforme.
3. **Paiement intégral à l'avance** : le client règle 100 % du montant au moment de la commande. CameronMemoria conserve les fonds jusqu'au versement au prestataire.
4. **Assignation manuelle** : l'admin choisit lui-même quel prestataire exécute chaque commande. Il n'y a pas d'attribution automatique.
5. **Versement manuel** : CameronMemoria transfère les fonds au prestataire hors plateforme (virement Mobile Money). L'admin change ensuite le statut de la facture prestataire à PAID manuellement.
6. **Commission variable** : le taux de commission est défini par l'admin et peut différer d'un prestataire à l'autre.
