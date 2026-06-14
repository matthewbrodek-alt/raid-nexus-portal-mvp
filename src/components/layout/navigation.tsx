"use client";

import { Coins, Database, Home as HomeIcon, Menu, MessageSquare, Radio, Shield, ShoppingBag, UserRound, X, Zap } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { RaidLogo } from "@/components/brand/raid-logo";
import { HomeCommunityLinks } from "@/components/home/home-community-links";
import { HomeSearch } from "@/components/home/home-search";
import { LanguageSwitcher } from "@/components/i18n/language-switcher";
import { ThemeSwitcher } from "@/components/theme/theme-switcher";
import { useLanguage } from "@/lib/i18n/use-language";

const iconMap = {
  home: HomeIcon,
  coins: Coins,
  zap: Zap,
  shoppingBag: ShoppingBag,
  database: Database,
  shield: Shield,
  messageSquare: MessageSquare,
  radio: Radio
};

const navLabels = {
  ru: {
    "/": "Главная",
    "/donate": "Донат",
    "/topup": "Донат",
    "/useful": "Полезное",
    "/marketplace": "Покупка аккаунта",
    "/heroes": "Герои",
    "/clans": "Кланы",
    "/chat": "Чат",
    "/stream": "Эфир",
    dashboard: "Личный кабинет",
    search: "Поиск",
    menu: "Меню"
  },
  en: {
    "/": "Home",
    "/donate": "Donate",
    "/topup": "Donate",
    "/useful": "Useful",
    "/marketplace": "Account Purchase",
    "/heroes": "Hero DB",
    "/clans": "Clans",
    "/chat": "Chat",
    "/stream": "Live",
    dashboard: "Dashboard",
    search: "Search",
    menu: "Menu"
  }
};

type SectionLink = {
  label: string;
  href: string;
  icon: keyof typeof iconMap;
};

type NavigationProps = {
  sections: SectionLink[];
};

export function Navigation({ sections }: NavigationProps) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { language } = useLanguage();
  const labels = navLabels[language];

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
    };
  }, [open]);

  const mobileMenu = open ? (
    <div
      className="fixed inset-0 overflow-hidden bg-black/92 backdrop-blur-2xl lg:hidden"
      role="dialog"
      aria-modal="true"
      style={{ zIndex: 2147483647 }}
    >
      <div className="raid-mobile-menu-panel w-[86vw] max-w-sm bg-[#02060b]/96 p-3 shadow-2xl backdrop-blur-2xl sm:p-4">
        <div className="mb-2 flex items-center justify-between gap-3">
          <RaidLogo compact imageClassName="!h-20 !max-w-none sm:!h-24" />
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-[14px] border border-white/10 bg-black/50 text-zinc-300 transition hover:border-relic/50 hover:text-relic"
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mb-3">
          <HomeSearch />
        </div>

        <nav className="space-y-1.5">
          {sections.map((section) => {
            const Icon = iconMap[section.icon];
            return (
              <Link
                key={section.href}
                href={section.href}
                className="raid-side-link flex h-12 items-center gap-3 border border-white/5 bg-black/55 px-3 text-sm font-semibold tracking-[0.03em] text-zinc-300 transition hover:border-relic/35 hover:text-relic sm:h-14 sm:gap-4 sm:px-4"
                onClick={() => setOpen(false)}
              >
                <Icon className="relative z-10 h-5 w-5 shrink-0" />
                <span className="relative z-10">{labels[section.href as keyof typeof labels] ?? section.label}</span>
              </Link>
            );
          })}
          <Link
            href="/dashboard"
            className="raid-side-link flex h-12 items-center gap-3 border border-relic/30 bg-relic/10 px-3 text-sm font-semibold tracking-[0.03em] text-relic sm:h-14 sm:gap-4 sm:px-4"
            onClick={() => setOpen(false)}
          >
            <UserRound className="relative z-10 h-5 w-5 shrink-0" />
            <span className="relative z-10">{labels.dashboard}</span>
          </Link>
        </nav>

        <div className="mt-4 border-t border-white/10 pt-3">
          <p className="text-xs font-bold tracking-[0.08em] text-zinc-400">
            {language === "ru" ? "\u041f\u0440\u0438\u0441\u043e\u0435\u0434\u0438\u043d\u044f\u0439\u0441\u044f \u043a \u0441\u043e\u043e\u0431\u0449\u0435\u0441\u0442\u0432\u0443" : "Join the community"}
          </p>
          <HomeCommunityLinks variant="mobile" />
        </div>
      </div>
    </div>
  ) : null;

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-[1000] border-b border-white/8 bg-[#030609]/84 pt-[env(safe-area-inset-top)] backdrop-blur-2xl lg:sticky lg:inset-x-auto lg:z-50 lg:border-relic/20 lg:bg-[#030609]/92 lg:pt-0">
        <div className="mx-auto flex h-[104px] max-w-7xl items-center justify-between gap-2 px-3 sm:px-4 lg:h-[82px] lg:px-8">
          <Link href="/" className="flex min-w-0 flex-1 items-center overflow-hidden lg:mr-5 lg:flex-none xl:mr-7">
            <RaidLogo compact imageClassName="!h-24 !max-w-none sm:!h-28 lg:!h-14 xl:!h-16" />
          </Link>

          <nav className="hidden items-center gap-1 lg:flex">
            {sections.map((section) => {
              const Icon = iconMap[section.icon];
              return (
                <Link
                  key={section.href}
                  href={section.href}
                  className="flex items-center gap-2 rounded-[14px] border border-transparent px-3 py-2 text-sm font-semibold tracking-[0.03em] text-zinc-300 transition hover:border-relic/40 hover:bg-relic/10 hover:text-relic"
                >
                  <Icon size={16} />
                  {labels[section.href as keyof typeof labels] ?? section.label}
                </Link>
              );
            })}
          </nav>

          <div className="mx-3 hidden min-w-[260px] max-w-[360px] flex-1 xl:block">
            <HomeSearch />
          </div>

          <div className="hidden items-center gap-2 lg:flex">
            <LanguageSwitcher />
            <ThemeSwitcher />
            <Link href="/dashboard" className="flex h-10 items-center gap-2 rounded-[14px] border border-relic/45 bg-black/35 px-3 text-sm font-semibold text-relic transition hover:bg-relic hover:text-black">
              <UserRound size={18} />
              {labels.dashboard}
            </Link>
          </div>

          <div className="mobile-top-switchers lg:hidden">
            <LanguageSwitcher compact />
            <ThemeSwitcher compact />
          </div>

          <button
            className="grid h-10 w-10 shrink-0 place-items-center rounded-[13px] border border-relic/45 bg-black/45 text-relic lg:hidden"
            aria-label={labels.menu}
            onClick={() => setOpen(true)}
          >
            <Menu size={21} />
          </button>
        </div>
      </header>
      <div className="h-[calc(104px+env(safe-area-inset-top))] lg:hidden" aria-hidden="true" />

      {mounted && mobileMenu ? createPortal(mobileMenu, document.body) : null}
    </>
  );
}
