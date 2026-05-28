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
    <GlassPanel className="group h-full overflow-hidden rounded-[20px] border-relic/20 bg-[#060b12]/88 transition duration-200 hover:-translate-y-1 hover:border-relic/50 hover:shadow-[0_0_34px_rgba(200,154,61,0.16)]">
      <div className="relative grid min-h-[270px] grid-cols-[132px_1fr] gap-4 overflow-hidden p-4">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_24%_12%,rgba(200,154,61,0.16),transparent_32%),linear-gradient(135deg,rgba(8,14,24,0.96),rgba(1,4,8,0.96))]" />
        <div className="relative flex items-center justify-center">
          {hero.borderUrl ? <img src={hero.borderUrl} alt="" loading="lazy" decoding="async" className="absolute h-[230px] w-[178px] object-contain opacity-95 drop-shadow-[0_0_18px_rgba(200,154,61,0.18)]" /> : null}
          {hero.avatarUrl ? (
            <img
              src={hero.avatarUrl}
              alt={displayName}
              loading="lazy"
              decoding="async"
              className="relative h-[202px] w-[132px] object-contain drop-shadow-[0_24px_32px_rgba(0,0,0,0.65)] transition duration-200 group-hover:scale-[1.03]"
              onError={(event) => {
                event.currentTarget.style.display = "none";
              }}
            />
          ) : (
            <div className="relative grid h-[190px] w-[130px] place-items-center rounded-2xl border border-relic/20 bg-black/45">
              <Shield className="text-relic" size={38} />
            </div>
          )}
        </div>
        <div className="relative flex min-w-0 flex-col justify-between py-2">
          <div>
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-relic/25 bg-relic/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-relic">
                {formatRarity(hero.rarity, language)}
              </span>
              {hero.affinity ? (
                <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-300">
                  {formatAffinity(hero.affinity, language)}
                </span>
              ) : null}
            </div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-relic/85">{hero.faction}</p>
            <h3 className="mt-2 break-words font-[var(--font-cinzel)] text-2xl font-bold leading-tight text-white">{displayName}</h3>
            {language === "ru" && displayName !== hero.name ? <p className="mt-1 text-xs text-zinc-400">{hero.name}</p> : null}
          </div>
          <div className="mt-4 space-y-2 text-xs text-zinc-300">
            <span className="flex items-center gap-2">
              <Sword size={15} className="text-ember" />
              {roles}
            </span>
            {hero.aura ? (
              <span className="flex items-center gap-2">
              <Sparkles size={15} className="text-relic" />
                {language === "ru" ? "Аура" : "Aura"}: {hero.aura}
              </span>
            ) : null}
            <span className="flex items-center gap-2">
              <Star size={15} className="text-relic" />
              {hero.source === "gestal" ? (language === "ru" ? "Данные Gestal" : "Gestal data") : hero.rating}
            </span>
          </div>
        </div>
      </div>
    </GlassPanel>
  );
}
