"use client";

import { Activity, Gauge, Percent, Zap } from "lucide-react";
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

function toNumber(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(Number.isFinite(value) ? value : min, min), max);
}

function formatNumber(value: number) {
  if (!Number.isFinite(value)) {
    return "моментальный ход";
  }

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

export function DeadwoodArenaCalculator() {
  const [displayedSpeed, setDisplayedSpeed] = useState(320);
  const [baseSpeed, setBaseSpeed] = useState(110);
  const [speedAura, setSpeedAura] = useState(30);
  const [increaseSpeed, setIncreaseSpeed] = useState(30);
  const [turnMeterBoost, setTurnMeterBoost] = useState(30);
  const [enemySpeed, setEnemySpeed] = useState(350);

  const result = useMemo(() => {
    const safeDisplayedSpeed = clamp(displayedSpeed, 0, 999);
    const safeBaseSpeed = clamp(baseSpeed, 0, 999);
    const safeAura = clamp(speedAura, 0, 50);
    const safeBuff = clamp(increaseSpeed, 0, 30);
    const safeTurnMeter = clamp(turnMeterBoost, 0, 99);
    const safeEnemySpeed = clamp(enemySpeed, 0, 999);

    const auraBonus = safeBaseSpeed * (safeAura / 100);
    const speedWithAura = safeDisplayedSpeed + auraBonus;
    const speedWithBuff = speedWithAura * (1 + safeBuff / 100);
    const effectivePressure = speedWithBuff / (1 - safeTurnMeter / 100);
    const neededSpeedToMatchEnemy = safeEnemySpeed * (1 - safeTurnMeter / 100);

    return {
      auraBonus,
      speedWithAura,
      speedWithBuff,
      effectivePressure,
      neededSpeedToMatchEnemy,
      advantage: speedWithBuff - neededSpeedToMatchEnemy
    };
  }, [baseSpeed, displayedSpeed, enemySpeed, increaseSpeed, speedAura, turnMeterBoost]);

  return (
    <GlassPanel className="overflow-hidden">
      <div className="border-b border-white/10 bg-gradient-to-r from-ember/15 via-black/20 to-relic/10 p-6">
        <div className="flex items-start gap-3">
          <span className="rounded-lg bg-ember/15 p-3 text-ember">
            <Zap />
          </span>
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-relic">Arena calculator</p>
            <h2 className="mt-1 text-2xl font-bold text-white">Калькулятор арены</h2>
            <p className="mt-2 text-sm leading-6 text-zinc-400">
              Модель для проверки скорости, ауры, Increase SPD и залива Turn Meter. Источник вдохновения: DeadwoodJedi Arena Calculator.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-5 p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <NumberField label="Скорость героя в игре" value={displayedSpeed} onChange={setDisplayedSpeed} />
          <NumberField label="Базовая скорость героя" value={baseSpeed} onChange={setBaseSpeed} />
          <NumberField label="Аура скорости" value={speedAura} onChange={setSpeedAura} max={50} suffix="%" />
          <NumberField label="Increase SPD" value={increaseSpeed} onChange={setIncreaseSpeed} max={30} suffix="%" />
          <NumberField label="Залив Turn Meter" value={turnMeterBoost} onChange={setTurnMeterBoost} max={99} suffix="%" />
          <NumberField label="Скорость противника" value={enemySpeed} onChange={setEnemySpeed} />
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-lg border border-relic/20 bg-relic/[0.08] p-4">
            <div className="flex items-center gap-2 text-sm text-zinc-400">
              <Percent className="h-4 w-4 text-relic" />
              Бонус ауры
            </div>
            <p className="mt-2 text-3xl font-black text-relic">+{formatNumber(result.auraBonus)}</p>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/[0.035] p-4">
            <div className="flex items-center gap-2 text-sm text-zinc-400">
              <Gauge className="h-4 w-4 text-ember" />
              После ауры и баффа
            </div>
            <p className="mt-2 text-3xl font-black text-white">{formatNumber(result.speedWithBuff)}</p>
            <p className="mt-1 text-xs text-zinc-500">После ауры: {formatNumber(result.speedWithAura)}</p>
          </div>
          <div className="rounded-lg border border-ember/20 bg-ember/[0.08] p-4">
            <div className="flex items-center gap-2 text-sm text-zinc-400">
              <Activity className="h-4 w-4 text-ember" />
              Давление хода
            </div>
            <p className="mt-2 text-3xl font-black text-ember">{formatNumber(result.effectivePressure)}</p>
          </div>
          <div className="rounded-lg border border-white/10 bg-black/25 p-4">
            <p className="text-sm text-zinc-400">Сравнение с противником</p>
            <p className={result.advantage >= 0 ? "mt-2 font-semibold text-emerald-300" : "mt-2 font-semibold text-rose-300"}>
              {result.advantage >= 0
                ? `Опережает на ${formatNumber(result.advantage)} скорости`
                : `Не хватает ${formatNumber(Math.abs(result.advantage))} скорости`}
            </p>
          </div>
        </div>
      </div>
    </GlassPanel>
  );
}
