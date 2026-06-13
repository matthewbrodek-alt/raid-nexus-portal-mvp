"use client";

import Link from "next/link";
import {
  ChevronRight,
  Crown,
  Download,
  Home as HomeIcon,
  MessageCircle,
  Radio,
  Shield,
  ShoppingBag,
  Swords,
  Users,
  Zap
} from "lucide-react";
import { RaidLogo } from "@/components/brand/raid-logo";
import { HomeBackgroundVideo } from "@/components/home/home-background-video";
import { HomeBroadcast } from "@/components/home/home-broadcast";
import { HomeCommunityLinks } from "@/components/home/home-community-links";
import { HomeEventCalendarCard } from "@/components/home/home-event-calendar-card";
import { HomeMobileHeader } from "@/components/home/home-mobile-header";
import { HomeSearch } from "@/components/home/home-search";
import { HomeTestimonials } from "@/components/home/home-testimonials";
import { HomeUnreadBell } from "@/components/home/home-unread-bell";
import { HomeUserCard } from "@/components/home/home-user-card";
import { LatestNewsRail } from "@/components/home/latest-news-rail";
import { RafflePanel } from "@/components/home/raffle-panel";
import { LanguageSwitcher } from "@/components/i18n/language-switcher";
import { ThemeSwitcher } from "@/components/theme/theme-switcher";
import { useLanguage, type Language } from "@/lib/i18n/use-language";

const sidebarLinks = [
  { label: { ru: "Главная", en: "Home" }, href: "/", icon: HomeIcon, active: true },
  { label: { ru: "Полезное", en: "Useful" }, href: "/useful", icon: Zap },
  { label: { ru: "Герои", en: "Heroes" }, href: "/heroes", icon: Swords },
  { label: { ru: "Покупка аккаунта", en: "Account Purchase" }, href: "/marketplace", icon: ShoppingBag },
  { label: { ru: "Кланы", en: "Clans" }, href: "/clans", icon: Shield },
  { label: { ru: "Чат", en: "Chat" }, href: "/chat", icon: MessageCircle },
  { label: { ru: "Эфир", en: "Live" }, href: "/stream", icon: Radio },
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
    <main className="relative min-h-screen overflow-x-hidden bg-transparent text-pale">
      <HomeBackgroundVideo />
      <div className="pointer-events-none fixed inset-0 z-[1] bg-[radial-gradient(circle_at_50%_0%,rgba(99,166,255,0.16),transparent_26%),linear-gradient(90deg,rgba(3,7,12,0.46),rgba(3,7,12,0.17)_48%,rgba(3,7,12,0.42))]" />

      <div className="raid-dashboard-shell relative z-10 min-h-screen lg:grid lg:grid-cols-[300px_1fr]">
        <aside className="hidden min-h-screen flex-col bg-[#02070c]/72 backdrop-blur-md lg:sticky lg:top-0 lg:flex lg:h-screen">
          <div className="flex h-40 items-center justify-center overflow-visible px-4">
            <RaidLogo compact className="translate-x-2" imageClassName="!h-32 !max-w-none sm:!h-36" />
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
                    className="raid-side-link flex h-14 items-center gap-5 border border-transparent px-4 text-sm font-semibold tracking-[0.04em] text-zinc-400 transition hover:border-relic/35 hover:text-relic"
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
              className="raid-glow-button flex items-center justify-between gap-5 border border-relic/24 bg-black/32 px-5 py-4 text-left"
            >
              <span>
                <span className="block text-xs font-bold uppercase tracking-[0.28em] text-relic">{labels.downloadTitle}</span>
                <span className="mt-1 block text-sm text-zinc-400">{labels.downloadText}</span>
              </span>
              <Download className="ml-3 shrink-0 text-relic" size={22} />
            </Link>

            <div className="relative overflow-hidden rounded-[22px] border border-relic/18 bg-[#050b12]/68 p-5 shadow-[inset_0_0_18px_rgba(99,166,255,0.035),0_18px_42px_rgba(0,0,0,0.24)]">
              <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_22%_0%,rgba(99,166,255,0.08),transparent_34%),radial-gradient(circle_at_86%_92%,rgba(39,76,145,0.1),transparent_38%)]" />
              <p className="relative z-10 text-xs font-bold uppercase tracking-[0.2em] text-zinc-300">{labels.communityTitle}</p>
              <HomeCommunityLinks />
            </div>
          </div>
        </aside>

        <section className="min-w-0 px-4 py-2 sm:px-6 lg:px-8 lg:py-4">
          <HomeMobileHeader />

          <Link
            href="/topup"
            className="raid-donate-pulse raid-glow-button mt-2 flex items-center justify-center gap-2 border border-relic/45 bg-black/55 px-3 py-3 text-center text-xs font-black uppercase tracking-[0.1em] text-relic shadow-[0_0_30px_rgba(47,124,255,0.16)] lg:hidden"
          >
            <Crown size={18} />
            {language === "ru" ? "Купить игровой набор в RAID" : "Buy RAID Game Pack"}
          </Link>

          <header className="hidden h-24 items-center gap-5 lg:flex">
            <Link
              href="/topup"
              className="raid-donate-pulse raid-glow-button flex min-h-[56px] min-w-[360px] items-center justify-center gap-3 border border-relic/45 bg-black/48 px-6 py-4 text-sm font-black uppercase tracking-[0.16em] text-relic shadow-[0_0_30px_rgba(47,124,255,0.16)]"
            >
              <Crown size={20} />
              {language === "ru" ? "Купить игровой набор в RAID" : "Buy RAID Game Pack"}
            </Link>

            <HomeSearch />

            <div className="ml-auto flex items-center gap-5">
              <LanguageSwitcher />
              <ThemeSwitcher />
              <HomeUnreadBell label={labels.notifications} />
              <HomeUserCard />
            </div>
          </header>

          <div className="mt-3 grid gap-5 lg:mt-5 xl:grid-cols-[minmax(0,1.55fr)_430px]">
            <section id="news" className="min-w-0">
              <LatestNewsRail />
              <HomeTestimonials />
            </section>

            <aside className="space-y-5">
              <RafflePanel />
              <HomeEventCalendarCard />
              <HomeBroadcast />
            </aside>
          </div>

          <footer className="mt-8 flex items-center justify-between py-5 text-xs uppercase tracking-[0.18em] text-zinc-500">
            <span>RAID Shadow Legends</span>
            <Link href="/dashboard" className="inline-flex items-center gap-2 text-relic transition hover:text-[#b8d7ff]">
              {labels.footerAccount}
              <ChevronRight size={16} />
            </Link>
          </footer>
        </section>
      </div>
    </main>
  );
}
