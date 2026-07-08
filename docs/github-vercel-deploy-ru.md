# GitHub и Vercel

## Что загружать в GitHub

Загружай исходники проекта, не архив.

Нужно загрузить:

- `src/`
- `public/`
- `docs/`
- `scripts/`
- `.env.example`
- `.gitignore`
- `package.json`
- `package-lock.json`
- `next.config.ts`
- `tailwind.config.ts`
- `tsconfig.json`
- `postcss.config.mjs`
- `eslint.config.mjs`
- `firebase.json`
- `firestore.rules`
- `storage.rules`
- `README.md`

Не загружать:

- `.env`
- `.env.local`
- `.env.*.local`
- `.next/`
- `.vercel/`
- `node_modules/`
- архивы `.zip`, `.rar`, `.7z`

## Vercel

1. Создай проект в Vercel из GitHub-репозитория.
2. Framework должен определиться как `Next.js`.
3. В Environment Variables добавь реальные значения из локального `.env.local`.
4. Нажми Deploy.

Обязательные переменные:

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

Опционально:

- `TOPUP_WEBHOOK_URL` - внешний webhook для дублирования заявок. Если пустой, сайт работает через внутреннюю Firebase-панель заявок.
- `SOCIAL_AUTH_STATE_SECRET`
- `FIREBASE_SERVICE_ACCOUNT_EMAIL`
- `FIREBASE_SERVICE_ACCOUNT_PRIVATE_KEY`
- `TELEGRAM_BOT_TOKEN`
- `VK_CLIENT_ID`
- `VK_CLIENT_SECRET`
- `DISCORD_CLIENT_ID`
- `DISCORD_CLIENT_SECRET`

## Проверка

После деплоя проверь:

- `/`
- `/login`
- `/register`
- `/dashboard`
- `/admin`
- `/donate`
- `/marketplace`
- `/heroes`
- `/chat`
- `/raffle`

Если Firebase Auth ругается на домен, добавь домен Vercel или свой домен в Firebase Console -> Authentication -> Settings -> Authorized domains.
