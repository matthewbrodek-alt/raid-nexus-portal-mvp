export type RaidEvent = {
  title: string;
  date: string;
  description: string;
  type: "summon" | "tournament" | "topup" | "fusion";
};

export type HeroProfile = {
  id: string;
  slug?: string;
  name: string;
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
  legendaryCount: number;
  voidCount: number;
  price: number;
  tags: string[];
};

export type AiNavigationNode = {
  id: string;
  label: string;
  route: string;
  capabilities: string[];
  queryExamples: string[];
};
