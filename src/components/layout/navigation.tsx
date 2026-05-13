"use client";

import { Coins, Database, Menu, MessageSquare, Search, ShoppingBag, UserRound, Zap } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { LanguageSwitcher } from "@/components/i18n/language-switcher";
import { useLanguage } from "@/lib/i18n/use-language";

const iconMap = {
  coins: Coins,
  zap: Zap,
  shoppingBag: ShoppingBag,
  database: Database,
  messageSquare: MessageSquare
};

const navLabels = {
  ru: {
    "/donate": "Донат",
    "/topup": "Донат",
    "/useful": "Полезное",
    "/marketplace": "Маркет",
    "/heroes": "Герои",
    "/chat": "Чат",
    dashboard: "Личный кабинет",
    search: "Поиск",
    menu: "Меню"
  },
  en: {
    "/donate": "Donate",
    "/topup": "Donate",
    "/useful": "Useful",
    "/marketplace": "Marketplace",
    "/heroes": "Hero DB",
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
  const { language } = useLanguage();
  const labels = navLabels[language];

  return (
    <header className="sticky top-0 z-50 border-b border-relic/20 bg-[#030609]/92 backdrop-blur-xl">
      <div className="mx-auto flex h-[82px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <span className="grid h-14 w-14 place-items-center border border-relic/70 bg-black/50 font-[var(--font-cinzel)] text-3xl font-black text-relic shadow-glow">
            R
          </span>
          <span className="font-[var(--font-cinzel)] text-2xl font-black uppercase tracking-[0.06em] text-relic sm:text-3xl">Raid Portal</span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {sections.map((section) => {
            const Icon = iconMap[section.icon];
            return (
              <Link
                key={section.href}
                href={section.href}
                className="flex items-center gap-2 border border-transparent px-3 py-2 text-sm uppercase tracking-[0.08em] text-zinc-300 transition hover:border-relic/40 hover:bg-relic/10 hover:text-relic"
              >
                <Icon size={16} />
                {labels[section.href as keyof typeof labels] ?? section.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-2 sm:flex">
          <LanguageSwitcher />
          <button className="grid h-10 w-10 place-items-center border border-relic/25 bg-black/35 text-zinc-300 transition hover:text-relic" aria-label={labels.search}>
            <Search size={18} />
          </button>
          <Link href="/dashboard" className="flex h-10 items-center gap-2 border border-relic/45 bg-black/35 px-3 text-sm font-semibold text-relic transition hover:bg-relic hover:text-black">
            <UserRound size={18} />
            {labels.dashboard}
          </Link>
        </div>

        <button
          className="grid h-14 w-14 place-items-center border border-relic/45 bg-black/35 text-relic shadow-glow lg:hidden"
          aria-label={labels.menu}
          onClick={() => setOpen((value) => !value)}
        >
          <Menu size={26} />
        </button>
      </div>

      {open ? (
        <div className="border-t border-relic/20 bg-[#030609] px-4 py-3 lg:hidden">
          <div className="mb-3">
            <LanguageSwitcher />
          </div>
          {sections.map((section) => {
            const Icon = iconMap[section.icon];
            return (
              <Link
                key={section.href}
                href={section.href}
                className="flex items-center gap-2 border-b border-white/5 px-3 py-3 text-sm uppercase tracking-[0.08em] text-zinc-300"
                onClick={() => setOpen(false)}
              >
                <Icon size={16} />
                {labels[section.href as keyof typeof labels] ?? section.label}
              </Link>
            );
          })}
          <Link
            href="/dashboard"
            className="mt-2 flex items-center gap-2 border border-relic/40 bg-relic/10 px-3 py-3 text-sm font-semibold text-relic"
            onClick={() => setOpen(false)}
          >
            <UserRound size={16} />
            {labels.dashboard}
          </Link>
        </div>
      ) : null}
    </header>
  );
}
