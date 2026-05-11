# n8n Setup Guide

Workflow file:

```text
n8n/workflows/raid-portal-automation.json
```

## What This Workflow Does

1. Receives a top-up lead from the portal webhook.
2. Normalizes payload fields: Telegram, package, payment method, comment and user id.
3. Detects crypto payments and attaches BTC or USDT wallet data.
4. Sends a Telegram notification to the manager.
5. Creates or updates the lead in CRM through HTTP API.
6. Upserts the lead into Firestore through the Firestore REST API.
7. Returns JSON to the portal with `leadId`, `status` and optional wallet.

## Import

1. Open n8n.
2. Go to **Workflows**.
3. Select **Import from File**.
4. Choose `n8n/workflows/raid-portal-automation.json`.
5. Save the workflow.
6. Open each credential-backed node and select your real credentials.
7. Activate the workflow.

## Required n8n Environment Variables

Set these in n8n hosting environment:

```bash
RAID_MANAGER_TELEGRAM_CHAT_ID=123456789
RAID_BTC_WALLET=bc1q-your-real-wallet
RAID_USDT_TRC20_WALLET=TYourRealUsdtWallet
RAID_CRM_LEADS_ENDPOINT=https://crm.example.com/api/leads
RAID_CRM_API_TOKEN=replace-me
RAID_FIREBASE_PROJECT_ID=your-firebase-project-id
```

## Required Credentials

### Telegram

Create a Telegram Bot API credential in n8n:

1. Create bot through BotFather.
2. Copy token.
3. In n8n, create **Telegram API** credential.
4. Replace placeholder credential in node `Telegram - Notify Manager`.

### Firestore REST

Recommended MVP path:

1. Create Google OAuth2 credential with Firestore access.
2. Enable Firestore API in Google Cloud.
3. Select the credential in node `Firestore - Upsert Lead`.

Production alternative:

- Use a small Cloud Function or Next.js API route as a secure Firestore proxy.
- n8n calls the proxy with a private token.
- The proxy writes to Firestore through Firebase Admin SDK.

## Portal Environment Variable

In `.env.local` set:

```bash
NEXT_PUBLIC_N8N_TOPUP_WEBHOOK_URL=https://your-n8n-domain/webhook/raid/topup-lead
```

For local n8n testing:

```bash
NEXT_PUBLIC_N8N_TOPUP_WEBHOOK_URL=http://localhost:5678/webhook-test/raid/topup-lead
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

## Firestore Target Document

```text
topupLeads/{leadId}
```

Fields written by workflow:

- `telegram`
- `packageId`
- `paymentMethod`
- `status`
- `source`
- `createdAt`

## CRM Mapping

The HTTP node sends:

```json
{
  "externalId": "lead_1778280000000",
  "telegram": "@player",
  "packageId": "arena-forge-pack",
  "paymentMethod": "usdt",
  "status": "waiting_crypto_payment"
}
```

If your CRM uses different fields, edit only node `CRM - Create Lead`.

## Security Notes

- Do not expose CRM tokens in the Next.js app.
- Keep wallets in n8n environment variables or protected admin settings.
- Prefer Firebase Admin SDK proxy for production Firestore writes.
- Restrict CORS on the webhook to your real portal domain before production.
- Add rate limiting either in n8n, reverse proxy or Next.js API wrapper.
