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
  createdAt?: { seconds?: number };
};

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

      {offers.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {offers.map((offer) => (
            <Link
              key={offer.id}
              href="/topup"
              className="raid-glow-button group relative min-h-[190px] overflow-hidden border border-relic/22 bg-[#07101a] p-5 transition hover:-translate-y-0.5"
            >
              {offer.image?.secureUrl ? (
                <span
                  className="absolute inset-0 bg-cover bg-center opacity-[0.62] transition duration-300 group-hover:scale-[1.03] group-hover:opacity-[0.78]"
                  style={{ backgroundImage: `url(${offer.image.secureUrl})` }}
                  aria-hidden="true"
                />
              ) : null}
              <span className="absolute inset-0 bg-[linear-gradient(110deg,rgba(2,7,12,0.88),rgba(2,7,12,0.58)_45%,rgba(2,7,12,0.18))]" aria-hidden="true" />
              <span className="relative z-10 flex h-full min-h-[150px] flex-col justify-between">
                <span>
                  <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-relic">
                    <ShoppingBag size={15} />
                    Оффер
                  </span>
                  <span className="mt-4 block text-2xl font-black leading-tight text-white">{offer.title || "Новый оффер"}</span>
                  <span className="mt-2 block text-sm leading-6 text-zinc-300">{offer.comment || "Подробности у менеджера."}</span>
                </span>
              </span>
            </Link>
          ))}
        </div>
      ) : (
        <div className="rounded-[18px] border border-relic/16 bg-black/28 p-5 text-sm text-zinc-400">
          Админ может добавить карточки активности в Content Forge: картинка, название и комментарий.
        </div>
      )}
    </section>
  );
}
