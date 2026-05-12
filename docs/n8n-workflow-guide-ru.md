# Полная инструкция по n8n workflow для Raid Nexus Portal

Эта инструкция описывает, как подключить сайт к n8n, Telegram и Bitrix CRM.

## 1. Общая схема

Основной поток для заявки на донат:

```text
Сайт /topup
-> Next.js API /api/n8n/topup
-> n8n webhook raid/topup-lead
-> проверка способа оплаты
-> создание лида в Bitrix
-> уведомление менеджера в Telegram
-> ответ сайту
```

Отдельный CRM sync workflow нужен только для дополнительных действий с контактами:

```text
Сайт или админ-панель
-> n8n webhook raid/crm-sync
-> contact.create / contact.update / lead.create
-> Bitrix
-> JSON ответ
```

## 2. Какие файлы workflow использовать

В проекте есть три n8n JSON-файла:

```text
n8n/workflows/raid-portal-topup-telegram-bitrix.json
n8n/workflows/raid-portal-automation.json
n8n/workflows/raid-crm-sync-bitrix.json
```

Используй для донат-заявок:

```text
n8n/workflows/raid-portal-topup-telegram-bitrix.json
```

`raid-portal-automation.json` оставлен как копия со старым названием. Его не нужно импортировать, если уже импортируешь `raid-portal-topup-telegram-bitrix.json`.

Дополнительно можно импортировать:

```text
n8n/workflows/raid-crm-sync-bitrix.json
```

Он нужен только если ты хочешь отдельный endpoint для создания/обновления контактов Bitrix.

## 3. Что должно быть в Vercel env

В Vercel для сайта нужен только URL основного n8n webhook:

```bash
N8N_TOPUP_WEBHOOK_URL=https://your-n8n-domain/webhook/raid/topup-lead
```

Важно:

- не добавляй `NEXT_PUBLIC_` к `N8N_TOPUP_WEBHOOK_URL`;
- не храни Bitrix webhook URL в Vercel frontend-переменных;
- Bitrix webhook должен лежать в n8n env.

## 4. Что должно быть в n8n env

В n8n добавь переменные окружения:

```bash
RAID_MANAGER_TELEGRAM_CHAT_ID=123456789
RAID_BTC_WALLET=bc1q-your-real-wallet
RAID_USDT_TRC20_WALLET=TYourRealUsdtWallet
RAID_BITRIX_LEAD_WEBHOOK_URL=https://your-company.bitrix24.com/rest/1/webhook-code/crm.lead.add.json
```

Если используешь отдельный CRM sync workflow, добавь еще:

```bash
RAID_BITRIX_CONTACT_ADD_WEBHOOK_URL=https://your-company.bitrix24.com/rest/1/webhook-code/crm.contact.add.json
RAID_BITRIX_CONTACT_UPDATE_WEBHOOK_URL=https://your-company.bitrix24.com/rest/1/webhook-code/crm.contact.update.json
```

Если отдельный CRM sync не используешь, contact add/update переменные не нужны.

## 5. Как получить Bitrix webhook URL

В Bitrix:

1. Открой раздел для входящих webhook.
2. Создай webhook с доступом к CRM.
3. Для лида нужен метод:

```text
crm.lead.add
```

4. Итоговый URL должен заканчиваться так:

```text
crm.lead.add.json
```

Пример формата:

```text
https://your-company.bitrix24.com/rest/1/webhook-code/crm.lead.add.json
```

Для CRM sync контактов нужны отдельные методы:

```text
crm.contact.add.json
crm.contact.update.json
```

## 6. Как получить Telegram chat id

1. Создай бота через BotFather.
2. Добавь бота в нужный чат или напиши ему лично.
3. Получи chat id через Telegram API или через любой getUpdates-инструмент.
4. Вставь chat id в n8n env:

```bash
RAID_MANAGER_TELEGRAM_CHAT_ID=...
```

В самом workflow нужно выбрать Telegram credential в Telegram nodes.

## 7. Импорт основного top-up workflow

1. Открой n8n.
2. Перейди в `Workflows`.
3. Нажми `Import from File`.
4. Выбери файл:

```text
n8n/workflows/raid-portal-topup-telegram-bitrix.json
```

5. Сохрани workflow.
6. Открой две Telegram nodes:

```text
Telegram - Notify Crypto Lead
Telegram - Notify Manager Lead
```

7. Выбери в них свой Telegram Bot credential.
8. Проверь, что workflow визуально выглядит так:

```text
Portal Webhook - Top-up Lead
-> Normalize Lead Payload
-> Is Crypto Payment
   true  -> Attach Crypto Invoice -> Bitrix - Create Crypto Lead -> Telegram - Notify Crypto Lead -> Respond Crypto to Portal
   false -> Manager Invoice       -> Bitrix - Create Manager Lead -> Telegram - Notify Manager Lead -> Respond Manager to Portal
```

9. Активируй workflow.
10. Открой node `Portal Webhook - Top-up Lead`.
11. Скопируй production webhook URL.
12. Вставь его в Vercel как:

```bash
N8N_TOPUP_WEBHOOK_URL=https://your-n8n-domain/webhook/raid/topup-lead
```

## 8. Что делает основной workflow

### Portal Webhook - Top-up Lead

Принимает POST-заявку с сайта.

Ожидаемый payload:

```json
{
  "uid": "firebase-user-id",
  "telegram": "@player",
  "packageId": "monthly-rubies",
  "packageName": "Рубины на месяц",
  "amountRub": 900,
  "paymentMethod": "usdt",
  "comment": "Нужен набор сегодня",
  "source": "portal"
}
```

### Normalize Lead Payload

Приводит данные к единому виду:

- `telegram`;
- `packageId`;
- `packageName`;
- `amountRub`;
- `paymentMethod`;
- `comment`;
- `uid`;
- `source`;
- `leadId`;
- `createdAt`.

### Is Crypto Payment

Проверяет способ оплаты:

- `btc` или `usdt` идут в crypto-ветку;
- все остальные способы идут в manager-ветку.

### Attach Crypto Invoice

Добавляет wallet:

- для `btc` берет `RAID_BTC_WALLET`;
- для `usdt` берет `RAID_USDT_TRC20_WALLET`.

Ставит статус:

```text
waiting_crypto_payment
```

### Manager Invoice

Ставит статус:

```text
manager_contact_required
```

Wallet не добавляется.

### Bitrix - Create Crypto Lead / Bitrix - Create Manager Lead

Создает лид в Bitrix через:

```bash
RAID_BITRIX_LEAD_WEBHOOK_URL
```

В Bitrix уходят:

- заголовок лида;
- Telegram;
- сумма;
- валюта RUB;
- способ оплаты;
- статус;
- wallet, если crypto;
- комментарий;
- source;
- uid.

### Telegram - Notify Crypto Lead / Telegram - Notify Manager Lead

Отправляет менеджеру сообщение с деталями заявки.

### Respond Crypto to Portal / Respond Manager to Portal

Возвращает сайту JSON-ответ.

Пример crypto-ответа:

```json
{
  "ok": true,
  "leadId": "lead_1778280000000",
  "status": "waiting_crypto_payment",
  "wallet": "TYourRealUsdtWallet",
  "bitrixLeadId": "123"
}
```

Пример manager-ответа:

```json
{
  "ok": true,
  "leadId": "lead_1778280000000",
  "status": "manager_contact_required",
  "wallet": "",
  "bitrixLeadId": "123"
}
```

## 9. Импорт дополнительного CRM sync workflow

Этот workflow необязательный.

Импортируй его только если нужен отдельный endpoint для контактов:

```text
n8n/workflows/raid-crm-sync-bitrix.json
```

После импорта активируй workflow и скопируй его production URL.

Webhook path:

```text
raid/crm-sync
```

## 10. Что делает CRM sync workflow

Он принимает поле `action` и маршрутизирует запрос.

Поддерживаемые действия:

```text
contact.create
contact.update
lead.create
```

Также поддерживаются старые короткие варианты:

```text
signup -> contact.create
update -> contact.update
lead   -> lead.create
```

### contact.create

Payload:

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

Использует:

```bash
RAID_BITRIX_CONTACT_ADD_WEBHOOK_URL
```

### contact.update

Payload:

```json
{
  "action": "contact.update",
  "bitrixId": "123",
  "name": "Updated Player",
  "email": "updated@example.com",
  "phone": "+10000000000",
  "telegram": "@player",
  "comment": "Updated from portal"
}
```

Использует:

```bash
RAID_BITRIX_CONTACT_UPDATE_WEBHOOK_URL
```

### lead.create

Payload:

```json
{
  "action": "lead.create",
  "uid": "firebase-uid",
  "name": "Player Name",
  "email": "player@example.com",
  "phone": "+10000000000",
  "telegram": "@player",
  "packageId": "monthly-rubies",
  "comment": "Manual CRM lead"
}
```

Использует:

```bash
RAID_BITRIX_LEAD_WEBHOOK_URL
```

## 11. Проверка через n8n Execute Workflow

Для теста top-up workflow:

1. Открой workflow.
2. Нажми `Execute workflow`.
3. Отправь POST на test webhook URL.

Тестовый JSON:

```json
{
  "uid": "guest",
  "telegram": "@test_user",
  "packageId": "monthly-rubies",
  "packageName": "Рубины на месяц",
  "amountRub": 900,
  "paymentMethod": "usdt",
  "comment": "test lead",
  "source": "manual-test"
}
```

Должно произойти:

- появится execution в n8n;
- создастся лид в Bitrix;
- придет сообщение в Telegram;
- webhook вернет JSON с `ok: true`.

## 12. Проверка с сайта

1. Убедись, что workflow активирован.
2. Убедись, что в Vercel стоит `N8N_TOPUP_WEBHOOK_URL`.
3. Открой сайт.
4. Перейди на `/topup`.
5. Отправь тестовую заявку.
6. Проверь:

- заявка появилась в Firestore `topupLeads`;
- execution появился в n8n;
- лид появился в Bitrix;
- сообщение пришло в Telegram;
- на сайте нет ошибки отправки.

## 13. Частые ошибки

### Respond to Portal стоит отдельно

Причина: импортирован старый или неполный workflow.

Решение:

- импортируй заново `raid-portal-topup-telegram-bitrix.json`;
- проверь, что каждая ветка заканчивается своим respond node.

### Сайт показывает ошибку 500

Причина: в Vercel не задан `N8N_TOPUP_WEBHOOK_URL`.

Решение:

- добавь `N8N_TOPUP_WEBHOOK_URL` в Vercel;
- сделай redeploy.

### Сайт показывает ошибку 502

Причина: n8n webhook отклонил запрос или workflow упал.

Решение:

- открой execution в n8n;
- посмотри, на каком node ошибка;
- чаще всего проблема в Bitrix URL, Telegram credential или env-переменных n8n.

### Bitrix node падает

Проверь:

- URL заканчивается на `.json`;
- webhook имеет доступ к CRM;
- для top-up используется `crm.lead.add.json`;
- в n8n env задан `RAID_BITRIX_LEAD_WEBHOOK_URL`.

### Telegram node падает

Проверь:

- выбран Telegram credential;
- бот активен;
- бот имеет доступ к чату;
- `RAID_MANAGER_TELEGRAM_CHAT_ID` задан правильно.

### В Bitrix появляются дубли

Причина: одновременно подключены top-up workflow и отдельный CRM sync на тот же top-up route.

Решение:

- в Vercel оставь только `N8N_TOPUP_WEBHOOK_URL`;
- не используй `N8N_CRM_WEBHOOK_URL` для top-up;
- CRM sync используй только для отдельных contact/lead операций.

## 14. Что не нужно делать

- Не импортируй одновременно `raid-portal-automation.json` и `raid-portal-topup-telegram-bitrix.json`.
- Не вставляй Bitrix webhook URL в `NEXT_PUBLIC_` переменные.
- Не храни Bitrix webhook в GitHub.
- Не добавляй Firestore node обратно в n8n: сайт уже пишет заявку в Firestore.
- Не включай второй CRM sync workflow в top-up route без отдельной причины.

## 15. Минимальный рабочий набор

Для запуска донат-заявок достаточно:

В n8n:

```bash
RAID_MANAGER_TELEGRAM_CHAT_ID=...
RAID_BTC_WALLET=...
RAID_USDT_TRC20_WALLET=...
RAID_BITRIX_LEAD_WEBHOOK_URL=...
```

В Vercel:

```bash
N8N_TOPUP_WEBHOOK_URL=...
```

В n8n импортирован и активирован:

```text
raid-portal-topup-telegram-bitrix.json
```

