"use client";

import { Calculator, Shield, Swords } from "lucide-react";
import { useMemo, useState } from "react";
import { GlassPanel } from "@/components/ui/glass-panel";

type DamageProfile = {
  bonus: number;
  critDamage: number;
  ignoreDefense: number;
  multiplier: number;
  stat: number;
  targetDefense: number;
};

type DamageField = keyof DamageProfile;

function toNumber(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("ru-RU", {
    maximumFractionDigits: 0
  }).format(Math.max(0, value));
}

function calculateDamage(profile: DamageProfile) {
  const effectiveDefense = Math.max(0, profile.targetDefense * (1 - profile.ignoreDefense / 100));
  const defenseMultiplier = 1 - effectiveDefense / (effectiveDefense + 1500);
  const rawDamage = profile.stat * profile.multiplier * (1 + profile.critDamage / 100) * (1 + profile.bonus / 100);

  return rawDamage * defenseMultiplier;
}

function Field({
  label,
  max,
  onChange,
  suffix,
  value
}: {
  label: string;
  max?: number;
  onChange: (value: number) => void;
  suffix?: string;
  value: number;
}) {
  return (
    <label className="space-y-2">
      <span className="text-sm text-zinc-300">{label}</span>
      <div className="flex overflow-hidden rounded-md border border-white/10 bg-black/30 focus-within:border-relic focus-within:ring-1 focus-within:ring-relic">
        <input
          type="number"
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

function DamageProfileForm({
  onChange,
  profile,
  title
}: {
  onChange: (next: DamageProfile) => void;
  profile: DamageProfile;
  title: string;
}) {
  function update(field: DamageField, value: number) {
    onChange({ ...profile, [field]: value });
  }

  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
      <h3 className="mb-4 text-xl font-black text-white">{title}</h3>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <Field label="Основной стат" value={profile.stat} onChange={(value) => update("stat", value)} />
        <Field label="Множитель навыка" value={profile.multiplier} onChange={(value) => update("multiplier", value)} />
        <Field label="Крит. урон" value={profile.critDamage} onChange={(value) => update("critDamage", value)} suffix="%" />
        <Field label="Бонус урона" value={profile.bonus} onChange={(value) => update("bonus", value)} suffix="%" />
        <Field label="Защита цели" value={profile.targetDefense} onChange={(value) => update("targetDefense", value)} />
        <Field label="Игнор защиты" value={profile.ignoreDefense} onChange={(value) => update("ignoreDefense", value)} max={100} suffix="%" />
      </div>
    </div>
  );
}

export function DamageComparisonCalculator() {
  const [firstProfile, setFirstProfile] = useState<DamageProfile>({
    stat: 5200,
    multiplier: 4,
    critDamage: 220,
    bonus: 0,
    targetDefense: 3200,
    ignoreDefense: 0
  });
  const [secondProfile, setSecondProfile] = useState<DamageProfile>({
    stat: 4800,
    multiplier: 4.6,
    critDamage: 250,
    bonus: 20,
    targetDefense: 3200,
    ignoreDefense: 25
  });

  const result = useMemo(() => {
    const firstDamage = calculateDamage(firstProfile);
    const secondDamage = calculateDamage(secondProfile);
    const difference = secondDamage - firstDamage;
    const percent = firstDamage > 0 ? (difference / firstDamage) * 100 : 0;

    return { firstDamage, secondDamage, difference, percent };
  }, [firstProfile, secondProfile]);

  return (
    <GlassPanel className="overflow-hidden">
      <div className="border-b border-white/10 bg-gradient-to-r from-blood/20 via-black/20 to-ember/10 p-6">
        <div className="flex items-start gap-3">
          <span className="rounded-lg bg-blood/15 p-3 text-ember">
            <Swords />
          </span>
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-relic">Damage comparison</p>
            <h2 className="mt-1 text-2xl font-bold text-white">Калькулятор сравнения урона</h2>
            <p className="mt-2 text-sm leading-6 text-zinc-400">
              Упрощенная модель сравнения двух сборок. Авторство расчетного подхода: Rrdd.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-5 p-6">
        <DamageProfileForm title="Сборка A" profile={firstProfile} onChange={setFirstProfile} />
        <DamageProfileForm title="Сборка B" profile={secondProfile} onChange={setSecondProfile} />

        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-lg border border-white/10 bg-black/25 p-4">
            <div className="flex items-center gap-2 text-sm text-zinc-400">
              <Calculator className="h-4 w-4 text-relic" />
              Сборка A
            </div>
            <p className="mt-2 text-3xl font-black text-white">{formatNumber(result.firstDamage)}</p>
          </div>
          <div className="rounded-lg border border-white/10 bg-black/25 p-4">
            <div className="flex items-center gap-2 text-sm text-zinc-400">
              <Shield className="h-4 w-4 text-ember" />
              Сборка B
            </div>
            <p className="mt-2 text-3xl font-black text-white">{formatNumber(result.secondDamage)}</p>
          </div>
          <div className="rounded-lg border border-relic/20 bg-relic/[0.08] p-4">
            <p className="text-sm text-zinc-400">Разница</p>
            <p className={result.difference >= 0 ? "mt-2 text-3xl font-black text-emerald-300" : "mt-2 text-3xl font-black text-rose-300"}>
              {result.difference >= 0 ? "+" : "-"}
              {formatNumber(Math.abs(result.difference))}
            </p>
            <p className="mt-1 text-xs text-zinc-500">{result.percent >= 0 ? "+" : ""}{result.percent.toFixed(1)}%</p>
          </div>
        </div>
      </div>
    </GlassPanel>
  );
}
