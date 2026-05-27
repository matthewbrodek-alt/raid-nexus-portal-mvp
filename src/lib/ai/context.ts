import { siteContext } from "@/lib/ai/site-context";
import type { AiNavigationNode } from "@/lib/types";

export const aiNavigationMap: AiNavigationNode[] = [
  {
    id: "topup",
    label: "Донат",
    route: "/donate",
    capabilities: ["createTopupLead", "openManagerDialog", "recommendDonationPack"],
    queryExamples: ["Хочу купить гемы", "Свяжи меня с менеджером"]
  },
  {
    id: "useful",
    label: "Useful",
    route: "/useful",
    capabilities: ["calculateSpeed", "findGuide", "explainAuraMath"],
    queryExamples: ["Посчитай скорость для КБ", "Покажи PvP speed tune"]
  },
  {
    id: "marketplace",
    label: "Marketplace",
    route: "/marketplace",
    capabilities: ["filterAccounts", "compareAccounts", "reserveAccount"],
    queryExamples: ["Найди аккаунт с Арбитром", "Нужен аккаунт level 80+ с void героями"]
  },
  {
    id: "heroes",
    label: "Hero DB",
    route: "/heroes",
    capabilities: ["searchHero", "summarizeHero", "openHeroGallery", "findDamageMultipliers"],
    queryExamples: ["Покажи Siphi", "Кто лучше для арены?", "Find Arbiter damage multipliers"]
  },
  {
    id: "chat",
    label: "Global Chat & Forum",
    route: "/chat",
    capabilities: ["createThread", "moderateMessage", "uploadAttachment"],
    queryExamples: ["Создай тред по Hydra", "Покажи обсуждения тактик"]
  }
];

export const aiContextSnapshot = {
  schemaVersion: "0.2.0",
  currentRoute: "/",
  userRole: "guest",
  globalContext: siteContext,
  activeModules: aiNavigationMap,
  siteState: {
    selectedMarketplaceFilters: {
      hasVoid: null,
      minLegendaryCount: null,
      minLevel: null,
      heroName: null
    },
    openedHeroId: null,
    activeThreadId: null,
    topupLeadDraft: null
  },
  directQueryContract: {
    filterAccounts: {
      input: {
        heroName: "string?",
        minLevel: "number?",
        minLegendaryCount: "number?",
        hasVoid: "boolean?"
      },
      output: "marketplaceAccount[]"
    },
    createTopupLead: {
      input: {
        telegram: "string",
        packageId: "string",
        comment: "string?"
      },
      output: "leadId"
    }
  }
};
