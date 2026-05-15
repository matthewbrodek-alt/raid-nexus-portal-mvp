import Link from "next/link";
import {
  Bell,
  CalendarDays,
  ChevronRight,
  Crown,
  Download,
  Home as HomeIcon,
  MessageCircle,
  Newspaper,
  Shield,
  ShoppingBag,
  Swords,
  Users
} from "lucide-react";
import { ActionCalendar } from "@/components/calendar/action-calendar";
import { RaidLogo } from "@/components/brand/raid-logo";
import { HomeBackgroundVideo } from "@/components/home/home-background-video";
import { HomeBroadcast } from "@/components/home/home-broadcast";
import { HomeMobileHeader } from "@/components/home/home-mobile-header";
import { HomeSearch } from "@/components/home/home-search";
import { HomeUserCard } from "@/components/home/home-user-card";
import { LatestNewsRail } from "@/components/home/latest-news-rail";
import { PortalOffers } from "@/components/home/portal-offers";
import { LanguageSwitcher } from "@/components/i18n/language-switcher";
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
  { label: "Личный кабинет", href: "/dashboard", icon: Users }
];

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-transparent text-pale">
      <HomeBackgroundVideo />
      <div className="pointer-events-none fixed inset-0 z-[1] bg-[radial-gradient(circle_at_50%_0%,rgba(231,193,106,0.11),transparent_26%),linear-gradient(90deg,rgba(3,7,12,0.92),rgba(3,7,12,0.34)_48%,rgba(3,7,12,0.84))]" />

      <div className="raid-dashboard-shell relative z-10 min-h-screen lg:grid lg:grid-cols-[300px_1fr]">
        <aside className="hidden min-h-screen flex-col border-r border-relic/18 bg-[#02070c]/72 backdrop-blur-md lg:flex">
          <div className="flex h-28 items-center border-b border-relic/12 px-6">
            <RaidLogo />
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
              href="https://lps.plarium.com/ru/desktop/raid/dragon_fire_f038_fdb_droapp?plid="
              target="_blank"
              rel="noreferrer"
              className="raid-glow-button flex items-center justify-between border border-relic/24 bg-black/32 px-5 py-4 text-left"
            >
              <span>
                <span className="block text-xs font-bold uppercase tracking-[0.28em] text-relic">Скачать RAID</span>
                <span className="mt-1 block text-sm text-zinc-400">Начни своё приключение</span>
              </span>
              <Download className="text-relic" size={22} />
            </Link>

            <div className="rounded-[18px] border border-relic/18 bg-black/28 p-5">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-400">Присоединяйся к сообществу</p>
              <div className="mt-4 flex gap-3">
                {["D", "F", "X", "Y"].map((item) => (
                  <span key={item} className="grid h-9 w-9 place-items-center rounded-full bg-[#112033] text-xs font-black text-white">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </aside>

        <section className="min-w-0 px-4 py-4 sm:px-6 lg:px-8">
          <HomeMobileHeader />

          <header className="hidden h-24 items-center gap-5 lg:flex">
            <HomeSearch />

            <div className="ml-auto flex items-center gap-5">
              <LanguageSwitcher />
              <span className="h-8 w-px bg-relic/18" />
              <button className="raid-glow-button grid h-11 w-11 place-items-center border border-transparent text-zinc-300" aria-label="Notifications">
                <Bell size={20} />
              </button>
              <span className="h-8 w-px bg-relic/18" />
              <HomeUserCard />
            </div>
          </header>

          <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.48fr)_460px]">
            <div className="min-w-0 space-y-5">
              <section id="news">
                <LatestNewsRail />
              </section>

              <PortalOffers />
            </div>

            <aside className="space-y-5">
              <section id="calendar">
                <ActionCalendar events={raidEvents} />
              </section>
              <HomeBroadcast />
            </aside>
          </div>

          <footer className="mt-8 flex items-center justify-between border-t border-relic/12 py-5 text-xs uppercase tracking-[0.18em] text-zinc-500">
            <span>RAID Shadow Legends</span>
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
