"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { GlassPanel } from "@/components/ui/glass-panel";
import { useAuth } from "@/components/auth/auth-provider";
import type { UserRole } from "@/lib/auth/types";

type ProtectedRouteProps = {
  allowedRoles?: UserRole[];
  children: React.ReactNode;
};

export function ProtectedRoute({ allowedRoles, children }: ProtectedRouteProps) {
  const { loading, profile, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, router, user]);

  if (loading) {
    return (
      <main className="grid min-h-screen place-items-center bg-raid-radial px-4 text-pale">
        <GlassPanel className="w-full max-w-md p-6 text-center">
          <p className="text-sm uppercase tracking-[0.2em] text-relic">Auth check</p>
          <p className="mt-3 text-zinc-300">Проверяем доступ к кабинету...</p>
        </GlassPanel>
      </main>
    );
  }

  if (!user || !profile) {
    return null;
  }

  if (allowedRoles && !allowedRoles.includes(profile.role)) {
    return (
      <main className="grid min-h-screen place-items-center bg-raid-radial px-4 text-pale">
        <GlassPanel className="w-full max-w-lg p-6">
          <p className="text-xs uppercase tracking-[0.24em] text-ember">Access denied</p>
          <h1 className="mt-3 text-3xl font-black text-white">Нет прав администратора</h1>
          <p className="mt-3 text-sm leading-6 text-zinc-400">
            Сейчас ваша роль: <span className="text-relic">{profile.role}</span>. Владелец портала может добавить
            ваш email в список администраторов.
          </p>
          <Link
            href="/dashboard"
            className="mt-5 inline-flex rounded-md border border-relic/30 bg-relic/10 px-4 py-2 text-sm font-semibold text-relic"
          >
            Перейти в личный кабинет
          </Link>
        </GlassPanel>
      </main>
    );
  }

  return <>{children}</>;
}
