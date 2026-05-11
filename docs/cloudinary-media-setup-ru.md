# Cloudinary media setup

## Зачем Cloudinary в проекте

Cloudinary используется как хранилище и обработчик изображений вместо Firebase Storage.

Firestore остается базой данных для:

- профилей пользователей;
- ролей `user`, `admin`, `owner`;
- admin invites;
- зашифрованных игровых данных;
- метаданных героев, новостей, marketplace, чата и форума.

Cloudinary хранит сами изображения, а Firestore хранит только ссылки и метаданные:

```ts
{
  publicId: string;
  secureUrl: string;
  url: string;
  alt?: string;
  width?: number;
  height?: number;
  format?: string;
  bytes?: number;
}
```

## Переменные окружения

В `.env.local` и Vercel добавь:

```env
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=твой_cloud_name
CLOUDINARY_API_KEY=твой_api_key
CLOUDINARY_API_SECRET=твой_api_secret
```

Правило безопасности:

- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` можно раскрывать браузеру;
- `CLOUDINARY_API_KEY` и `CLOUDINARY_API_SECRET` нельзя делать публичными;
- не называй секреты `NEXT_PUBLIC_CLOUDINARY_API_KEY` или `NEXT_PUBLIC_CLOUDINARY_API_SECRET`.

## Где находится код

```text
src/lib/cloudinary/client.ts
```

Клиентские helpers для генерации Cloudinary URL. Используют только публичный `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`.

```text
src/lib/cloudinary/server.ts
```

Server-only helper для загрузки и удаления изображений через Cloudinary SDK. Использует `CLOUDINARY_API_KEY` и `CLOUDINARY_API_SECRET`.

```text
src/lib/cloudinary/types.ts
```

Общие типы Cloudinary assets и разрешенных папок.

## Рекомендуемые папки Cloudinary

Текущий helper загружает изображения в:

```text
raid-nexus/heroes
raid-nexus/marketplace
raid-nexus/chat
raid-nexus/forum
raid-nexus/users
```

## Как использовать дальше

Для будущей админки загрузок делай Next.js API route, который:

1. проверяет роль пользователя через серверную авторизацию;
2. принимает файл;
3. вызывает `uploadCloudinaryAsset`;
4. сохраняет полученный `publicId` и `secureUrl` в нужный Firestore-документ.

Не загружай файлы напрямую из браузера через `CLOUDINARY_API_SECRET`.
