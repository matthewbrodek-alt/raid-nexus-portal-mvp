import { PageShell } from "@/components/layout/page-shell";
import { DeadwoodArenaCalculator } from "@/components/tools/deadwood-arena-calculator";
import { DamageComparisonCalculator } from "@/components/tools/damage-comparison-calculator";
import { CollapsibleToolSection } from "@/components/tools/collapsible-tool-section";
import { ExternalRaidResources } from "@/components/tools/external-raid-resources";
import { TournamentBracketTool } from "@/components/tools/tournament-bracket-tool";

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
        <CollapsibleToolSection
          eyebrow="Arena speed tune"
          title="Калькулятор хода без разрыва"
          description="Расчет скорости для 2, 3 и 4 героя, чтобы они ходили после заливщика без вклинивания."
        >
          <DeadwoodArenaCalculator />
        </CollapsibleToolSection>

        <CollapsibleToolSection
          eyebrow="Damage comparison"
          title="Калькулятор сравнения урона"
          description="Сравнение двух сборок по стату, множителю, критическому урону, бонусам и защите цели."
        >
          <DamageComparisonCalculator />
        </CollapsibleToolSection>

        <CollapsibleToolSection
          eyebrow="Tournament bracket"
          title="Турнирная сетка"
          description="Простая сетка для обычного турнира и double elimination: добавь участников, выбери победителя матча, а проигравшие в double elimination уйдут в нижнюю сетку."
        >
          <TournamentBracketTool />
        </CollapsibleToolSection>

        <ExternalRaidResources />
      </div>
    </PageShell>
  );
}
