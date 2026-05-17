"use client";

import { ChevronDown, ChevronUp, ExternalLink, Search, Sparkles, Swords } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { GlassPanel } from "@/components/ui/glass-panel";
import {
  formatEnglishChampionName,
  getChampionRussianName,
  getChampionSearchHaystack,
  normalizeChampionSearch
} from "@/lib/data/champion-localization";
import { championMultipliers, type ChampionMultiplierEntry } from "@/lib/data/champion-multipliers";
import { useLanguage, type Language } from "@/lib/i18n/use-language";

const allChampionMultipliers = (championMultipliers as readonly ChampionMultiplierEntry[]).filter(
  (champion) => champion.rarity === "Mythical" || champion.rarity === "Legendary"
);

type RarityFilter = "all" | "Mythical" | "Legendary";

const copy: Record<
  Language,
  {
    eyebrow: string;
    title: string;
    description: string;
    totalLabel: string;
    searchLabel: string;
    placeholder: string;
    foundHeroes: string;
    damageSkills: string;
    source: string;
    skill: string;
    form: string;
    skillName: string;
    multiplier: string;
    defaultForm: string;
    showMore: string;
    showList: string;
    hideList: string;
    startSearch: string;
    noResults: string;
    lastUpdate: string;
    filters: Record<RarityFilter, string>;
    rarity: Record<ChampionMultiplierEntry["rarity"], string>;
  }
> = {
  ru: {
    eyebrow: "Множители урона",
    title: "Мифические и легендарные герои",
    description:
      "Список закрыт по умолчанию. Введите имя героя на русском или английском либо откройте список вручную.",
    totalLabel: "героев в базе",
    searchLabel: "Поиск героя",
    placeholder: "Например: Джоан, Арбитр, Сифи, Taras, Joan...",
    foundHeroes: "Найдено героев",
    damageSkills: "навыков с уроном",
    source: "Источник",
    skill: "Навык",
    form: "Форма",
    skillName: "Название",
    multiplier: "Множитель",
    defaultForm: "Основная",
    showMore: "Показать еще",
    showList: "Показать список",
    hideList: "Скрыть список",
    startSearch: "Введите минимум 2 символа или откройте список вручную.",
    noResults: "Герой не найден. Попробуйте русское или английское имя, либо укоротите запрос.",
    lastUpdate: "Русские имена взяты из raid-legends.ru",
    filters: {
      all: "Все",
      Mythical: "Мифические",
      Legendary: "Легендарные"
    },
    rarity: {
      Mythical: "Мифический",
      Legendary: "Легендарный"
    }
  },
  en: {
    eyebrow: "Damage multipliers",
    title: "Mythical and Legendary champions",
    description:
      "The full list is collapsed by default. Search by Russian or English champion name, or open the list manually.",
    totalLabel: "champions in database",
    searchLabel: "Search champion",
    placeholder: "For example: Joan, Arbiter, Siphi, Taras...",
    foundHeroes: "Champions found",
    damageSkills: "damage skills",
    source: "Source",
    skill: "Skill",
    form: "Form",
    skillName: "Name",
    multiplier: "Multiplier",
    defaultForm: "Default",
    showMore: "Show more",
    showList: "Show list",
    hideList: "Hide list",
    startSearch: "Enter at least 2 characters or open the list manually.",
    noResults: "Champion not found. Try the English/Russian name or shorten the query.",
    lastUpdate: "Russian names sourced from raid-legends.ru",
    filters: {
      all: "All",
      Mythical: "Mythical",
      Legendary: "Legendary"
    },
    rarity: {
      Mythical: "Mythical",
      Legendary: "Legendary"
    }
  }
};

function getFormattedDisplayName(champion: ChampionMultiplierEntry, language: Language) {
  const englishName = formatEnglishChampionName(champion.nameEn);
  const russianName = getChampionRussianName(champion);

  return language === "ru" ? `${russianName} (${englishName})` : `${englishName} (${russianName})`;
}

function getRarityOrder(rarity: ChampionMultiplierEntry["rarity"]) {
  return rarity === "Mythical" ? 0 : 1;
}

export function ChampionMultiplierSearch() {
  const { language } = useLanguage();
  const t = copy[language];
  const [query, setQuery] = useState("");
  const [rarityFilter, setRarityFilter] = useState<RarityFilter>("all");
  const [visibleCount, setVisibleCount] = useState(18);
  const [isListOpen, setIsListOpen] = useState(false);
  const normalizedQuery = normalizeChampionSearch(query);
  const shouldShowResults = isListOpen || normalizedQuery.length >= 2;

  useEffect(() => {
    setVisibleCount(18);
  }, [normalizedQuery, rarityFilter, isListOpen]);

  const filteredChampions = useMemo(() => {
    if (!shouldShowResults) {
      return [];
    }

    return allChampionMultipliers
      .filter((champion) => rarityFilter === "all" || champion.rarity === rarityFilter)
      .filter((champion) => {
        if (normalizedQuery.length < 2) {
          return true;
        }

        return getChampionSearchHaystack(champion).includes(normalizedQuery);
      })
      .sort((a, b) => {
        const rarityDifference = getRarityOrder(a.rarity) - getRarityOrder(b.rarity);

        if (rarityDifference !== 0) {
          return rarityDifference;
        }

        return getChampionRussianName(a).localeCompare(getChampionRussianName(b), language === "ru" ? "ru" : "en");
      });
  }, [language, normalizedQuery, rarityFilter, shouldShowResults]);

  const results = filteredChampions.slice(0, visibleCount);
  const totalSkills = results.reduce((sum, champion) => sum + champion.skills.length, 0);
  const totalMythical = allChampionMultipliers.filter((champion) => champion.rarity === "Mythical").length;
  const totalLegendary = allChampionMultipliers.filter((champion) => champion.rarity === "Legendary").length;

  return (
    <GlassPanel className="mb-6 overflow-hidden">
      <div className="border-b border-white/10 bg-gradient-to-r from-relic/10 via-black/10 to-ember/10 p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <span className="rounded-lg bg-ember/15 p-3 text-ember">
                <Swords />
              </span>
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-relic">{t.eyebrow}</p>
                <h2 className="text-2xl font-bold text-white">{t.title}</h2>
              </div>
            </div>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-400">{t.description}</p>
          </div>

          <div className="rounded-lg border border-relic/20 bg-black/25 px-4 py-3 text-sm text-zinc-300">
            <span className="text-relic">{allChampionMultipliers.length}</span> {t.totalLabel}
            <span className="mt-1 block text-xs text-zinc-500">
              {t.filters.Mythical}: {totalMythical} · {t.filters.Legendary}: {totalLegendary}
            </span>
          </div>
        </div>
      </div>

      <div className="p-5">
        <div className="grid gap-3 lg:grid-cols-[1fr_auto]">
          <label className="space-y-2">
            <span className="text-sm font-medium text-zinc-300">{t.searchLabel}</span>
            <div className="flex items-center gap-2 rounded-md border border-white/10 bg-black/30 px-3 focus-within:border-relic focus-within:ring-1 focus-within:ring-relic">
              <Search size={18} className="text-zinc-500" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={t.placeholder}
                className="min-w-0 flex-1 border-0 bg-transparent text-sm text-white placeholder:text-zinc-500 focus:ring-0"
              />
            </div>
          </label>

          <div className="flex flex-wrap items-end gap-2">
            {(["all", "Mythical", "Legendary"] as const).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => {
                  setRarityFilter(item);
                  setIsListOpen(true);
                }}
                className={`rounded-md border px-4 py-2 text-sm font-bold transition ${
                  rarityFilter === item
                    ? "border-relic/55 bg-relic text-black"
                    : "border-white/10 bg-black/30 text-zinc-300 hover:border-relic/50 hover:text-relic"
                }`}
              >
                {t.filters[item]}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setIsListOpen((current) => !current)}
              className="inline-flex items-center gap-2 rounded-md border border-relic/30 bg-relic/[0.08] px-4 py-2 text-sm font-bold text-relic transition hover:bg-relic hover:text-black"
            >
              {isListOpen ? (
                <>
                  {t.hideList}
                  <ChevronUp size={16} />
                </>
              ) : (
                <>
                  {t.showList}
                  <ChevronDown size={16} />
                </>
              )}
            </button>
          </div>
        </div>

        {!shouldShowResults ? (
          <div className="mt-5 rounded-lg border border-white/10 bg-black/25 p-5 text-sm text-zinc-400">{t.startSearch}</div>
        ) : null}

        {shouldShowResults && filteredChampions.length === 0 ? (
          <div className="mt-5 rounded-lg border border-ember/20 bg-ember/[0.07] p-5 text-sm text-zinc-300">{t.noResults}</div>
        ) : null}

        {results.length > 0 ? (
          <div className="mt-5 space-y-4">
            <div className="flex flex-wrap items-center gap-2 text-sm text-zinc-400">
              <Sparkles className="h-4 w-4 text-relic" />
              {t.foundHeroes}: <span className="text-white">{filteredChampions.length}</span>
              <span className="text-zinc-600">/</span>
              {t.damageSkills}: <span className="text-white">{totalSkills}</span>
              <span className="text-zinc-600">/</span>
              <span>{t.lastUpdate}</span>
            </div>

            {results.map((champion) => (
              <div key={champion.nameEn} className="rounded-lg border border-white/10 bg-black/25">
                <div className="flex flex-col gap-3 border-b border-white/10 p-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-white">{getFormattedDisplayName(champion, language)}</h3>
                    <p className="mt-1 text-sm text-zinc-400">
                      {t.rarity[champion.rarity]} · {champion.faction}
                    </p>
                  </div>
                  <a
                    href={champion.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-md border border-white/10 px-3 py-2 text-sm text-zinc-300 transition hover:border-relic/50 hover:text-relic"
                  >
                    {t.source}
                    <ExternalLink size={14} />
                  </a>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full min-w-[620px] text-left text-sm">
                    <thead className="bg-white/[0.035] text-xs uppercase tracking-[0.16em] text-zinc-500">
                      <tr>
                        <th className="px-4 py-3">{t.skill}</th>
                        <th className="px-4 py-3">{t.form}</th>
                        <th className="px-4 py-3">{t.skillName}</th>
                        <th className="px-4 py-3">{t.multiplier}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                      {champion.skills.map((skill, index) => (
                        <tr key={`${champion.nameEn}-${skill.form ?? "Default"}-${skill.slot}-${index}`}>
                          <td className="px-4 py-3 font-semibold text-relic">{skill.slot}</td>
                          <td className="px-4 py-3 text-zinc-400">{skill.form ?? t.defaultForm}</td>
                          <td className="px-4 py-3 text-white">{skill.name}</td>
                          <td className="px-4 py-3 font-semibold text-ember">{skill.multiplier}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}

            {visibleCount < filteredChampions.length ? (
              <button
                type="button"
                onClick={() => setVisibleCount((current) => current + 18)}
                className="w-full rounded-md border border-relic/30 bg-relic/[0.08] px-4 py-3 text-sm font-bold uppercase tracking-[0.16em] text-relic transition hover:bg-relic hover:text-black"
              >
                {t.showMore}
              </button>
            ) : null}
          </div>
        ) : null}
      </div>
    </GlassPanel>
  );
}
