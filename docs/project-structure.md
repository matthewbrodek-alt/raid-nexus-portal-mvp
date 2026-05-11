# Project File Structure

```text
raid-nexus-portal-mvp/
  .env.example
  .env.production.example
  .gitignore
  README.md
  firebase.json
  firestore.rules
  storage.rules
  docs/
    auth-admin-test-ru.md
    flexible-architecture.md
    firestore-schema.md
    github-vercel-deploy-ru.md
    deployment-and-operations-ru.md
    file-inventory.md
    n8n-setup.md
    project-structure.md
  n8n/
    workflows/
      raid-portal-automation.json
  next.config.ts
  package.json
  postcss.config.mjs
  scripts/
    build-champion-multipliers.ps1
  tailwind.config.ts
  tsconfig.json
  src/
    app/
      admin/
        page.tsx
      dashboard/
        page.tsx
      chat/
        page.tsx
      heroes/
        [heroId]/
          page.tsx
        page.tsx
      marketplace/
        page.tsx
      topup/
        page.tsx
      donate/
        page.tsx
      useful/
        page.tsx
      globals.css
      layout.tsx
      page.tsx
      robots.ts
      sitemap.ts
    components/
      admin/
        admin-user-management.tsx
      auth/
        auth-form-shell.tsx
        auth-provider.tsx
        login-form.tsx
        protected-route.tsx
        register-form.tsx
      calendar/
        action-calendar.tsx
      chat/
        chat-window.tsx
      dashboard/
        crypto-wallet-card.tsx
        dashboard-shell.tsx
        recommended-donation.tsx
        stat-card.tsx
      heroes/
        champion-multiplier-search.tsx
        hero-card.tsx
        hero-youtube.tsx
      layout/
        navigation.tsx
      market/
        market-filter.tsx
      topup/
        topup-lead-form.tsx
      tools/
        arena-boost-calculator.tsx
        speed-calc-form.tsx
      ui/
        glass-panel.tsx
    lib/
      ai/
        context.ts
        site-context.ts
      auth/
        role-utils.ts
        types.ts
      config/
        site-modules.ts
      data/
        champion-multipliers.ts
        dashboard.ts
        mock.ts
      firebase/
        client.ts
        collections.ts
        services.ts
      security/
        encryption.ts
      types.ts
```

## Suggested Routes For Next Iteration

```text
src/app/marketplace/page.tsx             # created
src/app/heroes/page.tsx                  # created
src/app/heroes/[heroId]/page.tsx         # created
src/app/(auth)/login/page.tsx
src/app/(auth)/register/page.tsx
src/app/dashboard/page.tsx              # created
src/app/dashboard/topups/page.tsx
src/app/dashboard/wallet/page.tsx
src/app/admin/page.tsx                  # created
src/app/admin/heroes/page.tsx
src/app/admin/news/page.tsx
src/app/admin/moderation/page.tsx
src/app/api/n8n/topup/route.ts
src/app/api/crm/tables/route.ts
```

## Component Boundaries

- `HeroCard`: display-only component for public hero cards and admin previews.
- `ChampionMultiplierSearch`: search-first damage multiplier table for Legendary/Mythical champions.
- `ChatWindow`: realtime chat shell; replace mock data with Firestore listeners.
- `ArenaBoostCalculator`: arena speed aura, Increase SPD and Turn Meter boost calculator without hardcoded champion database.
- `SpeedCalcForm`: isolated calculator state; can be moved to server validation later.
- `MarketFilter`: filter UI; can map directly into Firestore indexed queries.
- `ActionCalendar`: Hero-section promotions calendar; data should come from `heroCalendar`.

## AI Assistant Context Layer

`src/lib/ai/context.ts` exposes:

- `aiNavigationMap`: modules, routes, capabilities, query examples.
- `aiContextSnapshot`: current route, role, selected filters, active thread, top-up draft.
- `directQueryContract`: canonical payloads for assistant actions.

Example assistant mapping:

```json
{
  "userQuery": "Найди аккаунт с Арбитром",
  "intent": "filterAccounts",
  "payload": {
    "heroName": "Arbiter"
  }
}
```
      login/
        page.tsx
      register/
        page.tsx
