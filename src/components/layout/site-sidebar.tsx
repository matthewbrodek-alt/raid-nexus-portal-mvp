"use client";

import { Download, Home, MessageCircle, Radio, Shield, ShoppingBag, Swords, UserRound, Zap } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { RaidLogo } from "@/components/brand/raid-logo";
import { HomeCommunityLinks } from "@/components/home/home-community-links";
import { useLanguage, type Language } from "@/lib/i18n/use-language";

const sidebarLinks = [
  { label: { ru: "Главная", en: "Home" }, href: "/", icon: Home },
  { label: { ru: "Полезное", en: "Useful" }, href: "/useful", icon: Zap },
  { label: { ru: "Герои", en: "Heroes" }, href: "/heroes", icon: Swords },
  { label: { ru: "Покупка аккаунта", en: "Account Purchase" }, href: "/marketplace", icon: ShoppingBag },
  { label: { ru: "Кланы", en: "Clans" }, href: "/clans", icon: Shield },
  { label: { ru: "Чат", en: "Chat" }, href: "/chat", icon: MessageCircle },
  { label: { ru: "Эфир", en: "Live" }, href: "/stream", icon: Radio },
  { label: { ru: "Личный кабинет", en: "Dashboard" }, href: "/dashboard", icon: UserRound }
] as const;

const copy: Record<
  Language,
  {
    downloadTitle: string;
    downloadText: string;
    communityTitle: string;
  }
> = {
  ru: {
    downloadTitle: "Скачать RAID",
    downloadText: "Начни свое приключение",
    communityTitle: "Присоединяйся к сообществу"
  },
  en: {
    downloadTitle: "Download RAID",
    downloadText: "Start your adventure",
    communityTitle: "Join the community"
  }
};

function isActive(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteSidebar() {
  const pathname = usePathname();
  const { language } = useLanguage();
  const labels = copy[language];

  return (
    <aside className="hidden min-h-screen flex-col border-r border-relic/18 bg-[#02070c]/74 backdrop-blur-md lg:sticky lg:top-0 lg:flex lg:h-screen">
      <div className="flex h-28 items-center border-b border-relic/12 px-4">
        <Link href="/" className="min-w-0">
          <RaidLogo compact withBumpyPay className="-ml-1" />
        </Link>
      </div>

      <nav className="px-5 py-7">
        <div className="space-y-2">
          {sidebarLinks.map((item) => {
            const Icon = item.icon;
            const active = isActive(pathname, item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                data-active={active ? "true" : "false"}
                className="raid-side-link flex h-14 items-center gap-5 border border-transparent px-4 text-sm font-semibold tracking-[0.04em] text-zinc-400 transition hover:border-relic/35 hover:text-relic"
              >
                <Icon className="relative z-10 h-6 w-6 shrink-0" />
                <span className="relative z-10">{item.label[language]}</span>
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
            <span className="block text-xs font-bold tracking-[0.18em] text-relic">{labels.downloadTitle}</span>
            <span className="mt-1 block text-sm text-zinc-400">{labels.downloadText}</span>
          </span>
          <Download className="text-relic" size={22} />
        </Link>

        <div className="relative overflow-hidden rounded-[22px] border border-relic/28 bg-[#050b12]/82 p-5 shadow-[inset_0_0_28px_rgba(231,193,106,0.06),0_18px_55px_rgba(0,0,0,0.38)]">
          <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_22%_0%,rgba(231,193,106,0.16),transparent_34%),radial-gradient(circle_at_86%_92%,rgba(39,76,145,0.2),transparent_38%),linear-gradient(135deg,rgba(255,255,255,0.06),transparent_42%)]" />
          <span className="pointer-events-none absolute inset-0 opacity-[0.13] [background-image:linear-gradient(rgba(231,193,106,0.16)_1px,transparent_1px),linear-gradient(90deg,rgba(231,193,106,0.12)_1px,transparent_1px)] [background-size:18px_18px]" />
          <span className="pointer-events-none absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-relic/70 to-transparent" />
          <p className="relative z-10 text-xs font-bold tracking-[0.12em] text-zinc-300">{labels.communityTitle}</p>
          <HomeCommunityLinks />
        </div>
      </div>
    </aside>
  );
}
