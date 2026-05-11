"use client";

import Link from "next/link";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";
import { HeroCard } from "@/components/heroes/hero-card";
import { db } from "@/lib/firebase/client";
import { collections } from "@/lib/firebase/collections";
import { featuredHeroes } from "@/lib/data/mock";
import type { HeroProfile } from "@/lib/types";

type FirestoreHero = {
  slug?: string;
  name?: string;
  faction?: string;
  rarity?: string;
  role?: string;
  avatar?: { secureUrl?: string; url?: string };
  gallery?: Array<{ secureUrl?: string; url?: string }>;
  markdownComment?: string;
};

function normalizeRarity(value?: string): HeroProfile["rarity"] {
  const lower = value?.toLowerCase();

  if (lower === "mythical") {
    return "Mythical";
  }

  if (lower === "epic") {
    return "Epic";
  }

  if (lower === "rare") {
    return "Rare";
  }

  return "Legendary";
}

export function HeroesCatalog() {
  const [firestoreHeroes, setFirestoreHeroes] = useState<HeroProfile[]>([]);

  useEffect(() => {
    const heroesQuery = query(collection(db, collections.heroes), where("isPublished", "==", true));

    return onSnapshot(heroesQuery, (snapshot) => {
      setFirestoreHeroes(
        snapshot.docs.map((item) => {
          const data = item.data() as FirestoreHero;

          return {
            id: item.id,
            slug: data.slug ?? item.id,
            name: data.name ?? "Unknown Hero",
            faction: data.faction ?? "Unknown",
            rarity: normalizeRarity(data.rarity),
            role: data.role ?? "support",
            rating: 0,
            avatarUrl: data.avatar?.secureUrl ?? data.avatar?.url,
            galleryUrls: data.gallery?.map((asset) => asset.secureUrl ?? asset.url ?? "").filter(Boolean) ?? [],
            comment: data.markdownComment ?? "Описание пока не заполнено."
          };
        })
      );
    });
  }, []);

  const heroes = useMemo(() => [...firestoreHeroes, ...featuredHeroes], [firestoreHeroes]);

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {heroes.map((hero) => (
        <Link key={hero.id} href={`/heroes/${hero.slug ?? hero.id}`} className="block transition hover:-translate-y-1">
          <HeroCard hero={hero} />
        </Link>
      ))}
    </div>
  );
}
