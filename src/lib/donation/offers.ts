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
