# Raid Dark Portal MVP

MVP портала по Raid: Shadow Legends на Next.js App Router, Tailwind CSS, Lucide Icons и Firebase.

## Быстрый старт

```bash
npm install
cp .env.example .env.local
npm run dev
```

Откройте `http://localhost:3000`.

## Технический стек

- Frontend: Next.js App Router, React, TypeScript, Tailwind CSS, Lucide Icons.
- Backend/DB: Firebase Auth, Firestore.
- Media storage: Cloudinary for hero, marketplace, chat/forum and user images.
- Automation: server webhook для Telegram-бота, менеджера и CRM.
- AI-ready: `src/lib/ai/site-context.ts` и `src/lib/ai/context.ts` описывают навигацию, capability map и контракт прямых запросов.

## Реализовано в MVP

- Главная страница в dark fantasy стиле с glassmorphism.
- Hero-секция с календарем акций.
- Модульные блоки: Донат, Useful, Marketplace, Hero DB, Global Chat & Forum.
- Компоненты: `HeroCard`, `ChampionMultiplierSearch`, `ChatWindow`, `SpeedCalcForm`, `ArenaBoostCalculator`, `MarketFilter`.
- Личный кабинет игрока: `/dashboard`.
- Админ-панель: `/admin`.
- Отдельные страницы разделов: `/donate`, `/topup` алиас, `/useful`, `/marketplace`, `/heroes`, `/heroes/[heroId]`, `/chat`.
- RU/EN переключатель языка в верхней панели.
- YouTube-блок под подробной страницей героя.
- Поиск множителей урона легендарных и мифических героев: `src/lib/data/champion-multipliers.ts`.
- Гибкий config-driven слой модулей: `src/lib/config/site-modules.ts`.
- Firebase client layer, collection constants, top-up service.
- AES-GCM helper для шифрования игровых данных при регистрации.
- Webhook-ready flow для Telegram и Bitrix CRM.
- Архитектурная документация и схема Firestore.

## Документация

- `docs/project-structure.md` - структура файлов и рекомендуемые routes.
- `docs/firestore-schema.md` - коллекции, поля, индексы и rules draft.
- `docs/flexible-architecture.md` - как расширять модули, кабинеты и AI-layer.
- `docs/deployment-and-operations-ru.md` - подробная инструкция по эксплуатации, GitHub, Vercel, домену и Firebase.
- `docs/auth-admin-test-ru.md` - проверка входа, личного кабинета, owner/admin ролей и добавления новых админов.
- `docs/github-vercel-deploy-ru.md` - что грузить на GitHub и как развернуть бесплатный тестовый домен на Vercel.
- `docs/file-inventory.md` - описание всех файлов проекта.

## Дальнейшая интеграция

1. Создать Firebase project и заполнить `.env.local`.
2. Включить Firebase Auth email/password и нужные OAuth providers.
3. Настроить Firestore security rules из `docs/firestore-schema.md`.
4. Заполнить Cloudinary переменные для изображений: `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`.
5. Подключить серверный webhook URL в `.env.local` через `TOPUP_WEBHOOK_URL`.
6. Расширить рабочие CRUD routes: `/forum`, `/dashboard/topups`, `/admin/heroes`, `/admin/news`.
