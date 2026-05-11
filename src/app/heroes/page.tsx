import Link from "next/link";
import { Search, Star } from "lucide-react";
import { ChampionMultiplierSearch } from "@/components/heroes/champion-multiplier-search";
import { HeroCard } from "@/components/heroes/hero-card";
import { PageShell } from "@/components/layout/page-shell";
import { GlassPanel } from "@/components/ui/glass-panel";
import { featuredHeroes } from "@/lib/data/mock";

export default function HeroesPage() {
  return (
    <PageShell
      eyebrow="Hero DB"
      title="База героев"
      description="Каталог героев в формате отдельной базы: фильтры, карточки, подробные страницы, галерея, markdown-комментарии и видео-гайды."
    >
      <GlassPanel className="mb-6 p-4">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="flex flex-1 items-center gap-2 rounded-md border border-white/10 bg-black/30 px-3">
            <Search size={18} className="text-zinc-500" />
            <input
              placeholder="Поиск героя, фракции или роли..."
              className="min-w-0 flex-1 border-0 bg-transparent text-sm text-white placeholder:text-zinc-500 focus:ring-0"
            />
          </div>
          <select className="rounded-md border-white/10 bg-black/30 text-sm text-white focus:border-relic focus:ring-relic">
            <option>All factions</option>
            <option>High Elves</option>
            <option>Undead Hordes</option>
            <option>Banner Lords</option>
          </select>
          <select className="rounded-md border-white/10 bg-black/30 text-sm text-white focus:border-relic focus:ring-relic">
            <option>All roles</option>
            <option>Speed Lead</option>
            <option>Support</option>
            <option>Nuker</option>
          </select>
        </div>
      </GlassPanel>

      <ChampionMultiplierSearch />

      <div className="grid gap-4 md:grid-cols-3">
        {featuredHeroes.map((hero) => (
          <Link key={hero.id} href={`/heroes/${hero.slug ?? hero.id}`} className="block transition hover:-translate-y-1">
            <HeroCard hero={hero} />
          </Link>
        ))}
      </div>

      <GlassPanel className="mt-6 p-6">
        <div className="flex items-center gap-3">
          <Star className="text-relic" />
          <h2 className="text-2xl font-bold text-white">Админ-добавление героя</h2>
        </div>
        <p className="mt-3 text-sm leading-7 text-zinc-400">
          Схема Firestore уже включает avatar, 3+ gallery screenshots, markdownComment и будущий `youtubeVideoId`.
        </p>
      </GlassPanel>
    </PageShell>
  );
}
