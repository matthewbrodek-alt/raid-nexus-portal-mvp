# n8n Setup Guide

Workflow file:

```text
n8n/workflows/raid-portal-automation.json
n8n/workflows/raid-portal-topup-telegram-bitrix.json
n8n/workflows/raid-crm-sync-bitrix.json
```

Use only one top-up workflow in n8n. `raid-portal-automation.json` and `raid-portal-topup-telegram-bitrix.json` contain the same top-up logic; the second name is clearer for import.

`raid-crm-sync-bitrix.json` is a separate CRM utility workflow for contact/lead sync actions.

## What The Top-up Workflow Does

1. Receives a top-up lead from the portal webhook.
2. Normalizes payload fields: Telegram, package, payment method, comment and user id.
3. Detects crypto payments and attaches BTC or USDT wallet data.
4. Routes crypto and manager-assisted payments through separate branches.
5. Creates a Bitrix CRM lead through the incoming Bitrix webhook method `crm.lead.add.json`.
6. Sends a Telegram notification to the manager with lead and Bitrix result.
7. Returns JSON to the portal with `leadId`, `status`, optional wallet and optional Bitrix lead id.

Firestore writes are handled by the Next.js portal before the n8n webhook call. The n8n workflow intentionally does not use Firestore REST, Google OAuth or Firebase Admin credentials.

## What The CRM Sync Workflow Does

`raid-crm-sync-bitrix.json` receives POST requests at `raid/crm-sync` and routes them by `action`:

- `contact.create` or `signup`: creates a Bitrix contact.
- `contact.update` or `update`: updates a Bitrix contact by `bitrixId` or `bitrix_id`.
- `lead.create` or `lead`: creates a Bitrix lead.

Unsupported actions return a JSON error response instead of silently doing nothing.

## Import

1. Open n8n.
2. Go to **Workflows**.
3. Select **Import from File**.
4. Choose `n8n/workflows/raid-portal-topup-telegram-bitrix.json`.
5. Save the workflow.
6. Open each credential-backed node and select your real credentials.
7. Activate the workflow.

For the extra CRM sync endpoint, repeat the import with `n8n/workflows/raid-crm-sync-bitrix.json`.

## Required n8n Environment Variables

Set these in n8n hosting environment:

```bash
RAID_MANAGER_TELEGRAM_CHAT_ID=123456789
RAID_BTC_WALLET=bc1q-your-real-wallet
RAID_USDT_TRC20_WALLET=TYourRealUsdtWallet
RAID_BITRIX_LEAD_WEBHOOK_URL=https://your-company.bitrix24.com/rest/1/webhook-code/crm.lead.add.json
RAID_BITRIX_CONTACT_ADD_WEBHOOK_URL=https://your-company.bitrix24.com/rest/1/webhook-code/crm.contact.add.json
RAID_BITRIX_CONTACT_UPDATE_WEBHOOK_URL=https://your-company.bitrix24.com/rest/1/webhook-code/crm.contact.update.json
```

If you do not use the separate CRM sync workflow, the contact add/update variables are not required.

## Required Credentials

### Telegram

Create a Telegram Bot API credential in n8n:

1. Create bot through BotFather.
2. Copy token.
3. In n8n, create **Telegram API** credential.
4. Replace placeholder credential in node `Telegram - Notify Manager`.

## Portal Environment Variables

In `.env.local` set:

```bash
N8N_TOPUP_WEBHOOK_URL=https://your-n8n-domain/webhook/raid/topup-lead
```

The top-up route sends the lead only to `N8N_TOPUP_WEBHOOK_URL`. The top-up n8n workflow then handles Telegram and Bitrix.

The separate CRM sync workflow has its own n8n webhook path `raid/crm-sync`. Do not connect it to the top-up route unless you intentionally add a separate server route for contact sync.

For local n8n testing:

```bash
N8N_TOPUP_WEBHOOK_URL=http://localhost:5678/webhook-test/raid/topup-lead
```

## Request Payload From Portal

```json
{
  "uid": "firebase-uid-or-guest",
  "telegram": "@player",
  "packageId": "arena-forge-pack",
  "paymentMethod": "usdt",
  "comment": "Need manager confirmation"
}
```

## Expected Response

```json
{
  "ok": true,
  "leadId": "lead_1778280000000",
  "status": "waiting_crypto_payment",
  "wallet": "TYourRealUsdtWallet"
}
```

## Portal Firestore Target Document

```text
topupLeads/{leadId}
```

Fields written by the Next.js portal before calling n8n:

- `telegram`
- `packageId`
- `paymentMethod`
- `status`
- `source`
- `createdAt`

## Bitrix CRM Mapping

Top-up nodes `Bitrix - Create Crypto Lead` and `Bitrix - Create Manager Lead` send this body to `RAID_BITRIX_LEAD_WEBHOOK_URL`:

```json
{
  "fields": {
    "TITLE": "Raid Nexus: arena-forge-pack",
    "NAME": "@player",
    "SOURCE_ID": "WEB",
    "STATUS_ID": "NEW",
    "COMMENTS": "Lead: lead_1778280000000\nTelegram: @player\nPackage: arena-forge-pack\nPayment: usdt\nInvoice: waiting_crypto_payment\nComment: Need manager confirmation"
  },
  "params": {
    "REGISTER_SONET_EVENT": "Y"
  }
}
```

If Bitrix needs another lead field, edit only nodes `Bitrix - Create Crypto Lead` and `Bitrix - Create Manager Lead`.

For the CRM sync workflow:

- node `Bitrix - Create Contact` uses `RAID_BITRIX_CONTACT_ADD_WEBHOOK_URL`;
- node `Bitrix - Update Contact` uses `RAID_BITRIX_CONTACT_UPDATE_WEBHOOK_URL`;
- node `Bitrix - Create CRM Lead` uses `RAID_BITRIX_LEAD_WEBHOOK_URL`.

Example contact create payload:

```json
{
  "action": "contact.create",
  "uid": "firebase-uid",
  "name": "Player Name",
  "email": "player@example.com",
  "phone": "+10000000000",
  "telegram": "@player",
  "comment": "Registered from portal"
}
```

Example contact update payload:

```json
{
  "action": "contact.update",
  "bitrixId": "123",
  "name": "Updated Player Name",
  "telegram": "@player"
}
```

## Security Notes

- Do not expose the Bitrix incoming webhook URL in the Next.js frontend.
- Store the Bitrix webhook only in n8n as `RAID_BITRIX_LEAD_WEBHOOK_URL`.
- Store contact add/update Bitrix webhook URLs only in n8n as `RAID_BITRIX_CONTACT_ADD_WEBHOOK_URL` and `RAID_BITRIX_CONTACT_UPDATE_WEBHOOK_URL`.
- Do not expose n8n webhook URLs with `NEXT_PUBLIC_`; the portal calls `/api/n8n/topup`, and that server route forwards to n8n.
- Keep wallets in n8n environment variables or protected admin settings.
- The Firestore node was removed from n8n because the portal already writes lead data to Firestore.
- Restrict CORS on the webhook to your real portal domain before production.
- Add rate limiting either in n8n, reverse proxy or Next.js API wrapper.
