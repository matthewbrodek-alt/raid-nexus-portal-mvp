import Link from "next/link";
import {
  Coins,
  Database,
  MessageSquare,
  ShoppingBag,
  Zap
} from "lucide-react";
import { ActionCalendar } from "@/components/calendar/action-calendar";
import { LatestNewsRail } from "@/components/home/latest-news-rail";
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

        <div>
          <LatestNewsRail />
        </div>

        <div className="grid gap-5">
          <div className="raid-hero-art min-h-[280px] rounded-lg border border-white/10 bg-[#07101f] p-6 shadow-2xl sm:min-h-[360px]">
            <div className="flex h-full flex-col justify-end">
              <p className="text-xs uppercase tracking-[0.26em] text-relic">Raid Shadow Legends</p>
              <h2 className="mt-2 max-w-xl text-3xl font-black text-white sm:text-5xl">Командный центр портала</h2>
              <p className="mt-3 max-w-lg text-sm leading-6 text-zinc-300">
                Новости, герои, чат, заявки и CRM собраны в темной игровой панели.
              </p>
            </div>
          </div>
          <ActionCalendar events={raidEvents} />
        </div>
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
