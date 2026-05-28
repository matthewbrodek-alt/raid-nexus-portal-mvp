"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { GlassPanel } from "@/components/ui/glass-panel";
import { useAuth } from "@/components/auth/auth-provider";
import { sendPortalEmailVerification } from "@/lib/auth/email-verification";
import type { UserRole } from "@/lib/auth/types";

type ProtectedRouteProps = {
  allowedRoles?: UserRole[];
  children: React.ReactNode;
};

export function ProtectedRoute({ allowedRoles, children }: ProtectedRouteProps) {
  const { loading, profile, signOut, user } = useAuth();
  const router = useRouter();
  const [verificationStatus, setVerificationStatus] = useState("");

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

  if (!user.emailVerified) {
    return (
      <main className="grid min-h-screen place-items-center bg-raid-radial px-4 text-pale">
        <GlassPanel className="w-full max-w-lg p-6">
          <p className="text-xs uppercase tracking-[0.24em] text-relic">Email verification</p>
          <h1 className="mt-3 text-3xl font-black text-white">Подтвердите email</h1>
          <p className="mt-3 text-sm leading-6 text-zinc-400">
            Для доступа к личному кабинету нужно подтвердить почту. Откройте письмо от Firebase и нажмите ссылку подтверждения.
          </p>
          {verificationStatus ? <p className="mt-4 rounded-md border border-relic/25 bg-relic/10 p-3 text-sm text-relic">{verificationStatus}</p> : null}
          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={async () => {
                await sendPortalEmailVerification(user);
                setVerificationStatus("Письмо подтверждения отправлено повторно.");
              }}
              className="rounded-md bg-relic px-4 py-2 text-sm font-black text-black"
            >
              Отправить письмо еще раз
            </button>
            <button
              type="button"
              onClick={async () => {
                await user.reload();
                await user.getIdToken(true);
                window.location.reload();
              }}
              className="rounded-md border border-relic/30 bg-relic/10 px-4 py-2 text-sm font-semibold text-relic"
            >
              Я подтвердил
            </button>
            <button
              type="button"
              onClick={() => void signOut()}
              className="rounded-md border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-zinc-300"
            >
              Выйти
            </button>
          </div>
        </GlassPanel>
      </main>
    );
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
