import { siteModules } from "@/lib/config/site-modules";

export const siteContext = {
  schemaVersion: "0.2.0",
  product: "Raid Nexus Portal",
  purpose: "Dark fantasy modular portal for Raid: Shadow Legends players, managers and admins.",
  modules: siteModules.map((module) => ({
    id: module.id,
    label: module.label,
    route: module.route,
    navGroup: module.navGroup,
    enabled: module.enabled,
    featureFlags: module.featureFlags,
    aiCapabilities: module.aiCapabilities,
    description: module.description
  })),
  stateShape: {
    user: {
      role: "guest | user | manager | admin",
      interests: "string[]",
      encryptedGameAccountLinked: "boolean"
    },
    marketplace: {
      heroName: "string?",
      minLevel: "number?",
      minLegendaryCount: "number?",
      hasVoid: "boolean?"
    },
    chat: {
      activeRoomId: "string?",
      activeThreadId: "string?",
      attachmentDrafts: "cloudinaryPublicId[]"
    },
    topup: {
      selectedPackageId: "string?",
      paymentMethod: "card | btc | usdt | other",
      managerLeadId: "string?"
    }
  },
  assistantActions: {
    filterAccounts: {
      route: "/marketplace",
      input: {
        heroName: "string?",
        minLevel: "number?",
        minLegendaryCount: "number?",
        hasVoid: "boolean?"
      }
    },
    createTopupLead: {
      route: "/api/n8n/topup",
      input: {
        telegram: "string",
        packageId: "string",
        paymentMethod: "string",
        comment: "string?"
      }
    },
    createForumThread: {
      route: "/forum/new",
      input: {
        title: "string",
        category: "tactics | bragging | marketplace | support",
        heroIds: "string[]",
        markdownBody: "string"
      }
    }
  }
};

export type SiteContext = typeof siteContext;
