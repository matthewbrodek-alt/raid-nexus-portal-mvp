"use client";

import { ExternalLink, Search, Sparkles, Swords } from "lucide-react";
import { useMemo, useState } from "react";
import { GlassPanel } from "@/components/ui/glass-panel";
import { championMultipliers, type ChampionMultiplierEntry } from "@/lib/data/champion-multipliers";

const allChampionMultipliers = championMultipliers as readonly ChampionMultiplierEntry[];

function normalize(value: string) {
  return value.toLowerCase().trim();
}

export function ChampionMultiplierSearch() {
  const [query, setQuery] = useState("");
  const normalizedQuery = normalize(query);

  const results = useMemo(() => {
    if (normalizedQuery.length < 2) {
      return [];
    }

    return allChampionMultipliers
      .filter((champion) => {
        const names = [champion.nameEn, champion.nameRu ?? ""].map(normalize);
        return names.some((name) => name.includes(normalizedQuery));
      })
      .slice(0, 24);
  }, [normalizedQuery]);

  const totalSkills = results.reduce((sum, champion) => sum + champion.skills.length, 0);

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
                <p className="text-xs uppercase tracking-[0.22em] text-relic">Damage multipliers</p>
                <h2 className="text-2xl font-bold text-white">Множители легендарных и мифических героев</h2>
              </div>
            </div>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-400">
              Введите имя героя, чтобы увидеть его множители. Таблица не раскрывается заранее, чтобы база героев
              не перегружала страницу.
            </p>
          </div>

          <div className="rounded-lg border border-relic/20 bg-black/25 px-4 py-3 text-sm text-zinc-300">
            <span className="text-relic">{allChampionMultipliers.length}</span> героев в базе
          </div>
        </div>
      </div>

      <div className="p-5">
        <label className="space-y-2">
          <span className="text-sm font-medium text-zinc-300">Введите имя героя, чтобы увидеть его множители</span>
          <div className="flex items-center gap-2 rounded-md border border-white/10 bg-black/30 px-3 focus-within:border-relic focus-within:ring-1 focus-within:ring-relic">
            <Search size={18} className="text-zinc-500" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Например: Arbiter, Lady Mikage, Trunda..."
              className="min-w-0 flex-1 border-0 bg-transparent text-sm text-white placeholder:text-zinc-500 focus:ring-0"
            />
          </div>
        </label>

        {normalizedQuery.length < 2 ? (
          <div className="mt-5 rounded-lg border border-white/10 bg-white/[0.025] p-5 text-sm leading-6 text-zinc-400">
            Список скрыт. Начните вводить имя героя на английском, и ниже появятся только совпадения с навыками,
            которые наносят урон.
          </div>
        ) : null}

        {normalizedQuery.length >= 2 && results.length === 0 ? (
          <div className="mt-5 rounded-lg border border-ember/20 bg-ember/[0.07] p-5 text-sm text-zinc-300">
            Герой не найден. Попробуйте английское имя из игры или укоротите запрос.
          </div>
        ) : null}

        {results.length > 0 ? (
          <div className="mt-5 space-y-4">
            <div className="flex flex-wrap items-center gap-2 text-sm text-zinc-400">
              <Sparkles className="h-4 w-4 text-relic" />
              Найдено героев: <span className="text-white">{results.length}</span>
              <span className="text-zinc-600">/</span>
              навыков с уроном: <span className="text-white">{totalSkills}</span>
            </div>

            {results.map((champion) => (
              <div key={champion.nameEn} className="rounded-lg border border-white/10 bg-black/25">
                <div className="flex flex-col gap-3 border-b border-white/10 p-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-xl font-bold text-white">{champion.nameRu ?? champion.nameEn}</h3>
                      {champion.nameRu ? <span className="text-sm text-zinc-500">/ {champion.nameEn}</span> : null}
                    </div>
                    <p className="mt-1 text-sm text-zinc-400">
                      {champion.rarity} · {champion.faction}
                    </p>
                  </div>
                  <a
                    href={champion.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-md border border-white/10 px-3 py-2 text-sm text-zinc-300 transition hover:border-relic/50 hover:text-relic"
                  >
                    Источник
                    <ExternalLink size={14} />
                  </a>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full min-w-[620px] text-left text-sm">
                    <thead className="bg-white/[0.035] text-xs uppercase tracking-[0.16em] text-zinc-500">
                      <tr>
                        <th className="px-4 py-3">Навык</th>
                        <th className="px-4 py-3">Форма</th>
                        <th className="px-4 py-3">Название</th>
                        <th className="px-4 py-3">Множитель</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                      {champion.skills.map((skill, index) => (
                        <tr key={`${champion.nameEn}-${skill.form ?? "Default"}-${skill.slot}-${index}`}>
                          <td className="px-4 py-3 font-semibold text-relic">{skill.slot}</td>
                          <td className="px-4 py-3 text-zinc-400">{skill.form ?? "Default"}</td>
                          <td className="px-4 py-3 text-white">{skill.name}</td>
                          <td className="px-4 py-3 font-semibold text-ember">{skill.multiplier}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </GlassPanel>
  );
}
