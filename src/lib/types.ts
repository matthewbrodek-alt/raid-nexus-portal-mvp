export type RaidEvent = {
  title: string;
  date: string;
  startDate?: string;
  endDate?: string;
  description: string;
  type: "summon" | "tournament" | "topup" | "fusion";
};

export type PortalEventWidget = {
  id: string;
  title?: string;
  comment?: string;
  details?: string;
  type?: "contest" | "special" | "event";
  deadlineAt?: string;
  donationUrl?: string;
  status?: "published" | "archived";
  image?: {
    secureUrl?: string;
    url?: string;
    alt?: string;
  } | null;
  gallery?: Array<{
    secureUrl?: string;
    url?: string;
    alt?: string;
  }>;
  participants?: string[];
  participantCount?: number;
  winnerUid?: string;
  winnerName?: string;
  winnerPickedAt?: { seconds?: number };
  createdAt?: { seconds?: number };
};

export type HeroProfile = {
  id: string;
  slug?: string;
  name: string;
  nameRu?: string;
  faction: string;
  rarity: "Legendary" | "Epic" | "Rare" | "Mythical";
  role: string;
  rating: number;
  avatarUrl?: string;
  galleryUrls: string[];
  comment: string;
  youtubeVideoId?: string;
  youtubeTitle?: string;
};

export type MarketplaceAccount = {
  id: string;
  title: string;
  level: number;
  mythicCount?: number;
  legendaryCount: number;
  voidCount: number;
  price: number;
  tags: string[];
  description?: string;
  heroes?: string[];
  status?: "available" | "reserved" | "sold";
  category?: "starter" | "progressed" | "shards";
  screenshotUrl?: string;
  galleryUrls?: string[];
  power?: number;
  server?: string;
};

export type AiNavigationNode = {
  id: string;
  label: string;
  route: string;
  capabilities: string[];
  queryExamples: string[];
};
