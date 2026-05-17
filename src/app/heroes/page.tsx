"use client";

import { Search, Star } from "lucide-react";
import { useState } from "react";
import { ChampionMultiplierSearch } from "@/components/heroes/champion-multiplier-search";
import { HeroesCatalog } from "@/components/heroes/heroes-catalog";
import { PageShell } from "@/components/layout/page-shell";
import { GlassPanel } from "@/components/ui/glass-panel";
import { useLanguage, type Language } from "@/lib/i18n/use-language";

const raidFactions = [
  "Banner Lords",
  "High Elves",
  "The Sacred Order",
  "Barbarians",
  "Ogryn Tribes",
  "Lizardmen",
  "Skinwalkers",
  "Orcs",
  "Demonspawn",
  "Undead Hordes",
  "Dark Elves",
  "Knight Revenant",
  "Dwarves",
  "Shadowkin",
  "Sylvan Watchers",
  "The Nyresan Union"
];

const roleOptions = [
  { value: "support", label: { ru: "Поддержка", en: "Support" } },
  { value: "attack", label: { ru: "Атака", en: "Attack" } },
  { value: "defense", label: { ru: "Защита", en: "Defense" } },
  { value: "hp", label: { ru: "Здоровье", en: "HP" } }
];

const copy: Record<
  Language,
  {
    searchPlaceholder: string;
    allFactions: string;
    allRoles: string;
    adminTitle: string;
    adminDescription: string;
  }
> = {
  ru: {
    searchPlaceholder: "Поиск героя: Арбитр, Сифи, Taras, фракция или роль...",
    allFactions: "Все фракции",
    allRoles: "Все роли",
    adminTitle: "Публикация героев",
    adminDescription: "Герои из Firestore поддерживают английское и русское имя, главное фото, сборку героя и описание."
  },
  en: {
    searchPlaceholder: "Search champion: Arbiter, Siphi, Taras, faction or role...",
    allFactions: "All factions",
    allRoles: "All roles",
    adminTitle: "Admin hero publishing",
    adminDescription: "Firestore heroes support English and Russian names, avatar, hero build screenshots and notes."
  }
};

export default function HeroesPage() {
  const { language } = useLanguage();
  const t = copy[language];
  const [search, setSearch] = useState("");
  const [faction, setFaction] = useState("all");
  const [role, setRole] = useState("all");

  return (
    <PageShell
      eyebrow={{ ru: "Герои", en: "Hero DB" }}
      title={{ ru: "База героев", en: "Hero database" }}
      description={{
        ru: "Каталог героев с карточками, сборками, описаниями админов и поиском множителей навыков.",
        en: "Champion catalog with cards, builds, admin notes and skill multiplier search."
      }}
    >
      <GlassPanel className="mb-6 p-4">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="flex flex-1 items-center gap-2 rounded-md border border-white/10 bg-black/30 px-3">
            <Search size={18} className="text-zinc-500" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={t.searchPlaceholder}
              className="min-w-0 flex-1 border-0 bg-transparent text-sm text-white placeholder:text-zinc-500 focus:ring-0"
            />
          </div>
          <select value={faction} onChange={(event) => setFaction(event.target.value)} className="rounded-md border-white/10 bg-black/30 text-sm text-white focus:border-relic focus:ring-relic">
            <option value="all">{t.allFactions}</option>
            {raidFactions.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          <select value={role} onChange={(event) => setRole(event.target.value)} className="rounded-md border-white/10 bg-black/30 text-sm text-white focus:border-relic focus:ring-relic">
            <option value="all">{t.allRoles}</option>
            {roleOptions.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label[language]}
              </option>
            ))}
          </select>
        </div>
      </GlassPanel>

      <ChampionMultiplierSearch />
      <HeroesCatalog searchQuery={search} factionFilter={faction} roleFilter={role} />

      <GlassPanel className="mt-6 p-6">
        <div className="flex items-center gap-3">
          <Star className="text-relic" />
          <h2 className="text-2xl font-bold text-white">{t.adminTitle}</h2>
        </div>
        <p className="mt-3 text-sm leading-7 text-zinc-400">{t.adminDescription}</p>
      </GlassPanel>
    </PageShell>
  );
}
