# Flexible Architecture Notes

## Goal

The portal should be easy to extend without rewriting the home page, dashboards or assistant layer.

The main flexibility point is:

```text
src/lib/config/site-modules.ts
```

Each module describes:

- public route or dashboard route;
- navigation group;
- enabled state;
- feature flags;
- AI capabilities;
- short module description.

This allows the project to grow from MVP into a larger product with controlled feature rollout.

## How To Add A New Public Module

1. Add module definition to `siteModules`.
2. Create route or page section.
3. Add icon mapping in `src/app/page.tsx` if it appears on the landing page.
4. Add Firestore collection if the module owns data.
5. Add AI capability to `src/lib/ai/site-context.ts`.
6. Add an external webhook integration only if external automation is required.

Example:

```ts
{
  id: "clan",
  label: "Clan Hub",
  route: "/clan",
  navGroup: "user",
  enabled: true,
  featureFlags: ["roster", "bossPlanner", "memberStats"],
  aiCapabilities: ["planClanBossKeys", "findMissingRoles"],
  description: "Clan coordination, schedules and boss planning."
}
```

## User Dashboard Creative Direction

The user cabinet is designed as `Player Sanctum`, not a plain account page.

Current blocks:

- `Commander Profile`: weekly focus and resonance score.
- `Activity Stats`: compact player behavior summary.
- `Recommended Donation`: AI-like package recommendation based on interests.
- `Crypto Vault`: BTC/USDT payment addresses and pending invoice.
- `Top-up History`: visible request lifecycle.
- Quick access to chat and Hero DB.

Future additions:

- personalized raid plan for the week;
- arena speed audit;
- favorite heroes;
- watched marketplace accounts;
- notification center;
- payment proof upload.

## Admin Dashboard Creative Direction

The admin cabinet is designed as `Admin War Room`.

Current blocks:

- `Pulse`: lead, moderation, hero DB and CRM status.
- `Content Forge`: news, hero calendar and Hero DB content pipeline.
- `Moderation Radar`: prioritized chat/forum queue.
- External automation hooks are optional and should be configured through server-side environment variables.
- `CRM Tables`: external operations sync status.

Future additions:

- drag-and-drop hero calendar;
- markdown news editor;
- hero gallery uploader;
- chat moderation timeline;
- manager SLA board;
- CRM table preview;
- AI content draft panel.

## AI-Ready Layer

Use:

```text
src/lib/ai/site-context.ts
```

This file gives an assistant enough context to map user language to direct actions.

Example:

```json
{
  "query": "Найди аккаунт с Арбитром и void героями",
  "action": "filterAccounts",
  "payload": {
    "heroName": "Arbiter",
    "hasVoid": true
  }
}
```

The assistant should never infer database names from UI text. It should use `siteContext.assistantActions`.

## Feature Flags

Feature flags are currently static strings in config. Later they can move into:

- Firestore `featureFlags/{flagId}`;
- Remote Config;
- admin-only settings page.

Suggested flag structure:

```ts
{
  key: "marketplace.accountReservation",
  enabled: true,
  rollout: "all | admin | percentage",
  updatedAt: Timestamp
}
```
