import Link from "next/link";
import {
  Bot,
  Coins,
  Database,
  MessageSquare,
  Shield,
  ShoppingBag,
  Sparkles,
  Zap
} from "lucide-react";
import { ActionCalendar } from "@/components/calendar/action-calendar";
import { Navigation } from "@/components/layout/navigation";
import { GlassPanel } from "@/components/ui/glass-panel";
import { getEnabledModules } from "@/lib/config/site-modules";
import { raidEvents } from "@/lib/data/mock";

const moduleIcons = {
  topup: "coins",
  useful: "zap",
  marketplace: "shoppingBag",
  heroes: "database",
  chat: "messageSquare"
} as const;

const cardIcons = {
  topup: Coins,
  useful: Zap,
  marketplace: ShoppingBag,
  heroes: Database,
  chat: MessageSquare
};

const navSections = getEnabledModules("public")
  .filter((module) => module.id in moduleIcons)
  .map((module) => ({
    label: module.label,
    href: module.route,
    icon: moduleIcons[module.id as keyof typeof moduleIcons]
  }));

const portalCards = getEnabledModules("public")
  .filter((module) => module.id in moduleIcons)
  .map((module) => ({
    ...module,
    icon: cardIcons[module.id as keyof typeof cardIcons]
  }));

export default function Home() {
  return (
    <main className="min-h-screen bg-raid-radial text-pale">
      <Navigation sections={navSections} />

      <section className="relative mx-auto grid min-h-[calc(100vh-72px)] max-w-7xl grid-cols-1 items-center gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[1.02fr_0.98fr] lg:px-8">
        <div className="absolute inset-x-0 bottom-0 h-px gold-line" />

        <div className="space-y-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-relic/30 bg-relic/10 px-4 py-2 text-sm text-relic">
            <Sparkles size={16} />
            Raid Nexus Portal MVP
          </div>

          <div className="max-w-3xl space-y-5">
            <h1 className="font-[var(--font-cinzel)] text-4xl font-black leading-tight text-white sm:text-6xl lg:text-7xl">
              Raid Nexus
            </h1>
            <p className="max-w-2xl text-base leading-8 text-zinc-300 sm:text-lg">
              Dark fantasy портал по Raid: Shadow Legends с отдельными страницами
              для залива, гайдов, маркетплейса, базы героев, чата и кабинетов.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <Link href="/dashboard" className="rounded-lg border border-relic/30 bg-relic/10 p-4 text-relic transition hover:bg-relic/15">
              <Shield className="mb-3" />
              <p className="font-semibold">Личный кабинет</p>
              <p className="mt-1 text-sm text-zinc-400">Статистика, заявки, crypto wallet.</p>
            </Link>
            <Link href="/admin" className="rounded-lg border border-white/10 bg-white/[0.04] p-4 text-zinc-300 transition hover:text-white">
              <Bot className="mb-3 text-relic" />
              <p className="font-semibold">Admin War Room</p>
              <p className="mt-1 text-sm text-zinc-400">Контент, модерация, CRM.</p>
            </Link>
            <Link href="/heroes" className="rounded-lg border border-white/10 bg-white/[0.04] p-4 text-zinc-300 transition hover:text-white">
              <Database className="mb-3 text-relic" />
              <p className="font-semibold">Hero DB</p>
              <p className="mt-1 text-sm text-zinc-400">Карточки, видео и галерея.</p>
            </Link>
          </div>
        </div>

        <ActionCalendar events={raidEvents} />
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-relic">Portal sections</p>
            <h2 className="mt-2 text-3xl font-bold text-white">Быстрый переход</h2>
          </div>
          <p className="max-w-xl text-sm leading-6 text-zinc-400">
            Главная теперь работает как портал-навигатор: каждый крупный блок открыт на своей странице.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-5">
          {portalCards.map((module) => {
            const Icon = module.icon;

            return (
              <Link key={module.id} href={module.route}>
                <GlassPanel className="h-full p-5 transition hover:-translate-y-1 hover:shadow-glow">
                  <Icon className="mb-4 text-relic" />
                  <h3 className="font-semibold text-white">{module.label}</h3>
                  <p className="mt-2 text-sm leading-6 text-zinc-400">{module.description}</p>
                </GlassPanel>
              </Link>
            );
          })}
        </div>
      </section>
    </main>
  );
}
