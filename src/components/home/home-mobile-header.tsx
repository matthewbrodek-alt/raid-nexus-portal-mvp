"use client";

import Link from "next/link";
import { CalendarDays, Crown, Home, Menu, MessageCircle, Newspaper, Shield, ShoppingBag, Swords, UserRound, X } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { RaidLogo } from "@/components/brand/raid-logo";

const mobileLinks = [
  { label: "Главная", href: "/", icon: Home },
  { label: "Новости", href: "#news", icon: Newspaper },
  { label: "Герои", href: "/heroes", icon: Swords },
  { label: "Маркет", href: "/marketplace", icon: ShoppingBag },
  { label: "Календарь", href: "#calendar", icon: CalendarDays },
  { label: "Гильдии", href: "/chat", icon: Shield },
  { label: "Чат", href: "/chat", icon: MessageCircle },
  { label: "Донат", href: "/topup", icon: Crown },
  { label: "Личный кабинет", href: "/dashboard", icon: UserRound }
];

export function HomeMobileHeader() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

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
          <RaidLogo className="scale-[0.78] origin-left" />
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-[14px] border border-white/10 bg-black/50 text-zinc-300 transition hover:border-relic/50 hover:text-relic"
            aria-label="Закрыть меню"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="space-y-2">
          {mobileLinks.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setOpen(false)}
                className="raid-side-link flex h-14 items-center gap-4 border border-white/5 bg-black/55 px-4 text-sm font-semibold uppercase tracking-[0.1em] text-zinc-300 transition hover:border-relic/35 hover:text-relic"
              >
                <Icon className="relative z-10 h-5 w-5 shrink-0" />
                <span className="relative z-10">{item.label}</span>
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
          <RaidLogo className="scale-[0.82] origin-left" />
        </Link>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="grid h-12 w-12 shrink-0 place-items-center rounded-[16px] border border-relic/40 bg-black/55 text-relic shadow-[0_0_24px_rgba(216,168,71,0.16)]"
          aria-label="Открыть меню"
        >
          <Menu size={24} />
        </button>
      </header>

      {mounted && mobileMenu ? createPortal(mobileMenu, document.body) : null}
    </>
  );
}
