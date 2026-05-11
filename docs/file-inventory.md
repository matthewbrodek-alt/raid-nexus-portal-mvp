# File Inventory

`senior-full-stack-developer-mvp-raid` is the local Codex workspace folder for this project. The real project inside it is `Raid Nexus Portal MVP`.

## Root Files

```text
.env.example
```

Template for Firebase, n8n, CRM and crypto wallet environment variables.

```text
.env.production.example
```

Production environment variable template for domain deployment.

```text
.gitignore
```

Excludes `node_modules`, `.next`, local env files, logs and archives.

```text
README.md
```

Main project overview, setup instructions and documentation links.

```text
package.json
```

Project metadata, npm scripts and dependencies for Next.js, Tailwind, Firebase and Lucide.

```text
next.config.ts
```

Next.js config, including allowed image hosts.

```text
tsconfig.json
```

TypeScript config with strict mode and `@/*` path alias.

```text
tailwind.config.ts
```

Tailwind theme with dark fantasy colors, shadows and background gradients.

```text
postcss.config.mjs
```

PostCSS config for Tailwind and Autoprefixer.

```text
eslint.config.mjs
```

ESLint flat config for Next.js and TypeScript.

```text
next-env.d.ts
```

Next.js generated type declarations.

```text
firebase.json
```

Firebase rules deployment config for Firestore and Storage.

```text
firestore.rules
```

Firestore security rules for users, admin invites, dashboards, chat, content and CRM metadata.

```text
storage.rules
```

Firebase Storage rules for hero assets, chat uploads and user files.

```text
raid-nexus-portal-mvp.zip
```

Current clean archive of the project. It does not include `node_modules` or `.next`.

## Documentation

```text
docs/project-structure.md
```

Tree of project folders and suggested future routes.

```text
docs/firestore-schema.md
```

Firestore collections, field shapes, indexes and security rules draft.

```text
docs/flexible-architecture.md
```

How to extend modules, feature flags, dashboards and AI assistant actions.

```text
docs/n8n-setup.md
```

Step-by-step n8n import and environment setup guide.

```text
docs/deployment-and-operations-ru.md
```

Detailed Russian guide for operation, GitHub upload, Vercel deployment, domain DNS, Firebase and n8n.

```text
docs/file-inventory.md
```

This file. Explains every project file.

## n8n

```text
n8n/workflows/raid-portal-automation.json
```

Importable n8n workflow for top-up leads, Telegram manager notification, CRM sync and Firestore upsert.

## App Router

```text
src/app/layout.tsx
```

Root HTML layout, metadata and fonts.

```text
src/app/globals.css
```

Global Tailwind styles, dark theme base, glassmorphism helpers and selection styling.

```text
src/app/page.tsx
```

Short portal landing page with Hero section, action calendar and quick links to separate sections.

```text
src/app/topup/page.tsx
```

Compatibility alias for the donation page with manager lead form connected to the configured n8n webhook.

```text
src/app/donate/page.tsx
```

Main donation page with dark fantasy donation cards, approximate ruble prices, RU/EN-ready copy and n8n lead form.

```text
src/app/useful/page.tsx
```

Useful page with guides, news, the original speed calculator and the arena boost calculator.

```text
src/app/marketplace/page.tsx
```

Marketplace page with account cards and advanced filter shell.

```text
src/app/heroes/page.tsx
```

Hero DB catalog page with filters and links to hero detail pages.

```text
src/app/heroes/[heroId]/page.tsx
```

Hero detail page with stats, gallery placeholders and YouTube viewer under the hero block.

```text
src/app/chat/page.tsx
```

Dedicated chat/forum page.

```text
src/app/dashboard/page.tsx
```

User dashboard: activity stats, recommended donation, crypto wallet, top-up history and quick links.

```text
src/app/admin/page.tsx
```

Admin dashboard: content operations, moderation radar, CRM tables and n8n command chain.

```text
src/app/login/page.tsx
```

Firebase Auth email/password login page.

```text
src/app/register/page.tsx
```

Firebase Auth registration page with optional encrypted game account data.

```text
src/app/robots.ts
```

Robots metadata route for domain deployment.

```text
src/app/sitemap.ts
```

Sitemap metadata route for public pages and hero detail pages.

## Components

```text
src/components/ui/glass-panel.tsx
```

Reusable glassmorphism panel wrapper.

```text
src/components/layout/navigation.tsx
```

Responsive top navigation.

```text
src/components/calendar/action-calendar.tsx
```

Hero-section promotions calendar.

```text
src/components/admin/admin-user-management.tsx
```

Owner-only admin invitation form and active admin/invite overview.

```text
src/components/auth/auth-provider.tsx
```

Firebase Auth state provider. Creates user profiles and applies bootstrap owner/admin invites.

```text
src/components/auth/protected-route.tsx
```

Client-side route guard for dashboard and admin pages.

```text
src/components/auth/login-form.tsx
```

Login form using Firebase Auth.

```text
src/components/auth/register-form.tsx
```

Registration form using Firebase Auth and optional AES-GCM encrypted game data.

```text
src/components/auth/auth-form-shell.tsx
```

Shared visual shell for auth pages.

```text
src/components/heroes/champion-multiplier-search.tsx
```

Search-first Legendary/Mythical damage multiplier table. The full list is hidden until a user enters a champion name.

```text
src/components/heroes/hero-card.tsx
```

Reusable hero preview card for Hero DB.

```text
src/components/heroes/hero-youtube.tsx
```

YouTube embed component for hero detail pages.

```text
src/components/chat/chat-window.tsx
```

Realtime chat UI shell with emoji, attachment and thread actions.

```text
src/lib/data/champion-multipliers.ts
```

Generated dataset of Legendary and Mythical champion damage multipliers. Mythical champions include Base Form and Alternate Form skill rows when available.

```text
scripts/build-champion-multipliers.ps1
```

Data builder that refreshes `champion-multipliers.ts` from public champion guide pages and extracts only skills with `Damage Multiplier`.

```text
src/components/tools/arena-boost-calculator.tsx
```

Arena calculator for speed aura, Increase SPD and Turn Meter boosts. It intentionally avoids a hardcoded champion database.

```text
src/components/tools/speed-calc-form.tsx
```

PvP / Clan Boss speed calculator form.

```text
src/components/market/market-filter.tsx
```

Marketplace filter UI for Void, Legendary count and Level.

```text
src/components/topup/topup-lead-form.tsx
```

Client-side top-up lead form that posts to `NEXT_PUBLIC_N8N_TOPUP_WEBHOOK_URL`.

```text
src/components/dashboard/dashboard-shell.tsx
```

Shared shell for user and admin dashboard pages.

```text
src/components/dashboard/stat-card.tsx
```

Reusable dashboard stat card.

```text
src/components/dashboard/recommended-donation.tsx
```

AI-style recommended donation card.

```text
src/components/dashboard/crypto-wallet-card.tsx
```

BTC / USDT wallet payment panel.

## Lib

```text
src/lib/types.ts
```

Shared TypeScript types for events, heroes, marketplace accounts and AI navigation.

```text
src/lib/config/site-modules.ts
```

Config-driven module registry with routes, feature flags and AI capabilities.

```text
src/lib/ai/site-context.ts
```

AI-ready site context contract for assistant actions and state shape.

```text
src/lib/ai/context.ts
```

Current assistant context snapshot used on the home page.

```text
src/lib/data/mock.ts
```

Temporary public mock data for events, news, marketplace, heroes and chat.

```text
src/lib/data/dashboard.ts
```

Temporary mock data for user and admin dashboards.

```text
src/lib/firebase/client.ts
```

Firebase app, Auth, Firestore and Storage bootstrap.

```text
src/lib/firebase/collections.ts
```

Centralized Firestore collection names.

```text
src/lib/firebase/services.ts
```

Top-up lead helper that writes to Firestore and calls n8n webhook.

```text
src/lib/security/encryption.ts
```

AES-GCM helper for encrypted game account data.
