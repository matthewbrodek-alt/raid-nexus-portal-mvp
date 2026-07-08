# Raid Nexus Portal MVP

Next.js portal for Raid: Shadow Legends services: news, heroes, chat, raffle, user cabinet, internal order desk and admin tools.

## Stack

- Next.js App Router
- React 19
- TypeScript
- Tailwind CSS
- Firebase Auth and Firestore
- Cloudinary for uploaded media

## Local Start

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000`.

## Production Build

```bash
npm run build
npm run start
```

## Environment

Do not commit real secrets. Keep production values in Vercel Environment Variables.

Required for the core site:

- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `GAME_DATA_ENCRYPTION_KEY`

Optional:

- `TOPUP_WEBHOOK_URL` - external forwarding for order requests. If empty, requests stay inside the internal Firebase order desk.
- Social auth variables for Telegram, VK and Discord.

## Deploy Notes

Upload source files to GitHub, not an archive. Do not upload:

- `.env`
- `.env.local`
- `node_modules/`
- `.next/`
- `.vercel/`
- generated archives

Recommended hosting: Vercel with GitHub auto-deploy.
