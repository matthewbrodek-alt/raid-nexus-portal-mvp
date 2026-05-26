"use client";

import Link from "next/link";
import { Home, Menu, MessageCircle, Shield, ShoppingBag, Swords, UserRound, X, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { RaidLogo } from "@/components/brand/raid-logo";
import { LanguageSwitcher } from "@/components/i18n/language-switcher";
import { useLanguage, type Language } from "@/lib/i18n/use-language";

const mobileLinks = [
  { label: { ru: "Главная", en: "Home" }, href: "/", icon: Home },
  { label: { ru: "Полезное", en: "Useful" }, href: "/useful", icon: Zap },
  { label: { ru: "Герои", en: "Heroes" }, href: "/heroes", icon: Swords },
  { label: { ru: "Покупка аккаунта", en: "Account Purchase" }, href: "/marketplace", icon: ShoppingBag },
  { label: { ru: "Кланы", en: "Clans" }, href: "/clans", icon: Shield },
  { label: { ru: "Чат", en: "Chat" }, href: "/chat", icon: MessageCircle },
  { label: { ru: "Личный кабинет", en: "Dashboard" }, href: "/dashboard", icon: UserRound }
];

function text(value: { ru: string; en: string }, language: Language) {
  return value[language];
}

export function HomeMobileHeader() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { language } = useLanguage();

  useEffect(() => {
    setMounted(true);
  }, []);

  const mobileMenu = open ? (
    <div className="fixed inset-0 bg-black/92 backdrop-blur-2xl lg:hidden" role="dialog" aria-modal="true" style={{ zIndex: 2147483647 }}>
      <div className="min-h-dvh w-[84vw] max-w-sm overflow-y-auto border-r border-relic/30 bg-[#02060b]/96 p-4 shadow-2xl backdrop-blur-2xl">
        <div className="mb-5 flex items-center justify-between gap-3">
          <RaidLogo compact withBumpyPay className="origin-left" />
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-[14px] border border-white/10 bg-black/50 text-zinc-300 transition hover:border-relic/50 hover:text-relic"
            aria-label={language === "ru" ? "Закрыть меню" : "Close menu"}
          >
            <X size={18} />
          </button>
        </div>

        <div className="mb-4">
          <LanguageSwitcher />
        </div>

        <nav className="space-y-2">
          {mobileLinks.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="raid-side-link flex h-14 items-center gap-4 border border-white/5 bg-black/55 px-4 text-sm font-semibold uppercase tracking-[0.1em] text-zinc-300 transition hover:border-relic/35 hover:text-relic"
              >
                <Icon className="relative z-10 h-5 w-5 shrink-0" />
                <span className="relative z-10">{text(item.label, language)}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  ) : null;

  return (
    <>
      <header className="flex items-center gap-3 lg:hidden">
        <Link href="/" className="flex min-w-0 flex-1 items-center">
          <RaidLogo compact withBumpyPay className="-ml-1 origin-left" />
        </Link>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="grid h-12 w-12 shrink-0 place-items-center rounded-[16px] border border-relic/40 bg-black/55 text-relic shadow-[0_0_24px_rgba(216,168,71,0.16)]"
          aria-label={language === "ru" ? "Открыть меню" : "Open menu"}
        >
          <Menu size={24} />
        </button>
      </header>

      {mounted && mobileMenu ? createPortal(mobileMenu, document.body) : null}
    </>
  );
}
