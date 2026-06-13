"use client";

import Link from "next/link";
import { Home, Menu, MessageCircle, Radio, Shield, ShoppingBag, Swords, UserRound, X, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { RaidLogo } from "@/components/brand/raid-logo";
import { HomeCommunityLinks } from "@/components/home/home-community-links";
import { HomeSearch } from "@/components/home/home-search";
import { LanguageSwitcher } from "@/components/i18n/language-switcher";
import { ThemeSwitcher } from "@/components/theme/theme-switcher";
import { useLanguage, type Language } from "@/lib/i18n/use-language";

const mobileLinks = [
  { label: { ru: "Главная", en: "Home" }, href: "/", icon: Home },
  { label: { ru: "Полезное", en: "Useful" }, href: "/useful", icon: Zap },
  { label: { ru: "Герои", en: "Heroes" }, href: "/heroes", icon: Swords },
  { label: { ru: "Покупка аккаунта", en: "Account Purchase" }, href: "/marketplace", icon: ShoppingBag },
  { label: { ru: "Кланы", en: "Clans" }, href: "/clans", icon: Shield },
  { label: { ru: "Чат", en: "Chat" }, href: "/chat", icon: MessageCircle },
  { label: { ru: "Эфир", en: "Live" }, href: "/stream", icon: Radio },
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
      <div className="min-h-dvh w-[84vw] max-w-sm overflow-y-auto bg-[#02060b]/96 p-4 shadow-2xl backdrop-blur-2xl">
        <div className="mb-3 flex items-center justify-between gap-3">
          <RaidLogo compact imageClassName="!h-12 !max-w-none sm:!h-14" />
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-[14px] border border-white/10 bg-black/50 text-zinc-300 transition hover:border-relic/50 hover:text-relic"
            aria-label={language === "ru" ? "Закрыть меню" : "Close menu"}
          >
            <X size={18} />
          </button>
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          <LanguageSwitcher />
          <ThemeSwitcher />
        </div>

        <div className="mb-4">
          <HomeSearch />
        </div>

        <nav className="space-y-2">
          {mobileLinks.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="raid-side-link flex h-14 items-center gap-4 border border-white/5 bg-black/55 px-4 text-sm font-semibold tracking-[0.04em] text-zinc-300 transition hover:border-relic/35 hover:text-relic"
              >
                <Icon className="relative z-10 h-5 w-5 shrink-0" />
                <span className="relative z-10">{text(item.label, language)}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-5 border-t border-white/10 pt-4">
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
      <header className="sticky top-0 z-50 -mx-4 flex h-16 items-center gap-3 border-b border-white/8 bg-[#050b12]/76 px-4 backdrop-blur-xl lg:hidden">
        <Link href="/" className="flex min-w-0 flex-1 items-center">
          <RaidLogo compact imageClassName="!h-12 !max-w-none sm:!h-14" />
        </Link>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="grid h-10 w-10 shrink-0 place-items-center rounded-[13px] border border-relic/40 bg-black/55 text-relic shadow-[0_0_20px_rgba(47,124,255,0.14)]"
          aria-label={language === "ru" ? "Открыть меню" : "Open menu"}
        >
          <Menu size={21} />
        </button>
      </header>

      {mounted && mobileMenu ? createPortal(mobileMenu, document.body) : null}
    </>
  );
}
