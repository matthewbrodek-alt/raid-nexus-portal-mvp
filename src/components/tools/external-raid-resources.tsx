import { ArrowUpRight, BookOpen, Swords } from "lucide-react";
import Link from "next/link";
import { GlassPanel } from "@/components/ui/glass-panel";

const resources = [
  {
    title: "HellHades",
    href: "https://hellhades.com/",
    description: "Гайды, рейтинги героев, билды, советы по аккаунту и материалы для прогресса в Raid: Shadow Legends.",
    label: "Guides & ratings",
    icon: BookOpen
  },
  {
    title: "Gestal RAID",
    href: "https://gestal.gg/raid/",
    description: "Инструменты для подбора команд, анализа героев и поиска рабочих составов под разные режимы игры.",
    label: "Teams & tools",
    icon: Swords
  }
];

export function ExternalRaidResources() {
  return (
    <GlassPanel className="overflow-hidden">
      <div className="border-b border-relic/16 bg-[linear-gradient(135deg,rgba(216,168,71,0.14),rgba(5,10,18,0.82)_48%,rgba(39,76,145,0.18))] p-5 sm:p-6">
        <p className="text-xs font-bold uppercase tracking-[0.28em] text-relic">Внешние базы</p>
        <h2 className="mt-2 font-[var(--font-cinzel)] text-3xl font-black text-white">Полезные сайты RAID</h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-zinc-300">
          Быстрые переходы на проверенные внешние ресурсы с гайдами, командами, рейтингами и инструментами для Raid: Shadow Legends.
        </p>
      </div>

      <div className="grid gap-4 p-4 sm:p-5 lg:grid-cols-2">
        {resources.map((resource) => {
          const Icon = resource.icon;

          return (
            <Link
              key={resource.href}
              href={resource.href}
              target="_blank"
              rel="noreferrer"
              className="group relative overflow-hidden rounded-[22px] border border-relic/20 bg-[#050a12]/82 p-5 transition hover:-translate-y-0.5 hover:border-relic/55 hover:shadow-[0_0_36px_rgba(216,168,71,0.14)]"
            >
              <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_70%_10%,rgba(231,193,106,0.16),transparent_34%)] opacity-80" />
              <span className="relative flex items-start justify-between gap-4">
                <span className="grid h-14 w-14 place-items-center rounded-[18px] border border-relic/24 bg-relic/10 text-relic">
                  <Icon size={26} />
                </span>
                <span className="grid h-11 w-11 place-items-center rounded-[14px] border border-white/10 bg-black/35 text-zinc-400 transition group-hover:border-relic/40 group-hover:text-relic">
                  <ArrowUpRight size={20} />
                </span>
              </span>
              <span className="relative mt-5 block text-xs font-bold uppercase tracking-[0.22em] text-relic">{resource.label}</span>
              <span className="relative mt-2 block font-[var(--font-cinzel)] text-3xl font-black text-white">{resource.title}</span>
              <span className="relative mt-3 block text-sm leading-7 text-zinc-400">{resource.description}</span>
            </Link>
          );
        })}
      </div>
    </GlassPanel>
  );
}
