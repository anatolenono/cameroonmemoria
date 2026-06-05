# CLAUDE.md

## Project Overview

Cameroon Memoria — a Next.js platform for obituary announcements targeting the Cameroonian community (domestic and diaspora). Redesign of [cameroonmemoria.com](https://www.cameroonmemoria.com).

**Key features:** Obituary announcements, donations (Stripe/PayPal/Mobile Money), condolences, role-based access, multilingual (FR/EN), mobile-first, marketplace de prestations funéraires.

**User types:** Administrators, Registered Users, Providers (PROVIDER role), Anonymous Visitors (view only).

## Commands

```bash
pnpm dev            # Dev server (Turbopack)
pnpm build          # Production build (Prisma generate + migrate + Next.js)
pnpm build:dev      # Simple dev build
pnpm build:ci       # CI build
pnpm start          # Production server
pnpm lint           # ESLint
pnpm auth:migrate   # better-auth migrations
pnpm db:seed:admin  # Seed admin user
pnpm db:reset       # Reset DB and reseed
pnpm prepare-ci     # Generate Prisma client for CI
```

## Architecture

Clean Architecture by feature domains:

```
app/                       # Next.js App Router (routes, API)
features/                  # Feature domains
├── feature-auth/          # Authentication
├── feature-announcement/  # Announcements
├── feature-condolence/    # Condolences
├── feature-transaction/   # Transactions
├── feature-wallet/        # Wallet
└── feature-marketplace/   # Marketplace (prestataires, catégories, commandes)
components/                # Shared UI (ui/, layout/, data/, feedback/)
core/                      # Shared system elements
lib/                       # Utilities and configs
hooks/                     # Custom React hooks
prisma/                    # Schema, migrations, seeds
docs/                      # Documentation fonctionnelle
```

Each feature: `domain/ -> application/ -> infrastructure/ -> presentation/`

## Tech Stack

- **Framework**: Next.js 15.3.2 (App Router, Turbopack)
- **Language**: TypeScript (strict)
- **Database**: PostgreSQL + Prisma 6.7.0
- **Auth**: better-auth (not NextAuth)
- **UI**: TailwindCSS v4 + shadcn/ui
- **State**: Zustand
- **Forms**: React Hook Form + Zod
- **Storage**: Minio (S3-compatible, lazy init — app starts without it)
- **Payments**: Stripe, PayPal, Mobile Money

## Database Schema

Prisma schema organized by domains:
- **Users**: User, Profile, Role (USER, ADMIN, MODERATOR, PROVIDER)
- **Announcements**: Announcement, Media, AnnouncementType, AnnouncementStatus
- **Finance**: Wallet, Transaction (double-entry), Donation
- **Interactions**: Condolence (requires approval), Offering (flower/candle)
- **Banners**: BannerPreset (COLOR, GRADIENT, PHOTO)
- **Marketplace**: MarketplaceCategory, Provider, ProviderActivation, ProviderProduct, MarketplaceOrder, MarketplaceOrderItem, MarketplaceInvoice

## Docker Services (optionnel — installation locale possible sans Docker)

```bash
docker-compose up -d
```
- PostgreSQL :5432 (postgres/postgres/cameroonmemoria)
- Minio API :9000, Console :9001 (minioadmin/minioadmin)
- PgAdmin :5050 (admin@cameroonmemoria.com/admin)

Installation locale sans Docker : PostgreSQL 18 + Node.js 24 + pnpm 11.5.0 installés directement.

## Environment Variables

Copy `.env.example` to `.env`: `DATABASE_URL`, `BETTER_AUTH_SECRET`, `MINIO_*`, payment provider keys.

## Code Conventions

- Clean Architecture separation of concerns
- TypeScript for all code, Zod for validation
- Functional components with hooks, shadcn/ui for UI
- Prisma for all DB operations, transactions for multi-table ops
- Next.js App Router API conventions with proper HTTP status codes
- Repository Factory pattern : chaque service instancie son propre PrismaClient et appelle `dispose()` dans un bloc `finally`

## Design Patterns

- **UI**: Cards with exposed actions, mobile-first, 2-col desktop / 1-col mobile
- **Data**: Hierarchical domain model
- **Payments**: Hybrid adapter pattern, Mobile Money priority
- **Finance**: Double-entry accounting with stored balance

## Marketplace

Voir la documentation complète : `docs/marketplace-documentation.md`

### Acteurs
- **Admin** : gère catégories, valide prestataires, fixe frais d'activation + commission, assigne commandes, marque factures payées
- **Prestataire** : s'inscrit via `/marketplace/become-provider` (après création de compte sur `/register`), crée son catalogue, consulte ses factures
- **Client** : commande des services, paie 100 % à l'avance, ne connaît jamais l'identité du prestataire

### Modèle économique
- Frais d'activation uniques (montant + remise % définis par l'admin)
- Commission % par commande (définie par l'admin, par prestataire, défaut 10 %)

### Pages existantes
| URL | Accès | Description |
|---|---|---|
| `/marketplace/become-provider` | Utilisateur connecté | Formulaire d'inscription prestataire |
| `/admin/marketplace/categories` | Admin | CRUD catégories |
| `/admin/marketplace/providers` | Admin | Liste, validation, frais d'activation |

### Routes API marketplace
| Méthode | URL | Description |
|---|---|---|
| `GET` | `/api/marketplace/categories` | Catégories actives (public) |
| `GET/POST` | `/api/marketplace/provider/register` | Vérifier / soumettre dossier prestataire |
| `GET/POST` | `/api/admin/marketplace/categories` | Liste / créer catégorie |
| `GET/PATCH/DELETE` | `/api/admin/marketplace/categories/[id]` | Détail / modifier / supprimer |
| `GET` | `/api/admin/marketplace/providers` | Liste prestataires |
| `GET/PATCH` | `/api/admin/marketplace/providers/[id]` | Détail / action (activate, suspend, reject) |
| `GET/POST/PATCH` | `/api/admin/marketplace/providers/[id]/activation` | Frais d'activation |

### Ce qui reste à développer (marketplace)
- [x] **Bug fix** : à l'activation, mettre `User.role` à `PROVIDER` (DONE in Phase 3 seed)
- [ ] **Phase 2** : espace prestataire (dashboard, catalogue produits), vitrine publique
- [x] **Phase 3** : panier client (Zustand + localStorage), tunnel commande, paiement, assignation admin (DONE — waiting on auth fix)
  - `hooks/useCart.ts` — cart management with localStorage persistence
  - `features/feature-marketplace/infrastructure/repositories/orderRepository.ts` — order CRUD with transactions
  - `features/feature-marketplace/application/services/orderService.ts` — order service
  - `app/api/marketplace/orders/route.ts` — POST order creation, GET user orders
  - `app/api/admin/marketplace/orders/[id]/route.ts` — PATCH to assign orders to providers
  - `app/marketplace/cart/page.tsx` — shopping cart + order creation UI
  - `app/marketplace/orders/page.tsx` — user order list
  - `app/marketplace/orders/[id]/page.tsx` — order detail
  - `app/admin/marketplace/orders/page.tsx` — admin order management
  - **Blocked by**: Login issue with test accounts (see Critical section above)
- [ ] **Phase 4** : génération factures PDF, reporting admin et prestataire

## Pending Tasks

### Critical — Marketplace Authentication Issue (Jun 2026)
**BLOCKER: Test accounts cannot login despite proper database creation**
- Created 3 test accounts via `prisma/seeds/test-accounts.ts`:
  - `user@example.com` / `password123` (USER role)
  - `admin@example.com` / `admin123` (ADMIN role)
  - `provider@example.com` / `provider123` (PROVIDER role, ACTIVE)
- All accounts verified in database: User records exist, Account table has credentials with provider='credential'
- **Problem**: Login returns `ERROR [Better Auth]: Invalid password` (401 UNAUTHORIZED)
- **Root cause**: Password hash mismatch — either:
  1. `createAccountCredentials()` in `prisma/seeds/utils.ts` not hashing passwords correctly for better-auth
  2. better-auth expecting different hash format on login attempt
  3. emailVerified=false blocking authentication
- **Next steps**: Check password hashing implementation in `prisma/seeds/utils.ts`, may need to use better-auth's built-in password hashing API instead of custom hash function
- Run `tsx prisma/seeds/debug.ts` to verify account state anytime

### Critical (Feb 2026)
- [ ] Fix login issue preventing announcement publishing
- [ ] Fix announcement editing and submission bugs
- [x] Phone number account creation
- [ ] Google OAuth
- [ ] Facebook OAuth
- [ ] Password reset

### Search & Display
- [x] Location and date-based filtering
- [x] Chronological ordering (newest first)
- [x] Home page carousel/scrolling

### Features
- [ ] Predefined images for missing photos
- [x] Virtual offerings (flowers, candles)
- [ ] French/English i18n
- [ ] Wallet withdrawal system
- [ ] Export announcements (Excel/CSV)
- [ ] Form date validation rules
- [ ] Default banner images
- [ ] Birth location and title fields

### Privacy
- [ ] Hide relationship field from public view
- [ ] Remove view count display
