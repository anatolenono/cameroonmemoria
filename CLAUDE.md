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
  - **Blocked by**: Login issue (see Critical section above)
- [ ] **Phase 4** : génération factures PDF, reporting admin et prestataire

## Settings Admin Page (Jun 5 2026 - DONE)
**Runtime configuration management via database**
- Files created:
  - `prisma/schema.prisma` — Setting model with encrypted field support
  - `features/feature-settings/domain/types/setting.ts` — Setting interfaces & DTOs
  - `features/feature-settings/infrastructure/repositories/settingRepository.ts` — CRUD operations
  - `features/feature-settings/application/services/settingsService.ts` — Business logic
  - `app/admin/settings/page.tsx` — Admin UI (client component)
  - `app/api/admin/settings/route.ts` — GET all, POST create/update (requires ADMIN)
  - `app/api/admin/settings/[key]/route.ts` — DELETE by key (requires ADMIN)
  - `app/admin/layout.tsx` — Added Settings menu item
  - `prisma/seeds/admin.ts` — Fixed password hash override bug
- **Pending**: Test Settings CRUD after login is fixed; configure Stripe/MoMo sandbox credentials

## Pending Tasks

### Login & Deployment (Jun 9 2026 - RESOLVED ✅)

**Status: All working! App deployed on VPS at http://94.247.177.10:3000**

#### Root Cause of Login Failure
- **Problem**: Frontend login redirected to `localhost:3000` instead of VPS IP
- **Cause**: `NEXT_PUBLIC_APP_URL` environment variable was empty in `.env`
- **Where it matters**: `core/infrastructure/auth/auth.ts` line 13-14:
  ```typescript
  baseURL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  ```
  This variable gets baked into client code at **build time** (Next.js public vars), so it MUST be set before building
- **Fix applied**: Set `NEXT_PUBLIC_APP_URL=http://94.247.177.10:3000` in `.env` before running `pnpm build`

#### Test Accounts (All Verified ✅)
| Email | Password | Role | Purpose |
|---|---|---|---|
| `admin@africamemoria.com` | `asdaRe11naA` | ADMIN | Main admin account |
| `admin@example.com` | `admin123` | ADMIN | Test admin |
| `user@example.com` | `password123` | USER | Regular user |
| `provider@example.com` | `provider123` | PROVIDER | Marketplace provider |

All accounts:
- Have `emailVerified=true` in database
- Have hashed credentials via `better-auth` credential provider
- Can log in via both API (`/api/auth/sign-in/email`) and frontend form

#### Build Memory Issues (Jun 8-9 2026 - Resolved)
- **Problem**: `Next.js build worker exited with code: null and signal: SIGKILL`
- **Cause**: Insufficient RAM (1.8 GB total, only 366-444 MB free)
- **Workaround**: Stop PostgreSQL temporarily during build to free RAM
  ```bash
  sudo systemctl stop postgresql
  pnpm build
  sudo systemctl start postgresql
  ```
- **Better solution**: Stop TamTamFoot app that was sharing resources (not running after restart)

## VPS Deployment (Jun 9 2026 - LIVE ✅)

**Server Details:**
- Hostname: `v71234.webmo.fr`
- IP: `94.247.177.10`
- User: `anno`
- SSH Key: `C:\Users\no_ka\vps_tamtamfoot_new` (Ed25519, passphrase: `sapristti`)
- Root password: `SaperlipopetteX` (SSH key auth only, no password auth)
- Sudo password: `Nathis!007`

**Stack:**
- OS: Debian 12
- Node.js: v22.22.3
- pnpm: 11.5.0
- PostgreSQL: 15 (running since May 15, active)
- Process Manager: PM2 v7.0.1
- Access: `http://94.247.177.10:3000`

**Project Location:**
```bash
/home/anno/projects/cameroonmemoria
```

**Database:**
- Name: `cameroonmemoria`
- User: `cameroonmemoria`
- Password: `gR5ccq4qW5gQEq`
- Host: `localhost:5432`
- Status: ✅ Initialized (all Prisma tables created, migrations applied)

**Critical Environment Variables in `.env`:**
```bash
# MUST match VPS IP or domain for frontend auth to work
NEXT_PUBLIC_APP_URL=http://94.247.177.10:3000

# Database
DATABASE_URL=postgresql://cameroonmemoria:gR5ccq4qW5gQEq@localhost:5432/cameroonmemoria

# Auth secret (keep as-is)
BETTER_AUTH_SECRET=XSIGKiFU9CUhnEvnRG1Y2oykhvbWo81D

# Default admin account
ADMIN_EMAIL=admin@africamemoria.com
ADMIN_PASSWORD=asdaRe11naA
```

**⚠️ IMPORTANT:** If `NEXT_PUBLIC_APP_URL` changes (new IP/domain):
1. Update `.env`
2. Run `pnpm build` (rebuilds client-side auth config)
3. Restart with `pm2 restart cameroonmemoria`

### Quick Start (Next Time)

**1. SSH to VPS:**
```bash
ssh -i C:\Users\no_ka\vps_tamtamfoot_new anno@94.247.177.10
# Passphrase: sapristti
```

**2. Typical startup sequence (Most Common Path):**
```bash
# Check if already running
pm2 list

# If already running, done! Access at http://94.247.177.10:3000
# If not running or stuck, do full restart:
sudo ss -lntp | grep 3000              # Check for orphaned processes
sudo kill -9 <PID>                     # Kill if found
pm2 delete all
cd /home/anno/projects/cameroonmemoria
pm2 start "pnpm start" --name cameroonmemoria
pm2 save
pm2 logs cameroonmemoria --lines 30    # Verify it started
```

**3. Management commands:**
```bash
# Check status
pm2 status
pm2 logs cameroonmemoria --lines 50

# Restart
pm2 restart cameroonmemoria

# Stop
pm2 stop cameroonmemoria

# Full cleanup and restart
pm2 delete cameroonmemoria
pm2 start "pnpm start" --name cameroonmemoria --cwd /home/anno/projects/cameroonmemoria
pm2 save
```

**4. Monitor in real-time:**
```bash
pm2 logs cameroonmemoria      # Follow logs
pm2 monit                      # System monitoring (Ctrl+C to exit)
```

**5. Verify it's working:**
- Browser: `http://94.247.177.10:3000`
- Try login: `user@example.com` / `password123`
- Check console for any `localhost:3000` errors (means NEXT_PUBLIC_APP_URL issue)

### Deployment Checklist

- [x] Node.js installed (v22.22.3)
- [x] pnpm installed (11.5.0)
- [x] PostgreSQL 15 running and accepting connections
- [x] `.env` configured with `DATABASE_URL` and `BETTER_AUTH_SECRET`
- [x] `node_modules` installed (`pnpm install`)
- [x] Next.js build exists (`.next/`)
- [x] Prisma migrations applied (all tables created)
- [x] App running via PM2 on port 3000
- [ ] Nginx/Caddy reverse-proxy configured (optional, currently direct access)
- [ ] Domain SSL certificate configured (optional)
- [ ] Payment providers configured (Stripe, PayPal, Mobile Money keys in `.env`)
- [ ] Email provider configured (SMTP or Resend)
- [ ] Minio storage configured (optional, app starts without it)

### Troubleshooting

**App not responding on port 3000 (EADDRINUSE error):**

The most common issue is an orphaned `next-server` process holding the port. PM2 cleanup doesn't always kill these.

```bash
# Step 1: Identify process using port 3000
sudo ss -lntp | grep 3000

# Step 2: Kill the orphan process by PID
sudo kill -9 <PID>

# Step 3: Clean and restart
pm2 delete all
cd /home/anno/projects/cameroonmemoria
pm2 start "pnpm start" --name cameroonmemoria
pm2 save
```

If multiple processes are holding the port (force kill all):
```bash
sudo fuser -k 3000/tcp
```

**Database connection issues:**
```bash
psql -U cameroonmemoria -d cameroonmemoria -h localhost -c "\dt"
# Password: gR5ccq4qW5gQEq
```

**PM2 process repeatedly crashing (exit code 1):**
- Check logs: `pm2 logs cameroonmemoria --lines 100`
- Common causes:
  1. Port already in use (see above)
  2. Database not running: `sudo systemctl status postgresql`
  3. Build artifacts missing: Run `pnpm build` again
  4. Missing `.env` variables: Check `DATABASE_URL` and `NEXT_PUBLIC_APP_URL`

**Authentication not working after deployment:**
- Verify `NEXT_PUBLIC_APP_URL` matches the VPS IP/domain
- Rebuild if changed: `pnpm build`
- Restart: `pm2 restart cameroonmemoria`
- Test with curl first:
  ```bash
  curl -X POST http://94.247.177.10:3000/api/auth/sign-in/email \
    -H "Content-Type: application/json" \
    -d '{"email":"user@example.com","password":"password123"}'
  ```

**SSH key issues:**
If decrypted key expires, re-decrypt:
```powershell
# On Windows:
ssh-keygen -p -N ' ' -P 'sapristti' -f 'C:\Users\no_ka\.ssh\vps_tamtamfoot'
```

### What's Working (Jun 9 2026) ✅
- **Authentication**: Login/signup working for all test accounts
- **Admin Dashboard**: Accessible at `/admin` (requires ADMIN role)
- **Marketplace Admin**: Category management (`/admin/marketplace/categories`)
- **Database**: All tables created, seed data populated
- **Session Management**: Cookies and authentication tokens working

### Known Limitations / To Do
- **Minio S3 Storage**: Optional, app starts without it (images will fail)
- **Payment Providers**: Not yet configured (Stripe, PayPal, Mobile Money sandbox keys needed)
- **Email**: Not configured (SMTP/Resend not set up)
- **Marketplace Phase 2**: Provider dashboard not yet built
- **SSL/HTTPS**: Currently running on HTTP (optional Nginx reverse proxy needed)

### VPS Access Notes
- **SSH**: Only accepts public key auth (password auth disabled on server)
- **Key decryption**: Ed25519 key is encrypted with aes256-ctr, passphrase `sapristti`
- **Direct access method**: SSH as user `anno`, then run commands directly on VPS (Claude Code cannot do SSH/SCP due to environment restrictions)

## Provider Role Refactoring (Jun 10 2026 - IN PROGRESS)

**Objective**: Separate PROVIDER role from USER role. Providers sell services via marketplace, not announcements. Implement provider dashboard for product/service management, order tracking, and revenue monitoring.

### Architecture Changes
- **Role-based UX**: Different navbar menus for USER vs PROVIDER
- **Wallet Deprecation**: PROVIDER users don't see wallet (USER only feature)
- **Marketplace Focus**: PROVIDER sees products/orders/revenue, not announcements/donations
- **Session Enhancement**: `better-auth` configured to expose `user.role` field to client

### Phase 1: Hide Wallet for PROVIDER ✅ (DONE - Jun 9 2026)
**Status**: Deployed to VPS, tested working

**Changes**:
- Modified `components/navbar.tsx`:
  - Added `isProvider` computed from `(session.user as any)?.role === 'PROVIDER'`
  - Hidden "Mon portefeuille" menu item for PROVIDER (desktop dropdown + mobile)
  
- Modified `app/profile/page.tsx`:
  - Hidden `<WalletSection />` component for PROVIDER users
  - Added check: `const isProvider = (session.user as any).role === 'PROVIDER'`

- Modified `app/profile/wallet/page.tsx`:
  - Added redirect to home (`/`) if user role is PROVIDER
  - Protects route from direct access

- Enhanced `core/infrastructure/auth/auth.ts`:
  - Added `user.additionalFields.role` configuration (optional field)
  - Makes `role` available in session through better-auth

**Files Modified**:
- `components/navbar.tsx` — Added role-based menu visibility
- `app/profile/page.tsx` — Hide wallet section for PROVIDER
- `app/profile/wallet/page.tsx` — Redirect PROVIDER to home
- `core/infrastructure/auth/auth.ts` — Expose role in session
- `lib/auth.d.ts` — (Attempted) Type augmentation (ultimately used `as any` cast with eslint-disable)

**Type Casting Note**: 
TypeScript's type system doesn't include `role` in better-auth's User type by default. Solution: Use `(session.user as any).role` with `// eslint-disable-next-line @typescript-eslint/no-explicit-any` comment. Avoided creating complex module declarations in favor of pragmatic casting.

### Phase 2: Provider Menu Adaptation ✅ (DONE - Jun 10 2026)
**Status**: Deployed to VPS, visual changes complete

**Changes**:
- Modified `components/navbar.tsx`:
  - **Desktop button**: Shows "Proposer mes services" (→ `/provider/products`) for PROVIDER instead of "Créer une annonce"
  - **Dropdown menu**: Conditional rendering based on `isProvider`:
    - **USER sees**: Profil, Mes annonces, Mon portefeuille, Mes donations
    - **PROVIDER sees**: Profil, Mes produits/services, Mes commandes, Mes revenus
  - **Mobile menu**: Same conditional logic applied to primary action button and user section

**Menu Structure for PROVIDER**:
```
Profile                    → /profile
Mes produits/services     → /provider/products (CRUD for ProviderProduct)
Mes commandes             → /provider/orders (View assigned MarketplaceOrder)
Mes revenus               → /provider/revenue (Stats, CA, earnings)
Se déconnecter
```

**Files Modified**:
- `components/navbar.tsx` — Role-based conditional rendering for all menu items

**Status**: Navigation menu visually complete. Backend pages not yet created.

### Phase 3: Provider Dashboard Pages (TODO - IN PROGRESS)
**Required pages**:
1. `/provider/products` — CRUD for ProviderProduct
   - List products/services with prices
   - Create new product/service
   - Edit existing product (name, description, price, category)
   - Delete product
   - Set commission rate per product (or use default from admin settings)

2. `/provider/orders` — View marketplace orders
   - List orders assigned to this provider
   - Show order status (PENDING, CONFIRMED, SHIPPED, DELIVERED, CANCELED)
   - Display items and customer info (without revealing customer identity — use order reference)
   - Filter by status

3. `/provider/revenue` — Financial dashboard
   - Total revenue (sum of paid invoices)
   - Total commissions deducted
   - Net earnings
   - Monthly breakdown/chart
   - Invoice list (link to `/provider/invoices` or embedded)

**Database Models Already Exist**:
- `ProviderProduct` — Service/product catalog (id, providerId, categoryId, name, description, price, image)
- `MarketplaceOrder` — Orders (id, customerId, providerId, status, totalAmount, createdAt)
- `MarketplaceOrderItem` — Items in order (id, orderId, productId, quantity, unitPrice)
- `MarketplaceInvoice` — Invoicing (id, orderId, providerId, amount, status: PENDING/PAID)

**APIs Available**:
- `GET /api/provider/me` — Current provider info
- `GET/POST /api/provider/products` — List/create products
- `GET/PATCH/DELETE /api/provider/products/[id]` — Product CRUD
- `GET /api/marketplace/orders` — (needs filter by providerId)
- `GET /api/marketplace/orders/[id]` — Order detail

**Next Steps**:
1. Create `/app/provider/layout.tsx` — Auth guard (require PROVIDER role)
2. Create `/app/provider/products/page.tsx` — Product list + CRUD forms
3. Create `/app/provider/orders/page.tsx` — Order list with filters
4. Create `/app/provider/revenue/page.tsx` — Financial dashboard
5. Create API endpoints for product/order retrieval with provider filtering
6. Test end-to-end: login as provider → manage products → check orders → view revenue

### Session & Authentication (Updated Jun 10 2026)

**better-auth Configuration** (`core/infrastructure/auth/auth.ts`):
```typescript
user: {
  additionalFields: {
    role: {
      type: 'string',
      required: false,  // Optional to allow signup without specifying role
    },
  },
},
```

**How role is exposed**:
1. User has `role` field in Prisma User model (default: 'USER')
2. better-auth includes it in session user object
3. Available in client components via `const { data: session } = useSession()`
4. Access via type cast: `(session.user as any).role`

**Test Accounts**:
Same 4 test accounts (user/admin/provider) can be used. Provider account gets role='PROVIDER' set during marketplace registration or directly in DB.

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
