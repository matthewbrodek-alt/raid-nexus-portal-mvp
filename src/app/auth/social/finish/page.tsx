"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { browserLocalPersistence, setPersistence, signInWithCustomToken, updateProfile } from "firebase/auth";
import { ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { upsertSocialUserProfile } from "@/lib/auth/social-client-profile";
import type { SocialProfileSeed } from "@/lib/auth/social-providers";
import { auth } from "@/lib/firebase/client";

type SocialConsumePayload = {
  customToken: string;
  profile: SocialProfileSeed;
  returnTo: string;
};

export default function SocialAuthFinishPage() {
  const router = useRouter();
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function finishSocialLogin() {
      try {
        const response = await fetch("/api/auth/social/consume", {
          cache: "no-store",
          credentials: "same-origin"
        });

        if (!response.ok) {
          throw new Error("Сессия входа истекла. Попробуйте снова.");
        }

        const payload = (await response.json()) as SocialConsumePayload;

        await setPersistence(auth, browserLocalPersistence);
        const credential = await signInWithCustomToken(auth, payload.customToken);
        await updateProfile(credential.user, {
          displayName: payload.profile.displayName,
          photoURL: payload.profile.avatarUrl || credential.user.photoURL
        }).catch(() => undefined);
        await upsertSocialUserProfile(credential.user, payload.profile);

        if (!cancelled) {
          router.replace(payload.returnTo || "/dashboard");
        }
      } catch (caughtError) {
        if (!cancelled) {
          setError(caughtError instanceof Error ? caughtError.message : "Не удалось завершить вход.");
        }
      }
    }

    finishSocialLogin();

    return () => {
      cancelled = true;
    };
  }, [router]);

  return (
    <main className="grid min-h-dvh place-items-center bg-raid-radial px-4 text-pale">
      <section className="glass w-full max-w-md rounded-2xl p-6 text-center shadow-2xl">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl border border-relic/30 bg-relic/10 text-relic">
          <ShieldCheck size={28} />
        </div>
        <h1 className="mt-5 text-2xl font-black text-white">Завершаем вход</h1>
        <p className="mt-2 text-sm font-semibold leading-6 text-zinc-400">
          Проверяем соцсеть, создаем безопасную сессию и возвращаем вас в портал.
        </p>
        {error ? (
          <div className="mt-5 rounded-xl border border-ember/30 bg-ember/10 p-4 text-left text-sm text-ember">
            <p>{error}</p>
            <Link href="/login" className="mt-3 inline-flex font-black text-relic">
              Вернуться ко входу
            </Link>
          </div>
        ) : (
          <div className="mx-auto mt-6 h-2 w-40 overflow-hidden rounded-full bg-white/10">
            <span className="block h-full w-1/2 animate-pulse rounded-full bg-relic" />
          </div>
        )}
      </section>
    </main>
  );
}
