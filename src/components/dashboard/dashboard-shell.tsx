"use client";

import Link from "next/link";
import { Crown, Home, LogOut, Shield } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { getAvatarFrameClass, getNicknameClass } from "@/lib/profile-cosmetics";
import { useLanguage, type Language } from "@/lib/i18n/use-language";

type LocalizedText = string | Record<Language, string>;

type DashboardShellProps = {
  title: LocalizedText;
  subtitle: LocalizedText;
  mode: "user" | "admin";
  children: React.ReactNode;
};

function resolveText(value: LocalizedText, language: Language) {
  return typeof value === "string" ? value : value[language];
}

export function DashboardShell({ title, subtitle, mode, children }: DashboardShellProps) {
  const { profile, signOut } = useAuth();
  const { language, isRu } = useLanguage();
  const hasAdminAccess = profile?.role === "admin" || profile?.role === "owner";
  const statusId = profile?.bpStatus ?? "bronze";
  const avatarFrameClass = getAvatarFrameClass(profile?.avatarFrame, statusId);
  const nicknameClass = getNicknameClass(profile?.nicknameStyle, statusId);

  return (
    <main className="min-h-screen bg-raid-radial text-pale">
      <header className="border-b border-white/10 bg-abyss/86 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <div className="flex items-center gap-3">
            <span className={`grid h-11 w-11 place-items-center overflow-hidden rounded-xl border-2 bg-relic/15 text-relic shadow-glow ${avatarFrameClass}`}>
              {profile?.avatarUrl ? (
                <img src={profile.avatarUrl} alt={profile.displayName} className="h-full w-full rounded-lg object-cover" />
              ) : mode === "admin" ? (
                <Shield />
              ) : (
                <Crown />
              )}
            </span>
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-relic">
                {mode === "admin" ? "Admin War Room" : "Player Sanctum"}
              </p>
              <h1 className="text-lg font-bold text-white sm:text-xl">{resolveText(title, language)}</h1>
              {profile ? <p className={`max-w-[220px] truncate text-sm font-black ${nicknameClass}`}>{profile.displayName}</p> : null}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {hasAdminAccess ? (
              <Link
                href={mode === "admin" ? "/dashboard" : "/admin"}
                className="rounded-md border border-ember/30 bg-ember/10 px-3 py-2 text-sm font-semibold text-ember transition hover:bg-ember/15"
              >
                {mode === "admin" ? (isRu ? "Кабинет игрока" : "Player cabinet") : isRu ? "Админ-панель" : "Admin panel"}
              </Link>
            ) : null}
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-md border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-zinc-300 transition hover:text-white"
            >
              <Home size={16} />
              {isRu ? "На главную" : "Home"}
            </Link>
            <button
              type="button"
              onClick={() => void signOut()}
              className="inline-flex items-center gap-2 rounded-md border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-zinc-300 transition hover:text-white"
            >
              <LogOut size={16} />
              {isRu ? "Выйти" : "Sign out"}
            </button>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {profile ? (
          <div className="mb-5 inline-flex rounded-full border border-relic/30 bg-relic/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-relic">
            {profile.role}
          </div>
        ) : null}
        <p className="max-w-3xl text-sm leading-7 text-zinc-400">{resolveText(subtitle, language)}</p>
        <div className="mt-8">{children}</div>
      </section>
    </main>
  );
}
