import Link from "next/link";
import {
  ArrowRight,
  Crown,
  Database,
  MessageCircle,
  Newspaper,
  Shield,
  UsersRound
} from "lucide-react";
import { ActionCalendar } from "@/components/calendar/action-calendar";
import { LatestNewsRail } from "@/components/home/latest-news-rail";
import { Navigation } from "@/components/layout/navigation";
import { getEnabledModules } from "@/lib/config/site-modules";
import { raidEvents } from "@/lib/data/mock";

const moduleIcons = {
  topup: "coins",
  useful: "zap",
  marketplace: "shoppingBag",
  heroes: "database",
  chat: "messageSquare"
} as const;

const navSections = getEnabledModules("public")
  .filter((module) => module.id in moduleIcons)
  .map((module) => ({
    label: module.label,
    href: module.route,
    icon: moduleIcons[module.id as keyof typeof moduleIcons]
  }));

const quickLinks = [
  { label: "Новости", href: "#news", icon: Newspaper },
  { label: "Герои", href: "/heroes", icon: Shield },
  { label: "Чат", href: "/chat", icon: MessageCircle },
  { label: "Заявки", href: "/topup", icon: Crown },
  { label: "CRM", href: "/admin", icon: UsersRound }
];

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#030609] text-pale">
      <Navigation sections={navSections} />

      <div className="raid-mobile-shell mx-auto w-full max-w-7xl px-3 pb-10 pt-4 sm:px-6 lg:px-8">
        <section className="raid-hero-card raid-ornate-panel relative min-h-[440px] overflow-hidden p-5 sm:p-8 lg:min-h-[520px]">
          <div className="raid-hero-bg" />
          <div className="raid-hero-figure" />
          <div className="relative z-10 flex min-h-[390px] max-w-[620px] flex-col justify-center sm:min-h-[460px]">
            <p className="text-xs font-bold uppercase tracking-[0.44em] text-relic sm:text-sm">Raid Shadow Legends</p>
            <h1 className="mt-4 max-w-[560px] font-[var(--font-cinzel)] text-[2.4rem] font-black uppercase leading-[0.95] text-white drop-shadow-2xl sm:text-6xl lg:text-7xl">
              Командный центр портала
            </h1>
            <p className="mt-5 max-w-[440px] text-base leading-7 text-zinc-200 sm:text-lg">
              Новости, герои, чат, заявки и CRM собраны в темной игровой панели.
            </p>
            <Link
              href="/dashboard"
              className="mt-8 inline-flex w-fit items-center gap-3 border border-relic/70 bg-black/35 px-5 py-3 font-[var(--font-cinzel)] text-sm font-black uppercase tracking-[0.18em] text-relic shadow-glow transition hover:bg-relic hover:text-black sm:px-7"
            >
              Перейти в панель
              <ArrowRight size={20} />
            </Link>
          </div>
        </section>

        <section id="news" className="mt-4">
          <LatestNewsRail />
        </section>

        <section className="raid-ornate-panel mt-4 p-4 sm:p-6">
          <p className="text-xs font-bold uppercase tracking-[0.42em] text-relic">Быстрый доступ</p>
          <div className="mt-4 grid grid-cols-5 gap-2 sm:gap-4">
            {quickLinks.map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className="group flex min-h-[86px] min-w-0 flex-col items-center justify-center gap-2 border border-relic/45 bg-black/35 px-2 py-3 text-center shadow-[inset_0_0_18px_rgba(216,168,71,0.08)] transition hover:-translate-y-0.5 hover:border-relic hover:bg-relic/10 sm:min-h-[118px]"
                >
                  <Icon className="h-7 w-7 text-relic transition group-hover:scale-110 sm:h-10 sm:w-10" />
                  <span className="text-[0.65rem] font-bold uppercase tracking-[0.12em] text-relic sm:text-sm">
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="mt-4 grid gap-4 lg:grid-cols-[1fr_0.85fr]">
          <ActionCalendar events={raidEvents} />
          <div className="raid-ornate-panel overflow-hidden p-4 sm:p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.36em] text-relic">Raid Broadcast</p>
                <h2 className="mt-2 font-[var(--font-cinzel)] text-2xl font-black text-white">Боевой эфир</h2>
              </div>
              <Database className="shrink-0 text-relic" />
            </div>
            <iframe
              className="aspect-video w-full border border-relic/25 bg-black"
              src="https://www.youtube.com/embed/MhsY9Uvcx7E"
              title="Raid Shadow Legends trailer"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
        </section>
      </div>
    </main>
  );
}
