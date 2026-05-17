"use client";

import Link from "next/link";
import { collection, limit, onSnapshot, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import type { CloudinaryAsset } from "@/lib/cloudinary/types";
import { db } from "@/lib/firebase/client";
import { collections } from "@/lib/firebase/collections";
import { useLanguage } from "@/lib/i18n/use-language";

type PortalOffer = {
  id: string;
  title?: string;
  comment?: string;
  image?: CloudinaryAsset | null;
  coverImage?: CloudinaryAsset | null;
  imageUrl?: string;
  createdAt?: { seconds?: number };
};

function getOfferImageUrl(offer: PortalOffer) {
  return offer.image?.secureUrl || offer.image?.url || offer.coverImage?.secureUrl || offer.coverImage?.url || offer.imageUrl || "";
}

export function PortalOffers() {
  const { language } = useLanguage();
  const [offers, setOffers] = useState<PortalOffer[]>([]);
  const labels =
    language === "ru"
      ? {
          eyebrow: "Special Offers",
          title: "Активность портала",
          viewAll: "Все предложения",
          fallbackTitle: "Новое предложение",
          empty: "Админ может добавить карточки активности в Content Forge: картинка, название и комментарий."
        }
      : {
          eyebrow: "Special Offers",
          title: "Portal Activity",
          viewAll: "View all",
          fallbackTitle: "New offer",
          empty: "Admins can add activity cards in Content Forge: image, title and comment."
        };

  useEffect(() => {
    const offersQuery = query(collection(db, collections.portalOffers), where("status", "==", "published"), limit(8));

    return onSnapshot(
      offersQuery,
      (snapshot) => {
        setOffers(
          snapshot.docs
            .map((item) => ({ id: item.id, ...(item.data() as Omit<PortalOffer, "id">) }))
            .sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0))
        );
      },
      () => {
        setOffers([]);
      }
    );
  }, []);

  const visibleOffers = offers.slice(0, 3);

  return (
    <section className="raid-ornate-panel p-5">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.34em] text-relic">{labels.eyebrow}</p>
          <h2 className="raid-title-metal mt-2 text-2xl">{labels.title}</h2>
        </div>
        <Link href="/topup" className="text-xs font-bold uppercase tracking-[0.18em] text-relic transition hover:text-[#ffe0a0]">
          {labels.viewAll}
        </Link>
      </div>

      {visibleOffers.length > 0 ? (
        <div className="grid gap-4 lg:grid-cols-3">
          {visibleOffers.map((offer) => {
            const imageUrl = getOfferImageUrl(offer);

            return (
              <Link
                key={offer.id}
                href="/topup"
                className="group relative block min-h-[218px] overflow-hidden rounded-[18px] border border-[#223348] bg-[#07101a] p-5 shadow-[inset_0_0_24px_rgba(36,89,145,0.14),0_18px_40px_rgba(0,0,0,0.34)] transition hover:-translate-y-0.5 hover:border-relic/70"
              >
                <span className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(circle_at_82%_68%,rgba(36,89,145,0.36),transparent_36%),linear-gradient(135deg,rgba(7,14,24,0.98),rgba(7,18,33,0.92))]" aria-hidden="true" />
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt=""
                    className="pointer-events-none absolute inset-0 z-[1] h-full w-full max-w-none object-cover object-center opacity-100 transition duration-300 group-hover:scale-[1.04]"
                    aria-hidden="true"
                  />
                ) : (
                  <span className="pointer-events-none absolute bottom-4 right-4 z-[1] h-24 w-28 rounded-full bg-relic/10 blur-2xl" aria-hidden="true" />
                )}
                <span
                  className="pointer-events-none absolute inset-0 z-[2] bg-[linear-gradient(90deg,rgba(5,10,17,0.88),rgba(5,10,17,0.52)_48%,rgba(5,10,17,0.04)_100%),linear-gradient(180deg,rgba(5,10,17,0.08),rgba(5,10,17,0.54))]"
                  aria-hidden="true"
                />
                <span className="pointer-events-none absolute inset-x-0 bottom-0 z-[6] h-14 bg-gradient-to-t from-black/45 to-transparent" aria-hidden="true" />
                <span className="relative z-10 flex h-full min-h-[150px] flex-col justify-between">
                  <span>
                    <span className="block max-w-[72%] text-2xl font-black leading-tight text-white">{offer.title || labels.fallbackTitle}</span>
                    {offer.comment ? <span className="mt-2 block max-w-[68%] text-sm leading-6 text-zinc-200">{offer.comment}</span> : null}
                  </span>
                </span>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="rounded-[18px] border border-relic/16 bg-black/28 p-5 text-sm text-zinc-400">{labels.empty}</div>
      )}
    </section>
  );
}
