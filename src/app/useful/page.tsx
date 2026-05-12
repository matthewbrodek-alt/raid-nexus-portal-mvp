import { PageShell } from "@/components/layout/page-shell";
import { DeadwoodArenaCalculator } from "@/components/tools/deadwood-arena-calculator";
import { DamageComparisonCalculator } from "@/components/tools/damage-comparison-calculator";

export default function UsefulPage() {
  return (
    <PageShell
      eyebrow={{ ru: "Полезное", en: "Useful" }}
      title={{ ru: "Гайды и инструменты", en: "Guides and tools" }}
      description={{
        ru: "Полезные инструменты Raid: Shadow Legends: калькуляторы, будущие tier lists, тактики и рабочие заметки.",
        en: "Useful Raid: Shadow Legends tools: calculators, future tier lists, tactics and working notes."
      }}
    >
      <div className="grid gap-6">
        <DeadwoodArenaCalculator />
      </div>

      <div className="mt-6">
        <DamageComparisonCalculator />
      </div>
    </PageShell>
  );
}
