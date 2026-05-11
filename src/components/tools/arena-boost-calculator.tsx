"use client";

import { Activity, Gauge, Percent, Zap } from "lucide-react";
import { useMemo, useState } from "react";
import { GlassPanel } from "@/components/ui/glass-panel";

function clamp(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) {
    return min;
  }

  return Math.min(Math.max(value, min), max);
}

function toNumber(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatNumber(value: number) {
  if (!Number.isFinite(value)) {
    return "моментальный ход";
  }

  return new Intl.NumberFormat("ru-RU", {
    maximumFractionDigits: 1
  }).format(value);
}

type NumberFieldProps = {
  label: string;
  max?: number;
  min?: number;
  onChange: (value: number) => void;
  suffix?: string;
  value: number;
};

const boostPresets = [5, 10, 15, 20, 25, 30];

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
        {suffix ? (
          <span className="flex items-center border-l border-white/10 px-3 text-sm text-zinc-500">{suffix}</span>
        ) : null}
      </div>
    </label>
  );
}

function BoostField({ label, onChange, value }: Pick<NumberFieldProps, "label" | "onChange" | "value">) {
  return (
    <div className="space-y-3 rounded-lg border border-white/10 bg-white/[0.025] p-3">
      <NumberField label={label} value={value} onChange={onChange} max={100} suffix="%" />
      <div className="grid grid-cols-6 gap-1.5">
        {boostPresets.map((preset) => (
          <button
            key={preset}
            type="button"
            onClick={() => onChange(preset)}
            className={
              value === preset
                ? "rounded-md border border-relic/60 bg-relic/20 px-2 py-1 text-xs font-semibold text-relic"
                : "rounded-md border border-white/10 bg-black/25 px-2 py-1 text-xs text-zinc-400 transition hover:border-relic/40 hover:text-relic"
            }
          >
            {preset}
          </button>
        ))}
      </div>
    </div>
  );
}

export function ArenaBoostCalculator() {
  const [displayedSpeed, setDisplayedSpeed] = useState(320);
  const [baseSpeed, setBaseSpeed] = useState(100);
  const [speedAura, setSpeedAura] = useState(30);
  const [increaseSpeed, setIncreaseSpeed] = useState(30);
  const [boostOne, setBoostOne] = useState(30);
  const [boostTwo, setBoostTwo] = useState(15);
  const [boostThree, setBoostThree] = useState(0);
  const [targetSpeed, setTargetSpeed] = useState(350);

  const result = useMemo(() => {
    const safeBaseSpeed = clamp(baseSpeed, 0, 999);
    const safeDisplayedSpeed = clamp(displayedSpeed, 0, 999);
    const safeAura = clamp(speedAura, 0, 50);
    const safeIncreaseSpeed = clamp(increaseSpeed, 0, 30);
    const totalTurnMeterBoost = clamp(boostOne + boostTwo + boostThree, 0, 100);

    const auraBonus = safeBaseSpeed * (safeAura / 100);
    const speedWithAura = safeDisplayedSpeed + auraBonus;
    const speedWithBuff = speedWithAura * (1 + safeIncreaseSpeed / 100);
    const effectivePressure =
      totalTurnMeterBoost >= 99.9 ? Number.POSITIVE_INFINITY : speedWithBuff / (1 - totalTurnMeterBoost / 100);
    const targetDifference = speedWithBuff - clamp(targetSpeed, 0, 999);

    return {
      auraBonus,
      effectivePressure,
      speedWithAura,
      speedWithBuff,
      targetDifference,
      totalTurnMeterBoost
    };
  }, [baseSpeed, boostOne, boostThree, boostTwo, displayedSpeed, increaseSpeed, speedAura, targetSpeed]);

  return (
    <GlassPanel className="overflow-hidden">
      <div className="border-b border-white/10 bg-gradient-to-r from-ember/15 via-black/20 to-relic/10 p-6">
        <div className="flex items-start gap-3">
          <span className="rounded-lg bg-ember/15 p-3 text-ember">
            <Zap />
          </span>
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-relic">Arena tool</p>
            <h2 className="mt-1 text-2xl font-bold text-white">Калькулятор заливов арены</h2>
            <p className="mt-2 text-sm leading-6 text-zinc-400">
              Упрощенная модель для проверки ауры скорости, баффа Increase SPD и суммарного Fill Turn Meter
              без привязки к конкретным героям.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 p-6 xl:grid-cols-[1fr_0.9fr]">
        <div className="grid gap-4 sm:grid-cols-2">
          <NumberField label="Скорость героя в игре" value={displayedSpeed} onChange={setDisplayedSpeed} />
          <NumberField label="Базовая скорость героя" value={baseSpeed} onChange={setBaseSpeed} />
          <NumberField label="Аура скорости" value={speedAura} onChange={setSpeedAura} max={50} suffix="%" />

          <label className="space-y-2">
            <span className="text-sm text-zinc-300">Increase SPD</span>
            <select
              value={increaseSpeed}
              onChange={(event) => setIncreaseSpeed(toNumber(event.target.value))}
              className="w-full rounded-md border-white/10 bg-black/30 text-white focus:border-relic focus:ring-relic"
            >
              <option value={0}>Нет баффа</option>
              <option value={15}>15%</option>
              <option value={30}>30%</option>
            </select>
          </label>

          <BoostField label="Залив Turn Meter 1" value={boostOne} onChange={setBoostOne} />
          <BoostField label="Залив Turn Meter 2" value={boostTwo} onChange={setBoostTwo} />
          <BoostField label="Залив Turn Meter 3" value={boostThree} onChange={setBoostThree} />
          <NumberField label="Скорость цели для сравнения" value={targetSpeed} onChange={setTargetSpeed} />
        </div>

        <div className="grid gap-3">
          <div className="rounded-lg border border-relic/20 bg-relic/[0.08] p-4">
            <div className="flex items-center gap-2 text-sm text-zinc-400">
              <Percent className="h-4 w-4 text-relic" />
              Бонус от ауры
            </div>
            <p className="mt-2 text-3xl font-black text-relic">+{formatNumber(result.auraBonus)}</p>
            <p className="mt-1 text-xs text-zinc-500">Аура считается от базовой скорости героя.</p>
          </div>

          <div className="rounded-lg border border-white/10 bg-white/[0.035] p-4">
            <div className="flex items-center gap-2 text-sm text-zinc-400">
              <Gauge className="h-4 w-4 text-ember" />
              Скорость после ауры и Increase SPD
            </div>
            <p className="mt-2 text-3xl font-black text-white">{formatNumber(result.speedWithBuff)}</p>
            <p className="mt-1 text-xs text-zinc-500">До баффа Increase SPD: {formatNumber(result.speedWithAura)}</p>
          </div>

          <div className="rounded-lg border border-ember/20 bg-ember/[0.08] p-4">
            <div className="flex items-center gap-2 text-sm text-zinc-400">
              <Activity className="h-4 w-4 text-ember" />
              Суммарный залив Turn Meter
            </div>
            <p className="mt-2 text-3xl font-black text-ember">{formatNumber(result.totalTurnMeterBoost)}%</p>
            <p className="mt-1 text-xs text-zinc-500">
              Эквивалент давления по ходу:{" "}
              {Number.isFinite(result.effectivePressure)
                ? `${formatNumber(result.effectivePressure)} скорости`
                : "моментальный ход"}.
            </p>
          </div>

          <div className="rounded-lg border border-white/10 bg-black/25 p-4">
            <p className="text-sm text-zinc-400">Сравнение с целью</p>
            <p className={result.targetDifference >= 0 ? "mt-2 font-semibold text-emerald-300" : "mt-2 font-semibold text-rose-300"}>
              {result.targetDifference >= 0
                ? `Быстрее на ${formatNumber(result.targetDifference)} скорости`
                : `Медленнее на ${formatNumber(Math.abs(result.targetDifference))} скорости`}
            </p>
          </div>
        </div>
      </div>
    </GlassPanel>
  );
}
