# Firestore Schema

## Conventions

- All documents use `createdAt`, `updatedAt`, `createdBy` where relevant.
- Server-generated timestamps must use `serverTimestamp()`.
- Public read models are separated from sensitive encrypted data.
- Store large files in Cloudinary and reference them by `publicId`/URL in Firestore.
- Use composite indexes for marketplace filters and chat/forum queries.

## Collections

### `users/{uid}`

User profile and dashboard data.

```ts
{
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: "user" | "admin" | "owner";
  status: "active" | "blocked" | "pending";
  interests: string[];
  activityStats: {
    messagesCount: number;
    forumThreadsCount: number;
    topupRequestsCount: number;
    marketplaceViewsCount: number;
  };
  recommendedDonation: {
    packageId: string;
    reason: string;
    score: number;
    updatedAt: Timestamp;
  };
  cryptoWallets: {
    btcAddress?: string;
    usdtTrc20Address?: string;
    usdtErc20Address?: string;
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### `adminInvites/{email}`

Owner-created admin invitation. The document id is the lowercase email address.

```ts
{
  email: string;
  role: "admin";
  status: "pending" | "accepted" | "revoked";
  createdBy: string;
  acceptedBy?: string;
  createdAt: Timestamp;
  acceptedAt?: Timestamp;
  updatedAt: Timestamp;
}
```

### `encryptedGameAccounts/{uid}`

Encrypted game account data from registration. Keep readable only by owner and admin service account.

```ts
{
  uid: string;
  algorithm: "AES-GCM";
  keyVersion: string;
  iv: string;
  ciphertext: string;
  checksum: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

Plain payload before encryption:

```ts
{
  plariumId?: string;
  gameNickname?: string;
  serverRegion?: string;
  notes?: string;
}
```

### Shared Cloudinary asset shape

Use this shape for hero avatars, galleries, marketplace screenshots, chat attachments and user images:

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

### `heroes/{heroId}`

Hero DB document managed from admin panel.

```ts
{
  name: string;
  slug: string;
  faction: string;
  affinity: "magic" | "force" | "spirit" | "void";
  rarity: "rare" | "epic" | "legendary" | "mythical";
  role: "support" | "nuker" | "speedLead" | "control" | "tank";
  avatar: {
    publicId: string;
    secureUrl: string;
    url: string;
    alt: string;
  };
  gallery: [
    {
      publicId: string;
      secureUrl: string;
      url: string;
      alt: string;
      sortOrder: number;
    }
  ];
  markdownComment: string;
  youtubeVideoId?: string;
  youtubeTitle?: string;
  ratings: {
    arena: number;
    clanBoss: number;
    hydra: number;
    dungeon: number;
  };
  tags: string[];
  isPublished: boolean;
  createdBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

Cloudinary folder layout:

```text
raid-nexus/heroes/{heroId}/avatar
raid-nexus/heroes/{heroId}/gallery/{imageId}
```

### `heroCalendar/{eventId}`

Promotion calendar for the home Hero section and admin content planning.

```ts
{
  title: string;
  description: string;
  type: "summon" | "tournament" | "topup" | "fusion" | "maintenance";
  startsAt: Timestamp;
  endsAt: Timestamp;
  heroIds: string[];
  priority: number;
  isPublished: boolean;
  createdBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### `news/{newsId}`

Useful news feed.

```ts
{
  title: string;
  slug: string;
  summary: string;
  markdownBody: string;
  coverImage?: {
    publicId: string;
    secureUrl: string;
    url: string;
  };
  tags: string[];
  status: "draft" | "published" | "archived";
  publishedAt?: Timestamp;
  createdBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### `marketplaceAccounts/{accountId}`

Marketplace account card with advanced filtering.

```ts
{
  title: string;
  status: "available" | "reserved" | "sold" | "hidden";
  level: number;
  priceUsd: number;
  legendaryCount: number;
  voidLegendaryCount: number;
  voidEpicCount: number;
  heroNames: string[];
  hasArbiter: boolean;
  hasVoid: boolean;
  screenshots: [
    {
      publicId: string;
      secureUrl: string;
      url: string;
      alt: string;
    }
  ];
  tags: string[];
  sellerId?: string;
  reservedBy?: string;
  reservedUntil?: Timestamp;
  createdBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

Recommended indexes:

```text
status ASC, level DESC
status ASC, legendaryCount DESC
status ASC, hasVoid ASC, level DESC
status ASC, heroNames ARRAY_CONTAINS, priceUsd ASC
```

### `topupLeads/{leadId}`

Top-up requests created by users and handled by managers.

```ts
{
  uid?: string;
  telegram: string;
  packageId: string;
  packageName?: string;
  amountUsd?: number;
  paymentMethod?: "card" | "btc" | "usdt" | "other";
  comment?: string;
  status: "new" | "contacted" | "waitingPayment" | "paid" | "done" | "cancelled";
  source: "portal" | "telegram" | "manager";
  externalExecutionId?: string;
  managerId?: string;
  crmDealId?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### `chatRooms/{roomId}`

Realtime rooms.

```ts
{
  title: string;
  type: "global" | "tactics" | "bragging" | "support";
  isPublic: boolean;
  lastMessageText?: string;
  lastMessageAt?: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### `chatRooms/{roomId}/messages/{messageId}`

Room messages with attachments and emoji reactions.

```ts
{
  uid: string;
  displayName: string;
  text: string;
  emojis: string[];
  attachments: [
    {
      type: "image";
      publicId: string;
      secureUrl: string;
      url: string;
      width?: number;
      height?: number;
    }
  ];
  moderationStatus: "visible" | "pending" | "hidden" | "deleted";
  threadId?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### `directThreads/{threadId}`

Private 1-on-1 chat between users and admins.

```ts
{
  participants: string[];
  participantEmails: string[];
  lastMessageText: string;
  lastMessageAt: Timestamp;
  updatedAt: Timestamp;
}
```

### `directThreads/{threadId}/messages/{messageId}`

```ts
{
  uid: string;
  displayName: string;
  text: string;
  createdAt: Timestamp;
}
```

### `forumThreads/{threadId}`

Forum threads for tactics and bragging.

```ts
{
  title: string;
  slug: string;
  category: "tactics" | "bragging" | "marketplace" | "support";
  authorId: string;
  heroIds: string[];
  tags: string[];
  messageCount: number;
  lastActivityAt: Timestamp;
  isPinned: boolean;
  isLocked: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### `forumThreads/{threadId}/posts/{postId}`

```ts
{
  authorId: string;
  markdownBody: string;
  attachments: [
    {
      type: "image";
      publicId: string;
      secureUrl: string;
      url: string;
    }
  ];
  reactions: Record<string, number>;
  moderationStatus: "visible" | "pending" | "hidden" | "deleted";
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### `crmTables/{tableId}`

Admin-only CRM proxy metadata, not raw secrets.

```ts
{
  name: string;
  provider: "googleSheets" | "airtable" | "custom";
  apiEndpointAlias: string;
  allowedRoles: ["admin", "manager"];
  lastSyncedAt?: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### `moderationQueue/{itemId}`

```ts
{
  targetType: "chatMessage" | "forumPost" | "heroComment" | "marketplaceAccount";
  targetPath: string;
  reason: string;
  status: "open" | "approved" | "rejected";
  assignedTo?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

## Security Rules Draft

```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function signedIn() {
      return request.auth != null;
    }

    function isAdmin() {
      return signedIn() &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == "admin";
    }

    function isManager() {
      return signedIn() &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ["manager", "admin"];
    }

    match /users/{uid} {
      allow read, update: if signedIn() && (request.auth.uid == uid || isAdmin());
      allow create: if signedIn() && request.auth.uid == uid;
    }

    match /encryptedGameAccounts/{uid} {
      allow read, write: if signedIn() && (request.auth.uid == uid || isAdmin());
    }

    match /heroes/{heroId} {
      allow read: if resource.data.isPublished == true || isAdmin();
      allow write: if isAdmin();
    }

    match /heroCalendar/{eventId} {
      allow read: if resource.data.isPublished == true || isAdmin();
      allow write: if isAdmin();
    }

    match /news/{newsId} {
      allow read: if resource.data.status == "published" || isAdmin();
      allow write: if isAdmin();
    }

    match /marketplaceAccounts/{accountId} {
      allow read: if resource.data.status in ["available", "reserved"] || isManager();
      allow write: if isManager();
    }

    match /topupLeads/{leadId} {
      allow create: if signedIn();
      allow read: if signedIn() && (resource.data.uid == request.auth.uid || isManager());
      allow update, delete: if isManager();
    }

    match /chatRooms/{roomId} {
      allow read: if true;
      allow write: if isAdmin();

      match /messages/{messageId} {
        allow read: if true;
        allow create: if signedIn();
        allow update, delete: if isAdmin();
      }
    }

    match /forumThreads/{threadId} {
      allow read: if true;
      allow create: if signedIn();
      allow update, delete: if isAdmin() || resource.data.authorId == request.auth.uid;

      match /posts/{postId} {
        allow read: if true;
        allow create: if signedIn();
        allow update, delete: if isAdmin() || resource.data.authorId == request.auth.uid;
      }
    }

    match /crmTables/{tableId} {
      allow read, write: if isAdmin();
    }

    match /moderationQueue/{itemId} {
      allow read, write: if isManager();
    }
  }
}
```
