import { Search, Star } from "lucide-react";
import { ChampionMultiplierSearch } from "@/components/heroes/champion-multiplier-search";
import { HeroesCatalog } from "@/components/heroes/heroes-catalog";
import { PageShell } from "@/components/layout/page-shell";
import { GlassPanel } from "@/components/ui/glass-panel";

export default function HeroesPage() {
  return (
    <PageShell
      eyebrow={{ ru: "Герои", en: "Hero DB" }}
      title={{ ru: "База героев", en: "Hero database" }}
      description={{
        ru: "Каталог героев с карточками, галереями, комментариями админов и поиском множителей навыков.",
        en: "Champion catalog with cards, galleries, admin notes and skill multiplier search."
      }}
    >
      <GlassPanel className="mb-6 p-4">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="flex flex-1 items-center gap-2 rounded-md border border-white/10 bg-black/30 px-3">
            <Search size={18} className="text-zinc-500" />
            <input
              placeholder="Search champion, faction or role..."
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
      <HeroesCatalog />

      <GlassPanel className="mt-6 p-6">
        <div className="flex items-center gap-3">
          <Star className="text-relic" />
          <h2 className="text-2xl font-bold text-white">Admin hero publishing</h2>
        </div>
        <p className="mt-3 text-sm leading-7 text-zinc-400">
          Firestore heroes support avatar, gallery screenshots, markdown comments and future video guide fields.
        </p>
      </GlassPanel>
    </PageShell>
  );
}
