export type SiteModuleId =
  | "topup"
  | "useful"
  | "marketplace"
  | "heroes"
  | "chat"
  | "dashboard"
  | "admin";

export type SiteModule = {
  id: SiteModuleId;
  label: string;
  route: string;
  navGroup: "public" | "user" | "admin";
  enabled: boolean;
  featureFlags: string[];
  aiCapabilities: string[];
  description: string;
};

export const siteModules: SiteModule[] = [
  {
    id: "topup",
    label: "Донат",
    route: "/donate",
    navGroup: "public",
    enabled: true,
    featureFlags: ["n8nWebhook", "managerRouting", "cryptoPayments"],
    aiCapabilities: ["createTopupLead", "recommendDonationPack", "sendManagerWebhook"],
    description: "Dark fantasy donation flow with manager contact, n8n and Bitrix CRM."
  },
  {
    id: "useful",
    label: "Useful",
    route: "/useful",
    navGroup: "public",
    enabled: true,
    featureFlags: ["newsFeed", "speedCalculator", "markdownGuides"],
    aiCapabilities: ["calculateSpeed", "findGuide", "explainAuraMath"],
    description: "News, calculators, guides and tactical tools."
  },
  {
    id: "marketplace",
    label: "Marketplace",
    route: "/marketplace",
    navGroup: "public",
    enabled: true,
    featureFlags: ["advancedFilters", "accountReservation", "crmSync"],
    aiCapabilities: ["filterAccounts", "compareAccounts", "reserveAccount"],
    description: "Account marketplace with filters by heroes, level, void and legendary count."
  },
  {
    id: "heroes",
    label: "Hero DB",
    route: "/heroes",
    navGroup: "public",
    enabled: true,
    featureFlags: ["adminHeroEditor", "cloudinaryGallery", "markdownComments"],
    aiCapabilities: ["searchHero", "summarizeHero", "openHeroGallery"],
    description: "Dynamic hero database with avatar, gallery and markdown comments."
  },
  {
    id: "chat",
    label: "Chat",
    route: "/chat",
    navGroup: "public",
    enabled: true,
    featureFlags: ["realtimeFirestore", "attachments", "threads", "moderation"],
    aiCapabilities: ["createThread", "moderateMessage", "uploadAttachment"],
    description: "Global realtime chat and forum threads."
  },
  {
    id: "dashboard",
    label: "Cabinet",
    route: "/dashboard",
    navGroup: "user",
    enabled: true,
    featureFlags: ["activityStats", "topupHistory", "recommendedDonation", "cryptoWallet"],
    aiCapabilities: ["summarizeUserActivity", "recommendNextAction", "explainPaymentOptions"],
    description: "Personal command room for user progress, requests, recommendations and wallet."
  },
  {
    id: "admin",
    label: "Admin",
    route: "/admin",
    navGroup: "admin",
    enabled: true,
    featureFlags: ["contentOps", "heroCalendar", "chatModeration", "crmTables"],
    aiCapabilities: ["auditContent", "draftNews", "prioritizeModeration", "syncCrm"],
    description: "Admin war room for content, hero DB, chat moderation and CRM sync."
  }
];

export function getEnabledModules(navGroup?: SiteModule["navGroup"]) {
  return siteModules.filter((module) => module.enabled && (!navGroup || module.navGroup === navGroup));
}
