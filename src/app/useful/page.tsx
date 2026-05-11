import { BookOpen, Flame, Trophy } from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";
import { ArenaBoostCalculator } from "@/components/tools/arena-boost-calculator";
import { SpeedCalcForm } from "@/components/tools/speed-calc-form";
import { GlassPanel } from "@/components/ui/glass-panel";
import { newsFeed } from "@/lib/data/mock";

export default function UsefulPage() {
  return (
    <PageShell
      eyebrow="Useful"
      title="Гайды, новости и инструменты"
      description="Раздел для полезного контента в стиле портала гайдов: быстрые новости, калькуляторы, будущие tier lists и тактики."
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
        <SpeedCalcForm />
        <GlassPanel className="p-6">
          <div className="mb-5 flex items-center gap-3">
            <BookOpen className="text-relic" />
            <h2 className="text-2xl font-bold text-white">Категории гайдов</h2>
          </div>
          <div className="grid gap-3">
            {[
              ["New Player Guides", "старт, миссии, промокоды, прогресс аккаунта"],
              ["Dungeon & Clan Boss", "speed tune, Demon Lord, Hydra, dungeon bosses"],
              ["Tools", "калькуляторы паков, скорости, эффективности и событий"]
            ].map(([title, text]) => (
              <div key={title} className="rounded-lg border border-white/10 bg-white/[0.035] p-4">
                <p className="font-semibold text-white">{title}</p>
                <p className="mt-1 text-sm text-zinc-400">{text}</p>
              </div>
            ))}
          </div>
        </GlassPanel>
      </div>

      <div className="mt-6">
        <ArenaBoostCalculator />
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {newsFeed.map((item, index) => (
          <GlassPanel key={item.title} className="p-5">
            <div className="mb-4 flex items-center gap-3">
              {index === 0 ? <Flame className="text-ember" /> : <Trophy className="text-relic" />}
              <p className="text-xs uppercase tracking-[0.18em] text-relic">{item.tag}</p>
            </div>
            <h2 className="text-xl font-bold text-white">{item.title}</h2>
            <p className="mt-2 text-sm leading-6 text-zinc-400">{item.summary}</p>
          </GlassPanel>
        ))}
      </div>
    </PageShell>
  );
}
