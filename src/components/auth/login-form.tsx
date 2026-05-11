"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useState } from "react";
import { auth } from "@/lib/firebase/client";
import { normalizeEmail } from "@/lib/auth/role-utils";
import { GlassPanel } from "@/components/ui/glass-panel";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, normalizeEmail(email), password);
      router.push("/dashboard");
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Не удалось войти.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <GlassPanel className="p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="space-y-2">
          <span className="text-sm text-zinc-300">Email</span>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-md border-white/10 bg-black/30 text-white focus:border-relic focus:ring-relic"
            autoComplete="email"
            required
          />
        </label>
        <label className="space-y-2">
          <span className="text-sm text-zinc-300">Пароль</span>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-md border-white/10 bg-black/30 text-white focus:border-relic focus:ring-relic"
            autoComplete="current-password"
            required
          />
        </label>
        {error ? <p className="rounded-md border border-ember/30 bg-ember/10 p-3 text-sm text-ember">{error}</p> : null}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-relic px-4 py-3 text-sm font-black text-abyss transition hover:bg-relic/90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Входим..." : "Войти"}
        </button>
      </form>
      <p className="mt-5 text-sm text-zinc-400">
        Нет аккаунта?{" "}
        <Link href="/register" className="font-semibold text-relic">
          Зарегистрироваться
        </Link>
      </p>
    </GlassPanel>
  );
}
