"use client";

import { Filter, Search, Star } from "lucide-react";
import { useMemo, useState } from "react";
import { HeroesCatalog } from "@/components/heroes/heroes-catalog";
import { PageShell } from "@/components/layout/page-shell";
import { GlassPanel } from "@/components/ui/glass-panel";
import { gestalChampions } from "@/lib/data/gestal-champions";
import { useLanguage, type Language } from "@/lib/i18n/use-language";

const roleOptions = [
  { value: "support", label: { ru: "Поддержка", en: "Support" } },
  { value: "attack", label: { ru: "Атака", en: "Attack" } },
  { value: "defense", label: { ru: "Защита", en: "Defense" } },
  { value: "hp", label: { ru: "Здоровье", en: "HP" } }
];

const rarityOptions = [
  { value: "Mythical", label: { ru: "Мифические", en: "Mythical" } },
  { value: "Legendary", label: { ru: "Легендарные", en: "Legendary" } },
  { value: "Epic", label: { ru: "Эпические", en: "Epic" } },
  { value: "Rare", label: { ru: "Редкие", en: "Rare" } },
  { value: "Uncommon", label: { ru: "Необычные", en: "Uncommon" } },
  { value: "Common", label: { ru: "Обычные", en: "Common" } }
];

const affinityOptions = [
  { value: "Magic", label: { ru: "Магия", en: "Magic" } },
  { value: "Force", label: { ru: "Сила", en: "Force" } },
  { value: "Spirit", label: { ru: "Дух", en: "Spirit" } },
  { value: "Void", label: { ru: "Тьма", en: "Void" } }
];

const copy: Record<
  Language,
  {
    searchPlaceholder: string;
    allFactions: string;
    allRoles: string;
    allRarities: string;
    allAffinities: string;
    filtersTitle: string;
    adminTitle: string;
    adminDescription: string;
  }
> = {
  ru: {
    searchPlaceholder: "Поиск героя: Арбитр, Сифи, Taras, фракция, роль...",
    allFactions: "Все фракции",
    allRoles: "Все роли",
    allRarities: "Все редкости",
    allAffinities: "Все стихии",
    filtersTitle: "Фильтры героев",
    adminTitle: "Публикация героев",
    adminDescription: "Каталог использует открытые данные Gestal для аватарок и портретов. Герои из Firestore остаются отдельными пользовательскими карточками с фото, сборкой и описанием."
  },
  en: {
    searchPlaceholder: "Search champion: Arbiter, Siphi, Taras, faction or role...",
    allFactions: "All factions",
    allRoles: "All roles",
    allRarities: "All rarities",
    allAffinities: "All affinities",
    filtersTitle: "Champion filters",
    adminTitle: "Admin hero publishing",
    adminDescription: "The catalog uses public Gestal data for avatars and portraits. Firestore heroes stay as separate custom cards with images, builds and notes."
  }
};

export default function HeroesPage() {
  const { language } = useLanguage();
  const t = copy[language];
  const [search, setSearch] = useState("");
  const [faction, setFaction] = useState("all");
  const [role, setRole] = useState("all");
  const [rarity, setRarity] = useState("all");
  const [affinity, setAffinity] = useState("all");
  const factionOptions = useMemo(() => Array.from(new Set(gestalChampions.map((hero) => hero.faction))).sort((a, b) => a.localeCompare(b)), []);

  return (
    <PageShell
      eyebrow={{ ru: "Герои", en: "Hero DB" }}
      title={{ ru: "База героев", en: "Hero database" }}
      description={{
        ru: "Каталог героев с аватарками, крупными портретами, фракциями, редкостью, стихией и ролями.",
        en: "Champion catalog with avatars, large portraits, factions, rarity, affinity and roles."
      }}
    >
      <GlassPanel className="mb-6 p-4">
        <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.26em] text-relic">
          <Filter size={16} />
          {t.filtersTitle}
        </div>
        <div className="grid gap-3 lg:grid-cols-[1.5fr_1fr_1fr_1fr_1fr]">
          <div className="flex min-h-11 items-center gap-2 rounded-xl border border-relic/20 bg-black/35 px-3 shadow-inner shadow-black/30">
            <Search size={18} className="text-relic" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={t.searchPlaceholder}
              className="min-w-0 flex-1 border-0 bg-transparent text-sm text-white placeholder:text-zinc-500 focus:ring-0"
            />
          </div>
          <select value={faction} onChange={(event) => setFaction(event.target.value)} className="min-h-11 rounded-xl border-relic/20 bg-black/35 text-sm text-white focus:border-relic focus:ring-relic">
            <option value="all">{t.allFactions}</option>
            {factionOptions.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          <select value={rarity} onChange={(event) => setRarity(event.target.value)} className="min-h-11 rounded-xl border-relic/20 bg-black/35 text-sm text-white focus:border-relic focus:ring-relic">
            <option value="all">{t.allRarities}</option>
            {rarityOptions.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label[language]}
              </option>
            ))}
          </select>
          <select value={affinity} onChange={(event) => setAffinity(event.target.value)} className="min-h-11 rounded-xl border-relic/20 bg-black/35 text-sm text-white focus:border-relic focus:ring-relic">
            <option value="all">{t.allAffinities}</option>
            {affinityOptions.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label[language]}
              </option>
            ))}
          </select>
          <select value={role} onChange={(event) => setRole(event.target.value)} className="min-h-11 rounded-xl border-relic/20 bg-black/35 text-sm text-white focus:border-relic focus:ring-relic">
            <option value="all">{t.allRoles}</option>
            {roleOptions.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label[language]}
              </option>
            ))}
          </select>
        </div>
      </GlassPanel>

      <HeroesCatalog searchQuery={search} factionFilter={faction} rarityFilter={rarity} affinityFilter={affinity} roleFilter={role} />

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
