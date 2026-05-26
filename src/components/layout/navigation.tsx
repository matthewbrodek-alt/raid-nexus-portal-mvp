"use client";

import { Coins, Database, Menu, MessageSquare, Search, Shield, ShoppingBag, UserRound, X, Zap } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { RaidLogo } from "@/components/brand/raid-logo";
import { HomeCommunityLinks } from "@/components/home/home-community-links";
import { LanguageSwitcher } from "@/components/i18n/language-switcher";
import { useLanguage } from "@/lib/i18n/use-language";

const iconMap = {
  coins: Coins,
  zap: Zap,
  shoppingBag: ShoppingBag,
  database: Database,
  shield: Shield,
  messageSquare: MessageSquare
};

const navLabels = {
  ru: {
    "/donate": "Донат",
    "/topup": "Донат",
    "/useful": "Полезное",
    "/marketplace": "Покупка аккаунта",
    "/heroes": "Герои",
    "/clans": "Кланы",
    "/chat": "Чат",
    dashboard: "Личный кабинет",
    search: "Поиск",
    menu: "Меню"
  },
  en: {
    "/donate": "Donate",
    "/topup": "Donate",
    "/useful": "Useful",
    "/marketplace": "Account Purchase",
    "/heroes": "Hero DB",
    "/clans": "Clans",
    "/chat": "Chat",
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

  const mobileMenu = open ? (
    <div
      className="fixed inset-0 bg-black/92 backdrop-blur-2xl lg:hidden"
      role="dialog"
      aria-modal="true"
      style={{ zIndex: 2147483647 }}
    >
      <div className="min-h-dvh w-[84vw] max-w-sm overflow-y-auto border-r border-relic/30 bg-[#02060b]/96 p-4 shadow-2xl backdrop-blur-2xl">
        <div className="mb-5 flex items-center justify-between gap-3">
          <RaidLogo compact withBumpyPay className="origin-left" />
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-[14px] border border-white/10 bg-black/50 text-zinc-300 transition hover:border-relic/50 hover:text-relic"
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mb-4">
          <LanguageSwitcher />
        </div>

        <nav className="space-y-2">
          {sections.map((section) => {
            const Icon = iconMap[section.icon];
            return (
              <Link
                key={section.href}
                href={section.href}
                className="raid-side-link flex h-14 items-center gap-4 border border-white/5 bg-black/55 px-4 text-sm font-semibold uppercase tracking-[0.1em] text-zinc-300 transition hover:border-relic/35 hover:text-relic"
                onClick={() => setOpen(false)}
              >
                <Icon className="relative z-10 h-5 w-5 shrink-0" />
                <span className="relative z-10">{labels[section.href as keyof typeof labels] ?? section.label}</span>
              </Link>
            );
          })}
          <Link
            href="/dashboard"
            className="raid-side-link flex h-14 items-center gap-4 border border-relic/30 bg-relic/10 px-4 text-sm font-semibold uppercase tracking-[0.1em] text-relic"
            onClick={() => setOpen(false)}
          >
            <UserRound className="relative z-10 h-5 w-5 shrink-0" />
            <span className="relative z-10">{labels.dashboard}</span>
          </Link>
        </nav>

        <div className="relative mt-5 overflow-hidden rounded-[22px] border border-relic/28 bg-[#050b12]/82 p-4 shadow-[inset_0_0_28px_rgba(231,193,106,0.06),0_18px_55px_rgba(0,0,0,0.38)]">
          <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(231,193,106,0.16),transparent_34%),radial-gradient(circle_at_86%_92%,rgba(39,76,145,0.2),transparent_38%),linear-gradient(135deg,rgba(255,255,255,0.06),transparent_42%)]" />
          <span className="pointer-events-none absolute inset-0 opacity-[0.12] [background-image:linear-gradient(rgba(231,193,106,0.15)_1px,transparent_1px),linear-gradient(90deg,rgba(231,193,106,0.1)_1px,transparent_1px)] [background-size:18px_18px]" />
          <p className="relative z-10 text-xs font-bold uppercase tracking-[0.2em] text-zinc-300">
            {language === "ru" ? "РџСЂРёСЃРѕРµРґРёРЅСЏР№СЃСЏ Рє СЃРѕРѕР±С‰РµСЃС‚РІСѓ" : "Join the community"}
          </p>
          <HomeCommunityLinks />
        </div>
      </div>
    </div>
  ) : null;

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-relic/20 bg-[#030609]/92 backdrop-blur-xl">
        <div className="mx-auto flex h-[82px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <RaidLogo compact withBumpyPay className="-ml-1 origin-left" />
          </Link>

          <nav className="hidden items-center gap-1 lg:flex">
            {sections.map((section) => {
              const Icon = iconMap[section.icon];
              return (
                <Link
                  key={section.href}
                  href={section.href}
                  className="flex items-center gap-2 rounded-[14px] border border-transparent px-3 py-2 text-sm uppercase tracking-[0.08em] text-zinc-300 transition hover:border-relic/40 hover:bg-relic/10 hover:text-relic"
                >
                  <Icon size={16} />
                  {labels[section.href as keyof typeof labels] ?? section.label}
                </Link>
              );
            })}
          </nav>

          <div className="hidden items-center gap-2 sm:flex">
            <LanguageSwitcher />
            <button className="grid h-10 w-10 place-items-center rounded-[14px] border border-relic/25 bg-black/35 text-zinc-300 transition hover:text-relic" aria-label={labels.search}>
              <Search size={18} />
            </button>
            <Link href="/dashboard" className="flex h-10 items-center gap-2 rounded-[14px] border border-relic/45 bg-black/35 px-3 text-sm font-semibold text-relic transition hover:bg-relic hover:text-black">
              <UserRound size={18} />
              {labels.dashboard}
            </Link>
          </div>

          <button
            className="grid h-14 w-14 place-items-center rounded-[16px] border border-relic/45 bg-black/45 text-relic shadow-glow lg:hidden"
            aria-label={labels.menu}
            onClick={() => setOpen(true)}
          >
            <Menu size={26} />
          </button>
        </div>
      </header>

      {mounted && mobileMenu ? createPortal(mobileMenu, document.body) : null}
    </>
  );
}
