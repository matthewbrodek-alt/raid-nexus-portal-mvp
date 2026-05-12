import { BookOpen } from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";
import { DeadwoodArenaCalculator } from "@/components/tools/deadwood-arena-calculator";
import { DamageComparisonCalculator } from "@/components/tools/damage-comparison-calculator";
import { GlassPanel } from "@/components/ui/glass-panel";

const usefulCopy = {
  title: "Guides and tools",
  description:
    "Useful Raid: Shadow Legends tools: calculators, future tier lists, tactics and working notes.",
  categoryTitle: "Guide categories",
  categories: [
    ["New Player Guides", "start, missions, promo codes and account progress"],
    ["Dungeon & Clan Boss", "speed tune, Demon Lord, Hydra and dungeon bosses"],
    ["Tools", "arena calculator, damage comparison, efficiency tools and future events"]
  ]
};

export default function UsefulPage() {
  return (
    <PageShell eyebrow="Useful" title={usefulCopy.title} description={usefulCopy.description}>
      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <GlassPanel className="p-6">
          <div className="mb-5 flex items-center gap-3">
            <BookOpen className="text-relic" />
            <h2 className="text-2xl font-bold text-white">{usefulCopy.categoryTitle}</h2>
          </div>
          <div className="grid gap-3">
            {usefulCopy.categories.map(([title, text]) => (
              <div key={title} className="rounded-lg border border-white/10 bg-white/[0.035] p-4">
                <p className="font-semibold text-white">{title}</p>
                <p className="mt-1 text-sm text-zinc-400">{text}</p>
              </div>
            ))}
          </div>
        </GlassPanel>

        <DeadwoodArenaCalculator />
      </div>

      <div className="mt-6">
        <DamageComparisonCalculator />
      </div>
    </PageShell>
  );
}
