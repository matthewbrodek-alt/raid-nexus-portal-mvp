import type { CloudinaryAsset } from "@/lib/cloudinary/types";

export type DonationOfferStatus = "published" | "draft" | "archived";

export type DonationOffer = {
  id: string;
  ru: string;
  en: string;
  priceRub: number;
  tag: string;
  comment?: string;
  description?: string;
  image?: CloudinaryAsset | null;
  imageUrl?: string;
  status?: DonationOfferStatus;
  createdAt?: { seconds?: number };
  updatedAt?: { seconds?: number };
};

export const fallbackDonationOffers: DonationOffer[] = [
  {
    id: "monthly-rubies",
    ru: "Рубины на месяц",
    en: "Monthly Rubies",
    priceRub: 900,
    tag: "best start",
    comment: "Базовый набор рубинов для быстрого старта."
  },
  {
    id: "monthly-pack-small",
    ru: "Ежемесячный набор",
    en: "Monthly Pack",
    priceRub: 2700,
    tag: "daily value",
    comment: "Ежедневная ценность для активной игры."
  },
  {
    id: "forge-pass-base",
    ru: "Пропуск кузни без уровней",
    en: "Forge Pass",
    priceRub: 1800,
    tag: "forge",
    comment: "Доступ к наградам кузни без добора уровней."
  },
  {
    id: "energy-day",
    ru: "Энергичный набор дня",
    en: "Energy Day Pack",
    priceRub: 1800,
    tag: "energy",
    comment: "Ресурсы для фарма и прогресса."
  },
  {
    id: "forge-pass-25",
    ru: "Пропуск кузни +25 уровней",
    en: "Forge Pass +25",
    priceRub: 3600,
    tag: "fast pass",
    comment: "Ускоренный проход наград кузни."
  },
  {
    id: "monthly-pack-big",
    ru: "Ежемесячный набор XL",
    en: "Monthly Pack XL",
    priceRub: 4500,
    tag: "premium",
    comment: "Большой месячный набор для основного аккаунта."
  },
  {
    id: "rebirth-path",
    ru: "Путь возрождения",
    en: "Path of Rebirth",
    priceRub: 1800,
    tag: "event",
    comment: "Ивентовое предложение при наличии в магазине."
  },
  {
    id: "hero-pass-predator",
    ru: "Пропуск героя: Хищник",
    en: "Hero Pass: Predator",
    priceRub: 3600,
    tag: "hero pass",
    comment: "Пропуск героя, если он доступен на аккаунте."
  }
];

function toText(value: unknown, fallback = "") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function toNumber(value: unknown, fallback = 0) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
}

function toStatus(value: unknown): DonationOfferStatus {
  return value === "draft" || value === "archived" ? value : "published";
}

export function normalizeDonationOffer(id: string, data: Record<string, unknown>): DonationOffer {
  const ru = toText(data.ru, toText(data.title, toText(data.name, "Набор Raid")));
  const en = toText(data.en, toText(data.titleEn, toText(data.title, ru)));
  const image = data.image && typeof data.image === "object" ? (data.image as CloudinaryAsset) : null;

  return {
    id,
    ru,
    en,
    priceRub: toNumber(data.priceRub, toNumber(data.price, 0)),
    tag: toText(data.tag, "offer"),
    comment: toText(data.comment, toText(data.description)),
    description: toText(data.description, toText(data.comment)),
    image,
    imageUrl: toText(data.imageUrl),
    status: toStatus(data.status),
    createdAt: data.createdAt as DonationOffer["createdAt"],
    updatedAt: data.updatedAt as DonationOffer["updatedAt"]
  };
}

export function getDonationOfferTitle(offer: DonationOffer, isRu: boolean) {
  return isRu ? offer.ru || offer.en : offer.en || offer.ru;
}

export function getDonationOfferImageUrl(offer: DonationOffer) {
  return offer.image?.secureUrl || offer.image?.url || offer.imageUrl || "";
}
