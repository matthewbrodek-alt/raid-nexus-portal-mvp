import Link from "next/link";
import {
  Bell,
  CalendarDays,
  ChevronRight,
  Crown,
  Download,
  Gem,
  Home as HomeIcon,
  MessageCircle,
  Newspaper,
  Search,
  Settings,
  Shield,
  ShoppingBag,
  Swords,
  Trophy,
  UserRound,
  Users
} from "lucide-react";
import { ActionCalendar } from "@/components/calendar/action-calendar";
import { HomeBackgroundVideo } from "@/components/home/home-background-video";
import { HomeBroadcast } from "@/components/home/home-broadcast";
import { LatestNewsRail } from "@/components/home/latest-news-rail";
import { raidEvents } from "@/lib/data/mock";

const sidebarLinks = [
  { label: "Главная", href: "/", icon: HomeIcon, active: true },
  { label: "Новости", href: "#news", icon: Newspaper },
  { label: "Герои", href: "/heroes", icon: Swords },
  { label: "Маркет", href: "/marketplace", icon: ShoppingBag },
  { label: "Календарь", href: "#calendar", icon: CalendarDays },
  { label: "Гильдии", href: "/chat", icon: Shield },
  { label: "Чат", href: "/chat", icon: MessageCircle },
  { label: "Донат", href: "/topup", icon: Crown },
  { label: "Настройки", href: "/dashboard", icon: Settings }
];

const activityCards = [
  {
    label: "Событие",
    title: "Турнир драконов",
    text: "Участвуй и получай ценные награды.",
    meta: "Осталось: 2д 14ч",
    icon: Trophy,
    background: "linear-gradient(135deg, rgba(71,17,17,0.9), rgba(21,8,10,0.9))"
  },
  {
    label: "Оффер",
    title: "Особый набор",
    text: "Лимитированный набор доступен только сегодня.",
    meta: "-50%",
    icon: Gem,
    background: "linear-gradient(135deg, rgba(59,30,7,0.9), rgba(11,16,24,0.9))"
  },
  {
    label: "Ежедневно",
    title: "Ежедневные задания",
    text: "Выполняй задания и получай ценные награды.",
    meta: "2/5",
    icon: Shield,
    background: "linear-gradient(135deg, rgba(7,52,71,0.9), rgba(8,17,28,0.9))"
  }
];

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-transparent text-pale">
      <HomeBackgroundVideo />
      <div className="pointer-events-none fixed inset-0 z-[1] bg-[radial-gradient(circle_at_50%_0%,rgba(231,193,106,0.11),transparent_26%),linear-gradient(90deg,rgba(3,7,12,0.92),rgba(3,7,12,0.34)_48%,rgba(3,7,12,0.84))]" />

      <div className="raid-dashboard-shell relative z-10 min-h-screen lg:grid lg:grid-cols-[300px_1fr]">
        <aside className="hidden min-h-screen flex-col border-r border-relic/18 bg-[#02070c]/72 backdrop-blur-md lg:flex">
          <div className="flex h-28 items-center gap-4 border-b border-relic/12 px-6">
            <span className="grid h-16 w-16 place-items-center border border-relic/55 bg-black/45 font-[var(--font-cinzel)] text-4xl font-black text-relic shadow-[0_0_32px_rgba(216,168,71,0.24)]">
              R
            </span>
            <div>
              <p className="font-[var(--font-cinzel)] text-3xl font-black uppercase tracking-[0.08em] text-relic">Raid Portal</p>
              <p className="mt-1 text-sm text-zinc-400">Gaming Hub</p>
            </div>
          </div>

          <nav className="px-5 py-7">
            <div className="space-y-2">
              {sidebarLinks.map((item) => {
                const Icon = item.icon;

                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    data-active={item.active ? "true" : "false"}
                    className="raid-side-link flex h-14 items-center gap-5 border border-transparent px-4 text-sm font-semibold uppercase tracking-[0.08em] text-zinc-400 transition hover:border-relic/35 hover:text-relic"
                  >
                    <Icon className="relative z-10 h-6 w-6 shrink-0" />
                    <span className="relative z-10">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </nav>

          <div className="mt-auto space-y-4 px-5 pb-6">
            <Link
              href="/topup"
              className="raid-glow-button flex items-center justify-between border border-relic/24 bg-black/32 px-5 py-4 text-left"
            >
              <span>
                <span className="block text-xs font-bold uppercase tracking-[0.28em] text-relic">Скачать RAID</span>
                <span className="mt-1 block text-sm text-zinc-400">Начни своё приключение</span>
              </span>
              <Download className="text-relic" size={22} />
            </Link>

            <div className="border border-relic/18 bg-black/28 p-5">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-400">Присоединяйся к сообществу</p>
              <div className="mt-4 flex gap-3">
                {["D", "F", "X", "Y"].map((item) => (
                  <span key={item} className="grid h-9 w-9 place-items-center rounded-full bg-[#112033] text-xs font-black text-white">
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div className="border border-relic/18 bg-black/28 p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-[0.18em] text-zinc-400">Уровень</span>
                <span className="text-2xl font-black text-relic">42</span>
              </div>
              <div className="mt-4 h-2 overflow-hidden bg-black/45">
                <div className="h-full w-[64%] bg-gradient-to-r from-relic to-[#ffe1a0]" />
              </div>
              <p className="mt-2 text-xs text-zinc-500">6,500 / 10,000 XP</p>
            </div>
          </div>
        </aside>

        <section className="min-w-0 px-4 py-4 sm:px-6 lg:px-8">
          <header className="flex items-center gap-3 lg:hidden">
            <Link href="/" className="flex min-w-0 flex-1 items-center gap-3">
              <span className="grid h-12 w-12 place-items-center border border-relic/55 bg-black/45 font-[var(--font-cinzel)] text-2xl font-black text-relic">
                R
              </span>
              <span className="truncate font-[var(--font-cinzel)] text-2xl font-black uppercase tracking-[0.08em] text-relic">Raid Portal</span>
            </Link>
            <details className="relative">
              <summary className="grid h-12 w-12 cursor-pointer list-none place-items-center border border-relic/40 bg-black/45 text-relic">
                <Settings size={22} />
              </summary>
              <div className="absolute right-0 top-14 z-30 w-64 border border-relic/25 bg-[#03080e]/98 p-2 shadow-2xl">
                {sidebarLinks.map((item) => (
                  <Link key={item.label} href={item.href} className="block border-b border-white/5 px-3 py-3 text-sm uppercase tracking-[0.08em] text-zinc-300">
                    {item.label}
                  </Link>
                ))}
              </div>
            </details>
          </header>

          <header className="hidden h-24 items-center gap-5 lg:flex">
            <label className="flex h-14 w-full max-w-[540px] items-center gap-3 border border-relic/24 bg-black/34 px-5 text-zinc-500 shadow-[inset_0_0_20px_rgba(216,168,71,0.03)]">
              <input
                className="min-w-0 flex-1 border-0 bg-transparent text-sm text-zinc-200 placeholder:text-zinc-500 focus:ring-0"
                placeholder="Поиск по порталу..."
              />
              <Search size={20} />
            </label>

            <div className="ml-auto flex items-center gap-5">
              <button className="raid-glow-button grid h-11 w-11 place-items-center border border-transparent text-zinc-300" aria-label="Language">
                <Users size={20} />
              </button>
              <span className="text-sm uppercase tracking-[0.08em] text-zinc-300">RU</span>
              <span className="h-8 w-px bg-relic/18" />
              <button className="raid-glow-button grid h-11 w-11 place-items-center border border-transparent text-zinc-300" aria-label="Notifications">
                <Bell size={20} />
              </button>
              <span className="h-8 w-px bg-relic/18" />
              <Link
                href="/dashboard"
                className="raid-glow-button flex h-16 items-center gap-3 border border-relic/22 bg-black/32 px-4"
              >
                <span className="grid h-12 w-12 place-items-center overflow-hidden rounded-full border border-relic/45 bg-gradient-to-br from-[#362414] to-[#111827] text-relic">
                  <UserRound size={24} />
                </span>
                <span>
                  <span className="block text-base font-semibold text-white">PlayerOne</span>
                  <span className="block text-sm text-zinc-500">Уровень 42</span>
                </span>
              </Link>
            </div>
          </header>

          <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.48fr)_460px]">
            <div className="min-w-0 space-y-5">
              <section id="news">
                <LatestNewsRail />
              </section>

              <section className="raid-ornate-panel p-5">
                <div className="mb-4">
                  <p className="text-xs font-bold uppercase tracking-[0.38em] text-relic">Активность портала</p>
                  <p className="mt-2 text-sm text-zinc-400">Присоединяйся к событиям и получай награды</p>
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                  {activityCards.map((card) => {
                    const Icon = card.icon;

                    return (
                      <Link
                        key={card.title}
                        href={card.label === "Оффер" ? "/topup" : "#calendar"}
                        className="raid-glow-button min-h-[214px] border border-relic/20 p-5"
                        style={{ background: card.background }}
                      >
                        <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-relic">
                          <Icon size={15} />
                          {card.label}
                        </span>
                        <span className="raid-title-metal mt-7 block text-2xl leading-tight">{card.title}</span>
                        <span className="mt-4 block text-sm leading-6 text-zinc-300">{card.text}</span>
                        <span className="mt-5 block text-sm font-semibold text-relic">{card.meta}</span>
                      </Link>
                    );
                  })}
                </div>
              </section>
            </div>

            <aside className="space-y-5">
              <section id="calendar">
                <ActionCalendar events={raidEvents} />
              </section>
              <HomeBroadcast />
            </aside>
          </div>

          <footer className="mt-8 flex items-center justify-between border-t border-relic/12 py-5 text-xs uppercase tracking-[0.18em] text-zinc-500">
            <span>Raid Portal</span>
            <Link href="/dashboard" className="inline-flex items-center gap-2 text-relic transition hover:text-[#ffe1a0]">
              Личный кабинет
              <ChevronRight size={16} />
            </Link>
          </footer>
        </section>
      </div>
    </main>
  );
}
