# GitHub и бесплатный тестовый домен

## Что выбрать для проверки

Рекомендованный вариант для этого проекта: **GitHub + Vercel Hobby**.

Почему:

- Next.js App Router на Vercel деплоится почти без настройки.
- После подключения GitHub каждый `push` в `main` автоматически обновляет сайт.
- Vercel дает бесплатный тестовый домен вида `project-name.vercel.app`.
- Firebase остается backend-частью: Auth, Firestore, Storage.

Firebase App Hosting тоже поддерживает Next.js и GitHub, но по официальной документации требует Blaze-план. Для первого бесплатного теста проще Vercel.

## Что загружать на GitHub

Загружай не архив, а распакованную папку проекта.

На GitHub должны попасть:

```text
docs/
n8n/
scripts/
src/
.env.example
.env.production.example
.gitignore
eslint.config.mjs
firebase.json
firestore.rules
next-env.d.ts
next.config.ts
package.json
postcss.config.mjs
README.md
storage.rules
tailwind.config.ts
tsconfig.json
```

Не загружать:

```text
.env.local
.next/
node_modules/
raid-nexus-portal-mvp.zip
```

## Команды для GitHub

```powershell
git init
git add .
git commit -m "Initial Raid portal MVP"
git branch -M main
git remote add origin https://github.com/YOUR_LOGIN/YOUR_REPO.git
git push -u origin main
```

Если Git уже был создан, начинай с:

```powershell
git status
git add .
git commit -m "Prepare auth roles and deploy config"
git push
```

## Настройка Firebase перед тестом

1. Firebase Console -> Authentication -> Sign-in method.
2. Включи `Email/Password`.
3. Firebase Console -> Firestore Database -> Create database.
4. Firebase Console -> Storage -> Get started.
5. Rules можно загрузить из файлов:

```text
firestore.rules
storage.rules
```

## Настройка Vercel

1. Открой Vercel.
2. `Add New` -> `Project`.
3. Выбери GitHub-репозиторий.
4. Framework должен определиться как `Next.js`.
5. В `Environment Variables` добавь значения из `.env.local`.
6. Обязательно укажи:

```env
NEXT_PUBLIC_BOOTSTRAP_ADMIN_EMAIL=твой-email-для-первого-админа
```

7. Нажми `Deploy`.
8. После деплоя сайт будет доступен по бесплатному домену Vercel.

## Проверка после деплоя

1. Открой `https://your-project.vercel.app/register`.
2. Зарегистрируй обычного пользователя.
3. Проверь `/dashboard`.
4. Зарегистрируй email из `NEXT_PUBLIC_BOOTSTRAP_ADMIN_EMAIL`.
5. Проверь `/admin`.
6. Добавь второго админа через форму.
7. Войди вторым админом и проверь `/admin`.

## Источники

- Vercel Git deployments: https://vercel.com/docs/deployments/git
- Vercel environment variables: https://vercel.com/docs/projects/environment-variables
- Firebase App Hosting: https://firebase.google.com/docs/app-hosting/get-started
