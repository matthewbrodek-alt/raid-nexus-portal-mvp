"use client";

import { Star, Sword } from "lucide-react";
import { GlassPanel } from "@/components/ui/glass-panel";
import { getChampionRussianNameByEnglish } from "@/lib/data/champion-localization";
import { useLanguage } from "@/lib/i18n/use-language";
import type { HeroProfile } from "@/lib/types";

type HeroCardProps = {
  hero: HeroProfile;
};

function getHeroName(hero: HeroProfile, language: "ru" | "en") {
  return language === "ru" ? hero.nameRu || getChampionRussianNameByEnglish(hero.name) : hero.name;
}

export function HeroCard({ hero }: HeroCardProps) {
  const { language } = useLanguage();
  const displayName = getHeroName(hero, language);

  return (
    <GlassPanel className="overflow-hidden">
      <div
        className="aspect-[16/10] bg-gradient-to-br from-charcoal via-black to-blood/35 bg-cover bg-center p-5"
        style={hero.avatarUrl ? { backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.08), rgba(0,0,0,0.78)), url(${hero.avatarUrl})` } : undefined}
      >
        <div className="flex h-full items-end justify-between gap-3">
          <div>
            <p className="text-sm text-relic">{hero.faction}</p>
            <h3 className="break-words text-xl font-bold text-white sm:text-2xl">{displayName}</h3>
            {language === "ru" && displayName !== hero.name ? <p className="mt-1 text-xs text-zinc-400">{hero.name}</p> : null}
          </div>
          <span className="rounded-md border border-relic/30 bg-black/30 px-2 py-1 text-xs text-relic">
            {hero.rarity}
          </span>
        </div>
      </div>
      <div className="p-5">
        <div className="mb-4 flex items-center gap-3 text-sm text-zinc-300">
          <span className="flex items-center gap-1">
            <Sword size={15} className="text-ember" />
            {hero.role}
          </span>
          <span className="flex items-center gap-1">
            <Star size={15} className="text-relic" />
            {hero.rating}
          </span>
        </div>
        <p className="text-sm leading-6 text-zinc-400">{hero.comment}</p>
      </div>
    </GlassPanel>
  );
}
