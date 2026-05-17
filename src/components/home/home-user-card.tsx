"use client";

import Link from "next/link";
import { UserRound } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { useLanguage } from "@/lib/i18n/use-language";

export function HomeUserCard() {
  const { language } = useLanguage();
  const { profile, user } = useAuth();
  const displayName = profile?.displayName || user?.email || (language === "ru" ? "Личный кабинет" : "Dashboard");
  const subtitle = profile ? (language === "ru" ? "Личный кабинет" : "Dashboard") : language === "ru" ? "Войти в аккаунт" : "Sign in";

  return (
    <Link href="/dashboard" className="raid-glow-button flex h-16 items-center gap-3 border border-relic/22 bg-black/32 px-4">
      <span className="grid h-12 w-12 place-items-center overflow-hidden rounded-full border border-relic/45 bg-gradient-to-br from-[#362414] to-[#111827] text-relic">
        {profile?.avatarUrl ? (
          <img src={profile.avatarUrl} alt={displayName} className="h-full w-full object-cover" />
        ) : (
          <UserRound size={24} />
        )}
      </span>
      <span className="min-w-0">
        <span className="block max-w-[160px] truncate text-base font-semibold text-white">{displayName}</span>
        <span className="block text-sm text-zinc-500">{subtitle}</span>
      </span>
    </Link>
  );
}
