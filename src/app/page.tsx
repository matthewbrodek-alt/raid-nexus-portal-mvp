"use client";

import Link from "next/link";
import {
  ChevronRight,
  Crown,
  Download,
  Home as HomeIcon,
  MessageCircle,
  Shield,
  ShoppingBag,
  Swords,
  Users
} from "lucide-react";
import { RaidLogo } from "@/components/brand/raid-logo";
import { HomeBackgroundVideo } from "@/components/home/home-background-video";
import { HomeBroadcast } from "@/components/home/home-broadcast";
import { HomeEventCalendarCard } from "@/components/home/home-event-calendar-card";
import { HomeMobileHeader } from "@/components/home/home-mobile-header";
import { HomeSocialLinks } from "@/components/home/home-social-links";
import { HomeUnreadBell } from "@/components/home/home-unread-bell";
import { HomeUserCard } from "@/components/home/home-user-card";
import { LatestNewsRail } from "@/components/home/latest-news-rail";
import { RafflePanel } from "@/components/home/raffle-panel";
import { LanguageSwitcher } from "@/components/i18n/language-switcher";
import { useLanguage, type Language } from "@/lib/i18n/use-language";

const sidebarLinks = [
  { label: { ru: "Главная", en: "Home" }, href: "/", icon: HomeIcon, active: true },
  { label: { ru: "Герои", en: "Heroes" }, href: "/heroes", icon: Swords },
  { label: { ru: "Покупка аккаунта", en: "Account Purchase" }, href: "/marketplace", icon: ShoppingBag },
  { label: { ru: "Кланы", en: "Clans" }, href: "/clans", icon: Shield },
  { label: { ru: "Чат", en: "Chat" }, href: "/chat", icon: MessageCircle },
  { label: { ru: "Личный кабинет", en: "Dashboard" }, href: "/dashboard", icon: Users }
];

const pageCopy: Record<
  Language,
  {
    downloadTitle: string;
    downloadText: string;
    communityTitle: string;
    notifications: string;
    footerAccount: string;
  }
> = {
  ru: {
    downloadTitle: "Скачать RAID",
    downloadText: "Начни свое приключение",
    communityTitle: "Присоединяйся к сообществу",
    notifications: "Уведомления",
    footerAccount: "Личный кабинет"
  },
  en: {
    downloadTitle: "Download RAID",
    downloadText: "Start your adventure",
    communityTitle: "Join the community",
    notifications: "Notifications",
    footerAccount: "Dashboard"
  }
};

function text(value: { ru: string; en: string }, language: Language) {
  return value[language];
}

export default function Home() {
  const { language } = useLanguage();
  const labels = pageCopy[language];

  return (
    <main className="relative min-h-screen overflow-hidden bg-transparent text-pale">
      <HomeBackgroundVideo />
      <HomeSocialLinks />
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
                const label = text(item.label, language);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    data-active={item.active ? "true" : "false"}
                    className="raid-side-link flex h-14 items-center gap-5 border border-transparent px-4 text-sm font-semibold uppercase tracking-[0.08em] text-zinc-400 transition hover:border-relic/35 hover:text-relic"
                  >
                    <Icon className="relative z-10 h-6 w-6 shrink-0" />
                    <span className="relative z-10">{label}</span>
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
                <span className="block text-xs font-bold uppercase tracking-[0.28em] text-relic">{labels.downloadTitle}</span>
                <span className="mt-1 block text-sm text-zinc-400">{labels.downloadText}</span>
              </span>
              <Download className="text-relic" size={22} />
            </Link>

            <div className="rounded-[18px] border border-relic/18 bg-black/28 p-5">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-400">{labels.communityTitle}</p>
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

          <Link
            href="/topup"
            className="raid-donate-pulse raid-glow-button mt-4 flex items-center justify-center gap-3 border border-relic/45 bg-black/55 px-4 py-4 text-center text-sm font-black uppercase tracking-[0.12em] text-relic shadow-[0_0_30px_rgba(216,168,71,0.16)] lg:hidden"
          >
            <Crown size={18} />
            {language === "ru" ? "Купить игровой набор в RAID" : "Buy RAID Game Pack"}
          </Link>

          <header className="hidden h-24 items-center gap-5 lg:flex">
            <Link
              href="/topup"
              className="raid-donate-pulse raid-glow-button flex min-h-[56px] min-w-[360px] items-center justify-center gap-3 border border-relic/45 bg-black/48 px-6 py-4 text-sm font-black uppercase tracking-[0.16em] text-relic shadow-[0_0_30px_rgba(216,168,71,0.16)]"
            >
              <Crown size={20} />
              {language === "ru" ? "Купить игровой набор в RAID" : "Buy RAID Game Pack"}
            </Link>

            <div className="ml-auto flex items-center gap-5">
              <LanguageSwitcher />
              <span className="h-8 w-px bg-relic/18" />
              <HomeUnreadBell label={labels.notifications} />
              <span className="h-8 w-px bg-relic/18" />
              <HomeUserCard />
            </div>
          </header>

          <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.55fr)_430px]">
            <section id="news" className="min-w-0">
              <LatestNewsRail />
            </section>

            <aside className="space-y-5">
              <RafflePanel />
              <HomeEventCalendarCard />
              <HomeBroadcast />
            </aside>
          </div>

          <footer className="mt-8 flex items-center justify-between border-t border-relic/12 py-5 text-xs uppercase tracking-[0.18em] text-zinc-500">
            <span>RAID Shadow Legends</span>
            <Link href="/dashboard" className="inline-flex items-center gap-2 text-relic transition hover:text-[#ffe1a0]">
              {labels.footerAccount}
              <ChevronRight size={16} />
            </Link>
          </footer>
        </section>
      </div>
    </main>
  );
}
