"use client";

import Link from "next/link";
import { collection, limit, onSnapshot, query, where } from "firebase/firestore";
import { ShoppingBag } from "lucide-react";
import { useEffect, useState } from "react";
import type { CloudinaryAsset } from "@/lib/cloudinary/types";
import { db } from "@/lib/firebase/client";
import { collections } from "@/lib/firebase/collections";

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
  const [offers, setOffers] = useState<PortalOffer[]>([]);

  useEffect(() => {
    const offersQuery = query(
      collection(db, collections.portalOffers),
      where("status", "==", "published"),
      limit(8)
    );

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
          <p className="text-xs font-bold uppercase tracking-[0.34em] text-relic">Special Offers</p>
          <h2 className="raid-title-metal mt-2 text-2xl">Активность портала</h2>
        </div>
        <Link href="/topup" className="text-xs font-bold uppercase tracking-[0.18em] text-relic transition hover:text-[#ffe0a0]">
          View all
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
              className="raid-glow-button group relative min-h-[218px] overflow-hidden border border-[#223348] bg-[#07101a] p-5 transition hover:-translate-y-0.5"
            >
              <span className="absolute inset-0 bg-[radial-gradient(circle_at_82%_68%,rgba(36,89,145,0.34),transparent_34%),linear-gradient(135deg,rgba(7,14,24,0.96),rgba(7,18,33,0.9))]" aria-hidden="true" />
              {imageUrl ? (
                <span
                  className="absolute inset-y-2 right-0 w-[66%] bg-contain bg-right-bottom bg-no-repeat opacity-95 transition duration-300 group-hover:scale-[1.04]"
                  style={{ backgroundImage: `url("${imageUrl}")` }}
                  aria-hidden="true"
                />
              ) : null}
              <span className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,10,17,0.98),rgba(5,10,17,0.78)_42%,rgba(5,10,17,0.12)_100%)]" aria-hidden="true" />
              <span className="absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-black/70 to-transparent" aria-hidden="true" />
              <span className="relative z-10 flex h-full min-h-[150px] flex-col justify-between">
                <span>
                  <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-relic">
                    <ShoppingBag size={15} />
                    Оффер
                  </span>
                  <span className="mt-4 block max-w-[62%] text-2xl font-black leading-tight text-white">{offer.title || "Новый оффер"}</span>
                  <span className="mt-2 block max-w-[58%] text-sm leading-6 text-zinc-300">{offer.comment || "Подробности у менеджера."}</span>
                </span>
              </span>
            </Link>
            );
          })}
        </div>
      ) : (
        <div className="rounded-[18px] border border-relic/16 bg-black/28 p-5 text-sm text-zinc-400">
          Админ может добавить карточки активности в Content Forge: картинка, название и комментарий.
        </div>
      )}
    </section>
  );
}
