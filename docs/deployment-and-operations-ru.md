# Подробная инструкция: эксплуатация и загрузка сайта на домен

Эта инструкция описывает полный путь: GitHub, Firebase, n8n/Bitrix, Vercel, домен, проверка и дальнейшая эксплуатация.

## 1. Что загружать на GitHub

На GitHub загружайте исходники проекта, а не архив.

Загружать:

- `src/`
- `docs/`
- `n8n/`
- `.env.example`
- `.env.production.example`
- `.gitignore`
- `README.md`
- `package.json`
- `next.config.ts`
- `tailwind.config.ts`
- `tsconfig.json`
- `postcss.config.mjs`
- `eslint.config.mjs`
- `next-env.d.ts`

Не загружать:

- `.env`
- `.env.local`
- `node_modules/`
- `.next/`
- `raid-nexus-portal-mvp.zip`
- любые файлы с реальными паролями, токенами, приватными ключами.

## 2. Подготовка локального проекта

В папке проекта выполните:

```bash
npm install
npm run dev
```

Проверьте страницы:

- `http://localhost:3000/`
- `http://localhost:3000/topup`
- `http://localhost:3000/useful`
- `http://localhost:3000/marketplace`
- `http://localhost:3000/heroes`
- `http://localhost:3000/heroes/arbiter`
- `http://localhost:3000/chat`
- `http://localhost:3000/dashboard`
- `http://localhost:3000/admin`

Перед загрузкой на домен выполните:

```bash
npm run build
```

Если сборка прошла успешно, проект готов к деплою.

## 3. Переменные окружения

Создайте локальный файл:

```text
.env.local
```

На продакшене эти же значения нужно будет добавить в Vercel или другой хостинг.

Минимальный набор:

```bash
NEXT_PUBLIC_SITE_URL=https://your-domain.com
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
NEXT_PUBLIC_BTC_WALLET=...
NEXT_PUBLIC_USDT_TRC20_WALLET=...
N8N_TOPUP_WEBHOOK_URL=https://your-n8n-domain/webhook/raid/topup-lead
N8N_CRM_WEBHOOK_URL=https://your-n8n-domain/webhook/raid/crm
GAME_DATA_ENCRYPTION_KEY=...
```

Важно:

- Не вставляйте реальные значения в `.env.example`.
- Не коммитьте `.env.local`.
- Не добавляйте `NEXT_PUBLIC_` к n8n webhook URL и encryption key: эти значения должны быть доступны только серверным API routes.
- Для теста n8n используйте `webhook-test`.
- Для продакшена используйте обычный `webhook`, workflow должен быть активирован.

## 4. Firebase

В Firebase Console:

1. Создайте проект.
2. Создайте Web App.
3. Скопируйте Firebase config в переменные окружения.
4. Включите Authentication.
5. Включите Email/Password auth.
6. Подключите популярные OAuth providers, если нужны: Google, Apple, Microsoft.
7. Создайте Firestore Database.
8. Создайте Firebase Storage.
9. Настройте Firestore rules из `docs/firestore-schema.md`.

Рекомендуемые коллекции:

- `users`
- `encryptedGameAccounts`
- `heroes`
- `heroCalendar`
- `news`
- `marketplaceAccounts`
- `topupLeads`
- `chatRooms`
- `forumThreads`
- `crmTables`
- `moderationQueue`

## 5. n8n и Bitrix CRM

Файл workflow:

```text
n8n/workflows/raid-portal-automation.json
```

В n8n:

1. Откройте Workflows.
2. Нажмите Import from File.
3. Импортируйте `raid-portal-automation.json`.
4. Откройте node `Portal Webhook - Top-up Lead`.
5. Скопируйте Production URL.
6. Вставьте Production URL в `N8N_TOPUP_WEBHOOK_URL`.
7. Убедитесь, что workflow активирован.

Если вы уже подключили Bitrix webhook:

- в node `CRM - Create Lead` используйте Bitrix REST URL напрямую;
- authentication оставьте `None`;
- `Authorization` header не нужен, если Bitrix webhook уже содержит секрет в URL;
- endpoint должен быть вида:

```text
https://your-company.bitrix24.com/rest/1/webhook-code/crm.lead.add.json
```

Проверочный payload:

```json
{
  "uid": "guest",
  "telegram": "@test_user",
  "packageId": "arena-forge-pack",
  "paymentMethod": "usdt",
  "comment": "test lead"
}
```

## 6. Загрузка на GitHub

Вариант через GitHub Desktop:

1. Откройте GitHub Desktop.
2. Add Existing Repository.
3. Выберите папку проекта.
4. Проверьте, что `.env.local` не попал в изменения.
5. Сделайте commit.
6. Нажмите Publish repository.

Вариант через терминал:

```bash
git init
git add .
git commit -m "Initial Raid Nexus Portal MVP"
git branch -M main
git remote add origin https://github.com/USER/REPO.git
git push -u origin main
```

Перед `git add .` убедитесь:

```bash
git status
```

В списке не должно быть `.env.local`.

## 7. Деплой на Vercel

Рекомендуемый хостинг для Next.js - Vercel.

1. Откройте Vercel.
2. Нажмите Add New Project.
3. Выберите GitHub repository.
4. Framework Preset должен определиться как `Next.js`.
5. Build command:

```bash
npm run build
```

6. Install command:

```bash
npm install
```

7. Output directory оставьте пустым.
8. Добавьте Environment Variables.
9. Нажмите Deploy.

После деплоя откройте временный домен Vercel и проверьте все страницы.

## 8. Подключение домена

В Vercel:

1. Откройте Project.
2. Settings.
3. Domains.
4. Add Domain.
5. Введите ваш домен, например:

```text
raid-example.com
```

6. Vercel покажет DNS-записи.

Обычно нужны:

Для root-домена:

```text
Type: A
Name: @
Value: 76.76.21.21
```

Для `www`:

```text
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

В панели регистратора домена:

1. Откройте DNS settings.
2. Добавьте записи, которые показал Vercel.
3. Подождите обновление DNS. Обычно 5-60 минут, иногда до 24 часов.
4. Вернитесь в Vercel и нажмите Verify.

После подключения домена обновите:

```bash
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

И сделайте redeploy.

## 9. Проверка после деплоя

Проверьте:

- `/` открывается.
- `/topup` отправляет заявку в n8n.
- В n8n появляется execution.
- В Bitrix появляется lead.
- `/heroes` открывает каталог.
- `/heroes/arbiter` открывает страницу героя.
- Под hero-блоком отображается YouTube section.
- `/dashboard` открывается.
- `/admin` открывается.
- `/robots.txt` открывается.
- `/sitemap.xml` открывается.

## 10. Как добавлять YouTube под героя

В MVP данные лежат в:

```text
src/lib/data/mock.ts
```

У героя есть поля:

```ts
youtubeVideoId: "youtube-video-id",
youtubeTitle: "Название видео"
```

YouTube video id - это часть ссылки после `v=`.

Пример:

```text
https://www.youtube.com/watch?v=abc123
```

Значит:

```ts
youtubeVideoId: "abc123"
```

В продакшене эти поля нужно перенести в Firestore collection:

```text
heroes/{heroId}
```

Поля:

- `youtubeVideoId`
- `youtubeTitle`

## 11. Как эксплуатировать сайт каждый день

### Пользовательские заявки

1. Пользователь открывает `/topup`.
2. Заполняет Telegram, пакет, оплату и комментарий.
3. Сайт отправляет POST в `/api/n8n/topup`.
4. Серверный route отправляет заявку в n8n, не раскрывая webhook URL в браузере.
5. n8n отправляет уведомление менеджеру.
6. n8n создает лид в Bitrix CRM.
7. Менеджер ведет сделку в CRM.

### Герои

В MVP герои находятся в mock-файле. Для рабочей версии:

1. Создайте админ-форму.
2. Загружайте avatar и screenshots в Firebase Storage.
3. Метаданные пишите в `heroes`.
4. Markdown-комментарий храните в `markdownComment`.
5. YouTube храните как `youtubeVideoId`.

### Новости и календарь

Рабочая схема:

- новости: `news`
- календарь hero-секции: `heroCalendar`

Админ добавляет событие, выставляет `isPublished: true`, сайт показывает событие.

### Чат

Рабочая схема:

- комнаты: `chatRooms`
- сообщения: `chatRooms/{roomId}/messages`
- вложения: Firebase Storage
- жалобы/модерация: `moderationQueue`

## 12. Обновление сайта

Стандартный цикл:

```bash
git pull
npm install
npm run build
git add .
git commit -m "Update portal"
git push
```

Vercel автоматически сделает redeploy после push в `main`.

## 13. Резервные копии

Рекомендуется:

- включить Firebase backups;
- регулярно экспортировать Firestore;
- хранить копию n8n workflow;
- хранить CRM backup в Bitrix;
- не хранить секреты в репозитории.

## 14. Частые ошибки

### n8n не получает заявку

Проверьте:

- workflow активирован;
- используется Production URL, а не Test URL;
- `N8N_TOPUP_WEBHOOK_URL` задан в Vercel;
- после изменения env был redeploy.

### Bitrix не создает лид

Проверьте:

- URL заканчивается на `crm.lead.add.json`;
- Authentication в n8n стоит `None`;
- нет лишнего `Authorization` header;
- у Bitrix webhook есть права CRM.

### Firebase не работает

Проверьте:

- все `NEXT_PUBLIC_FIREBASE_*` переменные заполнены;
- Auth provider включен;
- Firestore создан;
- rules не блокируют нужное действие.

### Домен не открывается

Проверьте:

- DNS записи совпадают с Vercel;
- домен прошел Verify;
- SSL certificate выдан;
- прошло достаточно времени после изменения DNS.

## 15. Минимальный чеклист перед запуском

- [ ] Репозиторий загружен на GitHub.
- [ ] `.env.local` не загружен.
- [ ] Firebase Auth включен.
- [ ] Firestore создан.
- [ ] Storage создан.
- [ ] n8n workflow активирован.
- [ ] Bitrix CRM создает тестовый lead.
- [ ] Vercel build проходит.
- [ ] Production env заполнены.
- [ ] Домен подключен.
- [ ] `/sitemap.xml` работает.
- [ ] `/robots.txt` работает.
- [ ] Top-up заявка проходит полный путь до менеджера.
