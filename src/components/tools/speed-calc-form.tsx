"use client";

import { Calculator } from "lucide-react";
import { useMemo, useState } from "react";
import { GlassPanel } from "@/components/ui/glass-panel";

export function SpeedCalcForm() {
  const [baseSpeed, setBaseSpeed] = useState(220);
  const [aura, setAura] = useState(24);
  const [mastery, setMastery] = useState(6);

  const result = useMemo(() => {
    return Math.round(baseSpeed * (1 + aura / 100) + mastery);
  }, [baseSpeed, aura, mastery]);

  return (
    <GlassPanel className="p-6">
      <div className="mb-5 flex items-center gap-3">
        <span className="rounded-lg bg-relic/15 p-3 text-relic">
          <Calculator />
        </span>
        <div>
          <h2 className="text-2xl font-bold text-white">Калькулятор скоростей</h2>
          <p className="text-sm text-zinc-400">PvP / Clan Boss с учетом аур и талантов.</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <label className="space-y-2">
          <span className="text-sm text-zinc-300">Базовая скорость</span>
          <input
            type="number"
            value={baseSpeed}
            onChange={(event) => setBaseSpeed(Number(event.target.value))}
            className="w-full rounded-md border-white/10 bg-black/30 text-white focus:border-relic focus:ring-relic"
          />
        </label>
        <label className="space-y-2">
          <span className="text-sm text-zinc-300">Аура, %</span>
          <input
            type="number"
            value={aura}
            onChange={(event) => setAura(Number(event.target.value))}
            className="w-full rounded-md border-white/10 bg-black/30 text-white focus:border-relic focus:ring-relic"
          />
        </label>
        <label className="space-y-2">
          <span className="text-sm text-zinc-300">Таланты</span>
          <input
            type="number"
            value={mastery}
            onChange={(event) => setMastery(Number(event.target.value))}
            className="w-full rounded-md border-white/10 bg-black/30 text-white focus:border-relic focus:ring-relic"
          />
        </label>
      </div>

      <div className="mt-5 rounded-lg border border-relic/20 bg-relic/[0.08] p-4">
        <p className="text-sm text-zinc-400">Итоговая расчетная скорость</p>
        <p className="mt-1 text-4xl font-black text-relic">{result}</p>
      </div>
    </GlassPanel>
  );
}
