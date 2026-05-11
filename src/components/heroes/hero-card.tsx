import { Star, Sword } from "lucide-react";
import { GlassPanel } from "@/components/ui/glass-panel";
import type { HeroProfile } from "@/lib/types";

type HeroCardProps = {
  hero: HeroProfile;
};

export function HeroCard({ hero }: HeroCardProps) {
  return (
    <GlassPanel className="overflow-hidden">
      <div className="aspect-[16/10] bg-gradient-to-br from-charcoal via-black to-blood/35 p-5">
        <div className="flex h-full items-end justify-between">
          <div>
            <p className="text-sm text-relic">{hero.faction}</p>
            <h3 className="text-2xl font-bold text-white">{hero.name}</h3>
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
