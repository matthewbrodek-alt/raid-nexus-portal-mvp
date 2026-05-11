"use client";

import Link from "next/link";
import { Crown, Home, LogOut, Shield } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";

type DashboardShellProps = {
  title: string;
  subtitle: string;
  mode: "user" | "admin";
  children: React.ReactNode;
};

export function DashboardShell({ title, subtitle, mode, children }: DashboardShellProps) {
  const { profile, signOut } = useAuth();
  const hasAdminAccess = profile?.role === "admin" || profile?.role === "owner";

  return (
    <main className="min-h-screen bg-raid-radial text-pale">
      <header className="border-b border-white/10 bg-abyss/86 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-lg border border-relic/40 bg-relic/15 text-relic shadow-glow">
              {mode === "admin" ? <Shield /> : <Crown />}
            </span>
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-relic">
                {mode === "admin" ? "Admin War Room" : "Player Sanctum"}
              </p>
              <h1 className="text-xl font-bold text-white">{title}</h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {hasAdminAccess ? (
              <Link
                href={mode === "admin" ? "/dashboard" : "/admin"}
                className="rounded-md border border-ember/30 bg-ember/10 px-3 py-2 text-sm font-semibold text-ember transition hover:bg-ember/15"
              >
                {mode === "admin" ? "Кабинет игрока" : "Админ-панель"}
              </Link>
            ) : null}
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-md border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-zinc-300 transition hover:text-white"
            >
              <Home size={16} />
              На главную
            </Link>
            <button
              type="button"
              onClick={() => void signOut()}
              className="inline-flex items-center gap-2 rounded-md border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-zinc-300 transition hover:text-white"
            >
              <LogOut size={16} />
              Выйти
            </button>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {profile ? (
          <div className="mb-5 inline-flex rounded-full border border-relic/30 bg-relic/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-relic">
            {profile.email} · {profile.role}
          </div>
        ) : null}
        <p className="max-w-3xl text-sm leading-7 text-zinc-400">{subtitle}</p>
        <div className="mt-8">{children}</div>
      </section>
    </main>
  );
}
