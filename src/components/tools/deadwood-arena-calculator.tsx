"use client";

import { CheckCircle2, Gauge, ShieldAlert, Zap } from "lucide-react";
import { useMemo, useState } from "react";
import { GlassPanel } from "@/components/ui/glass-panel";

type NumberFieldProps = {
  label: string;
  max?: number;
  min?: number;
  onChange: (value: number) => void;
  suffix?: string;
  value: number;
};

type SlotResult = {
  actualShownSpeed: number;
  cumulativeBoost: number;
  neededEffectiveSpeed: number;
  neededShownSpeed: number;
  slot: string;
  tuned: boolean;
};

function toNumber(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(Number.isFinite(value) ? value : min, min), max);
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("ru-RU", {
    maximumFractionDigits: 1
  }).format(value);
}

function NumberField({ label, max, min = 0, onChange, suffix, value }: NumberFieldProps) {
  return (
    <label className="space-y-2">
      <span className="text-sm text-zinc-300">{label}</span>
      <div className="flex overflow-hidden rounded-md border border-white/10 bg-black/30 focus-within:border-relic focus-within:ring-1 focus-within:ring-relic">
        <input
          type="number"
          min={min}
          max={max}
          value={value}
          onChange={(event) => onChange(toNumber(event.target.value))}
          className="min-w-0 flex-1 border-0 bg-transparent text-white focus:ring-0"
        />
        {suffix ? <span className="flex items-center border-l border-white/10 px-3 text-sm text-zinc-500">{suffix}</span> : null}
      </div>
    </label>
  );
}

function calculateSlot({
  actualShownSpeed,
  baseSpeed,
  boosterEffectiveSpeed,
  cumulativeBoost,
  safetySpeed,
  slot,
  speedAura
}: {
  actualShownSpeed: number;
  baseSpeed: number;
  boosterEffectiveSpeed: number;
  cumulativeBoost: number;
  safetySpeed: number;
  slot: string;
  speedAura: number;
}): SlotResult {
  const safeBoost = clamp(cumulativeBoost, 0, 99);
  const auraBonus = baseSpeed * (speedAura / 100);
  const neededEffectiveSpeed = boosterEffectiveSpeed * (1 - safeBoost / 100) + safetySpeed;
  const neededShownSpeed = Math.max(0, Math.ceil(neededEffectiveSpeed - auraBonus));
  const actualEffectiveSpeed = actualShownSpeed + auraBonus;

  return {
    actualShownSpeed,
    cumulativeBoost: safeBoost,
    neededEffectiveSpeed,
    neededShownSpeed,
    slot,
    tuned: actualEffectiveSpeed >= neededEffectiveSpeed
  };
}

export function DeadwoodArenaCalculator() {
  const [boosterShownSpeed, setBoosterShownSpeed] = useState(330);
  const [boosterBaseSpeed, setBoosterBaseSpeed] = useState(110);
  const [speedAura, setSpeedAura] = useState(30);
  const [safetySpeed, setSafetySpeed] = useState(1);

  const [boostAfterFirst, setBoostAfterFirst] = useState(30);
  const [boostAfterSecond, setBoostAfterSecond] = useState(0);
  const [boostAfterThird, setBoostAfterThird] = useState(0);

  const [secondBaseSpeed, setSecondBaseSpeed] = useState(100);
  const [thirdBaseSpeed, setThirdBaseSpeed] = useState(100);
  const [fourthBaseSpeed, setFourthBaseSpeed] = useState(100);

  const [secondShownSpeed, setSecondShownSpeed] = useState(240);
  const [thirdShownSpeed, setThirdShownSpeed] = useState(235);
  const [fourthShownSpeed, setFourthShownSpeed] = useState(230);

  const result = useMemo(() => {
    const safeAura = clamp(speedAura, 0, 50);
    const boosterEffectiveSpeed = boosterShownSpeed + boosterBaseSpeed * (safeAura / 100);
    const secondBoost = boostAfterFirst;
    const thirdBoost = boostAfterFirst + boostAfterSecond;
    const fourthBoost = boostAfterFirst + boostAfterSecond + boostAfterThird;

    const slots = [
      calculateSlot({
        actualShownSpeed: secondShownSpeed,
        baseSpeed: secondBaseSpeed,
        boosterEffectiveSpeed,
        cumulativeBoost: secondBoost,
        safetySpeed,
        slot: "Hero 2",
        speedAura: safeAura
      }),
      calculateSlot({
        actualShownSpeed: thirdShownSpeed,
        baseSpeed: thirdBaseSpeed,
        boosterEffectiveSpeed,
        cumulativeBoost: thirdBoost,
        safetySpeed,
        slot: "Hero 3",
        speedAura: safeAura
      }),
      calculateSlot({
        actualShownSpeed: fourthShownSpeed,
        baseSpeed: fourthBaseSpeed,
        boosterEffectiveSpeed,
        cumulativeBoost: fourthBoost,
        safetySpeed,
        slot: "Hero 4",
        speedAura: safeAura
      })
    ];

    return {
      boosterEffectiveSpeed,
      boosterAuraBonus: boosterBaseSpeed * (safeAura / 100),
      slots
    };
  }, [
    boostAfterFirst,
    boostAfterSecond,
    boostAfterThird,
    boosterBaseSpeed,
    boosterShownSpeed,
    fourthBaseSpeed,
    fourthShownSpeed,
    safetySpeed,
    secondBaseSpeed,
    secondShownSpeed,
    speedAura,
    thirdBaseSpeed,
    thirdShownSpeed
  ]);

  return (
    <GlassPanel className="overflow-hidden">
      <div className="border-b border-white/10 bg-gradient-to-r from-ember/15 via-black/20 to-relic/10 p-6">
        <div className="flex items-start gap-3">
          <span className="rounded-lg bg-ember/15 p-3 text-ember">
            <Zap />
          </span>
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-relic">Arena speed tune</p>
            <h2 className="mt-1 text-2xl font-bold text-white">No-cut arena calculator</h2>
            <p className="mt-2 text-sm leading-6 text-zinc-400">
              Enter the speed of your first turn meter booster. The calculator shows the minimum stat speed needed for heroes 2, 3 and 4 to move right after the booster with no gap. Inspired by DeadwoodJedi Arena Calculator.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 p-6 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-5">
          <div className="rounded-lg border border-relic/20 bg-relic/[0.06] p-4">
            <div className="mb-4 flex items-center gap-2">
              <Gauge className="h-5 w-5 text-relic" />
              <h3 className="text-lg font-black text-white">Hero 1 / turn meter booster</h3>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <NumberField label="Shown speed" value={boosterShownSpeed} onChange={setBoosterShownSpeed} />
              <NumberField label="Base speed" value={boosterBaseSpeed} onChange={setBoosterBaseSpeed} />
              <NumberField label="Speed aura" value={speedAura} onChange={setSpeedAura} max={50} suffix="%" />
              <NumberField label="Safety margin" value={safetySpeed} onChange={setSafetySpeed} max={20} suffix="spd" />
            </div>
            <div className="mt-4 rounded-md border border-white/10 bg-black/25 p-3">
              <p className="text-sm text-zinc-400">Hero 1 effective speed with aura</p>
              <p className="mt-1 text-3xl font-black text-relic">{formatNumber(result.boosterEffectiveSpeed)}</p>
              <p className="mt-1 text-xs text-zinc-500">Aura bonus: +{formatNumber(result.boosterAuraBonus)}</p>
            </div>
          </div>

          <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
            <h3 className="mb-4 text-lg font-black text-white">Turn meter boosts in order</h3>
            <div className="grid gap-4 sm:grid-cols-3">
              <NumberField label="After hero 1" value={boostAfterFirst} onChange={setBoostAfterFirst} max={99} suffix="%" />
              <NumberField label="After hero 2" value={boostAfterSecond} onChange={setBoostAfterSecond} max={99} suffix="%" />
              <NumberField label="After hero 3" value={boostAfterThird} onChange={setBoostAfterThird} max={99} suffix="%" />
            </div>
            <p className="mt-3 text-xs leading-5 text-zinc-500">
              Example: Arbiter gives 30% after the first move. If hero 2 also boosts turn meter, add that value in "After hero 2".
            </p>
          </div>

          <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
            <h3 className="mb-4 text-lg font-black text-white">Check your current speeds</h3>
            <div className="grid gap-4 sm:grid-cols-3">
              <NumberField label="Hero 2 shown speed" value={secondShownSpeed} onChange={setSecondShownSpeed} />
              <NumberField label="Hero 3 shown speed" value={thirdShownSpeed} onChange={setThirdShownSpeed} />
              <NumberField label="Hero 4 shown speed" value={fourthShownSpeed} onChange={setFourthShownSpeed} />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
            <h3 className="mb-4 text-lg font-black text-white">Follower base speeds</h3>
            <div className="grid gap-4 sm:grid-cols-3">
              <NumberField label="Hero 2 base" value={secondBaseSpeed} onChange={setSecondBaseSpeed} />
              <NumberField label="Hero 3 base" value={thirdBaseSpeed} onChange={setThirdBaseSpeed} />
              <NumberField label="Hero 4 base" value={fourthBaseSpeed} onChange={setFourthBaseSpeed} />
            </div>
          </div>

          <div className="grid gap-3">
            {result.slots.map((slot) => (
              <div key={slot.slot} className="rounded-lg border border-white/10 bg-black/25 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-relic">{slot.slot}</p>
                    <h3 className="mt-1 text-2xl font-black text-white">Needs {slot.neededShownSpeed} speed</h3>
                  </div>
                  <span className={slot.tuned ? "text-emerald-300" : "text-rose-300"}>
                    {slot.tuned ? <CheckCircle2 /> : <ShieldAlert />}
                  </span>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-md border border-white/10 bg-white/[0.035] p-3">
                    <p className="text-xs text-zinc-500">Current speed</p>
                    <p className="mt-1 text-xl font-black text-white">{slot.actualShownSpeed}</p>
                  </div>
                  <div className="rounded-md border border-white/10 bg-white/[0.035] p-3">
                    <p className="text-xs text-zinc-500">Total TM boost</p>
                    <p className="mt-1 text-xl font-black text-relic">{slot.cumulativeBoost}%</p>
                  </div>
                  <div className="rounded-md border border-white/10 bg-white/[0.035] p-3">
                    <p className="text-xs text-zinc-500">Effective needed</p>
                    <p className="mt-1 text-xl font-black text-ember">{formatNumber(slot.neededEffectiveSpeed)}</p>
                  </div>
                </div>
                <p className={slot.tuned ? "mt-3 text-sm text-emerald-300" : "mt-3 text-sm text-rose-300"}>
                  {slot.tuned ? "Speed is enough for a no-cut turn order." : `Add at least ${Math.max(0, slot.neededShownSpeed - slot.actualShownSpeed)} speed.`}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </GlassPanel>
  );
}
