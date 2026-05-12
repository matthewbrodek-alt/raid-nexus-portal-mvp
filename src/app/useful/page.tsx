import { BookOpen } from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";
import { DeadwoodArenaCalculator } from "@/components/tools/deadwood-arena-calculator";
import { DamageComparisonCalculator } from "@/components/tools/damage-comparison-calculator";
import { GlassPanel } from "@/components/ui/glass-panel";

export default function UsefulPage() {
  return (
    <PageShell
      eyebrow="Useful"
      title="Гайды и инструменты"
      description="Раздел для полезного контента в стиле портала гайдов: калькуляторы, будущие tier lists, тактики и рабочие заметки по Raid: Shadow Legends."
    >
      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <GlassPanel className="p-6">
          <div className="mb-5 flex items-center gap-3">
            <BookOpen className="text-relic" />
            <h2 className="text-2xl font-bold text-white">Категории гайдов</h2>
          </div>
          <div className="grid gap-3">
            {[
              ["New Player Guides", "старт, миссии, промокоды и прогресс аккаунта"],
              ["Dungeon & Clan Boss", "speed tune, Demon Lord, Hydra и dungeon bosses"],
              ["Tools", "калькуляторы арены, сравнения урона, эффективности и будущих событий"]
            ].map(([title, text]) => (
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
