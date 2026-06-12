"use client";

import { Shield, Sparkles, Star, Sword } from "lucide-react";
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

function formatRole(role: string, language: "ru" | "en") {
  if (language === "en") {
    return role;
  }

  const roles: Record<string, string> = {
    attack: "Атака",
    defense: "Защита",
    hp: "Здоровье",
    support: "Поддержка"
  };

  return roles[role.toLowerCase()] ?? role;
}

function formatAffinity(affinity: string, language: "ru" | "en") {
  if (language === "en") {
    return affinity;
  }

  const affinities: Record<string, string> = {
    magic: "Магия",
    force: "Сила",
    spirit: "Дух",
    void: "Тьма"
  };

  return affinities[affinity.toLowerCase()] ?? affinity;
}

function formatRarity(rarity: string, language: "ru" | "en") {
  if (language === "en") {
    return rarity;
  }

  const rarities: Record<string, string> = {
    mythical: "Мифический",
    legendary: "Легендарный",
    epic: "Эпический",
    rare: "Редкий",
    uncommon: "Необычный",
    common: "Обычный"
  };

  return rarities[rarity.toLowerCase()] ?? rarity;
}

export function HeroCard({ hero }: HeroCardProps) {
  const { language } = useLanguage();
  const displayName = getHeroName(hero, language);
  const roles = hero.roles?.length ? hero.roles.map((role) => formatRole(role, language)).join(" / ") : formatRole(hero.role, language);

  return (
    <GlassPanel className="group h-full overflow-hidden rounded-[18px] border-relic/20 bg-[#060b12]/88 transition duration-200 hover:-translate-y-1 hover:border-relic/50 hover:shadow-[0_0_34px_rgba(200,154,61,0.16)]">
      <div className="relative min-h-[228px] overflow-hidden p-3">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_24%_12%,rgba(200,154,61,0.16),transparent_32%),linear-gradient(135deg,rgba(8,14,24,0.96),rgba(1,4,8,0.96))]" />
        <div className="relative mx-auto flex h-[126px] items-center justify-center">
          {hero.borderUrl ? <img src={hero.borderUrl} alt="" loading="lazy" decoding="async" className="absolute h-[146px] w-[120px] object-contain opacity-95 drop-shadow-[0_0_18px_rgba(200,154,61,0.18)]" /> : null}
          {hero.avatarUrl ? (
            <img
              src={hero.avatarUrl}
              alt={displayName}
              loading="lazy"
              decoding="async"
              className="relative h-[124px] w-[92px] object-contain drop-shadow-[0_18px_24px_rgba(0,0,0,0.65)] transition duration-200 group-hover:scale-[1.04]"
              onError={(event) => {
                event.currentTarget.style.display = "none";
              }}
            />
          ) : (
            <div className="relative grid h-[118px] w-[88px] place-items-center rounded-2xl border border-relic/20 bg-black/45">
              <Shield className="text-relic" size={28} />
            </div>
          )}
        </div>
        <div className="relative mt-3 flex min-w-0 flex-col">
          <div>
            <div className="mb-2 flex flex-wrap items-center gap-1.5">
              <span className="rounded-full border border-relic/25 bg-relic/10 px-2 py-0.5 text-[9px] font-black tracking-[0.12em] text-relic">
                {formatRarity(hero.rarity, language)}
              </span>
              {hero.affinity ? (
                <span className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[9px] font-bold tracking-[0.12em] text-zinc-300">
                  {formatAffinity(hero.affinity, language)}
                </span>
              ) : null}
            </div>
            <p className="truncate text-[10px] font-semibold tracking-[0.14em] text-relic/85">{hero.faction}</p>
            <h3 className="mt-1 line-clamp-2 min-h-[40px] break-words font-[var(--font-display)] text-base font-light leading-tight text-white">{displayName}</h3>
            {language === "ru" && displayName !== hero.name ? <p className="mt-1 text-xs text-zinc-400">{hero.name}</p> : null}
          </div>
          <div className="mt-3 space-y-1.5 text-[11px] text-zinc-300">
            <span className="flex items-center gap-2">
              <Sword size={13} className="text-ember" />
              {roles}
            </span>
            {hero.aura ? (
              <span className="flex items-center gap-2 truncate">
                <Sparkles size={13} className="text-relic" />
                {language === "ru" ? "Аура" : "Aura"}: {hero.aura}
              </span>
            ) : null}
            <span className={`flex items-center gap-2 ${hero.rating > 0 ? "" : "hidden"}`}>
              <Star size={13} className="text-relic" />
              {hero.rating}
            </span>
          </div>
        </div>
      </div>
    </GlassPanel>
  );
}
