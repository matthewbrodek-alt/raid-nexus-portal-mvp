"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { useState } from "react";
import { auth, db } from "@/lib/firebase/client";
import { normalizeEmail } from "@/lib/auth/role-utils";
import { collections } from "@/lib/firebase/collections";
import { GlassPanel } from "@/components/ui/glass-panel";

type GameAccountDraft = {
  gameNickname: string;
  notes: string;
  plariumId: string;
  serverRegion: string;
};

export function RegisterForm() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [gameAccount, setGameAccount] = useState<GameAccountDraft>({
    gameNickname: "",
    notes: "",
    plariumId: "",
    serverRegion: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function updateGameAccount(field: keyof GameAccountDraft, value: string) {
    setGameAccount((current) => ({ ...current, [field]: value }));
  }

  async function saveEncryptedGameData(uid: string) {
    const hasPayload = Object.values(gameAccount).some((value) => value.trim().length > 0);
    if (!hasPayload) {
      return;
    }

    const response = await fetch("/api/game-account", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ payload: gameAccount })
    });

    if (!response.ok) {
      throw new Error("Не удалось защитить игровые данные.");
    }

    const encrypted = await response.json();

    if (encrypted.encryptionStatus === "missing-server-key") {
      await setDoc(doc(db, collections.encryptedGameAccounts, uid), {
        algorithm: "AES-GCM",
        encryptionStatus: "missing-server-key",
        uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return;
    }

    await setDoc(doc(db, collections.encryptedGameAccounts, uid), {
      ...encrypted,
      keyVersion: "server-v1",
      uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const credential = await createUserWithEmailAndPassword(auth, normalizeEmail(email), password);
      await updateProfile(credential.user, { displayName });
      await saveEncryptedGameData(credential.user.uid);
      router.push("/dashboard");
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Не удалось зарегистрироваться.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <GlassPanel className="p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm text-zinc-300">Имя на портале</span>
            <input
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              className="w-full rounded-md border-white/10 bg-black/30 text-white focus:border-relic focus:ring-relic"
              autoComplete="name"
              required
            />
          </label>
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
        </div>
        <label className="space-y-2">
          <span className="text-sm text-zinc-300">Пароль</span>
          <input
            type="password"
            minLength={6}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-md border-white/10 bg-black/30 text-white focus:border-relic focus:ring-relic"
            autoComplete="new-password"
            required
          />
        </label>

        <div className="rounded-lg border border-white/10 bg-black/25 p-4">
          <p className="text-sm font-semibold text-white">Игровые данные</p>
          <p className="mt-1 text-xs leading-5 text-zinc-500">
            Поля необязательные. Данные передаются на серверный маршрут и сохраняются в `encryptedGameAccounts`
            через AES-GCM без раскрытия ключа в браузере.
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <input
              placeholder="Plarium ID"
              value={gameAccount.plariumId}
              onChange={(event) => updateGameAccount("plariumId", event.target.value)}
              className="rounded-md border-white/10 bg-black/30 text-white placeholder:text-zinc-500 focus:border-relic focus:ring-relic"
            />
            <input
              placeholder="Игровой ник"
              value={gameAccount.gameNickname}
              onChange={(event) => updateGameAccount("gameNickname", event.target.value)}
              className="rounded-md border-white/10 bg-black/30 text-white placeholder:text-zinc-500 focus:border-relic focus:ring-relic"
            />
            <input
              placeholder="Регион / сервер"
              value={gameAccount.serverRegion}
              onChange={(event) => updateGameAccount("serverRegion", event.target.value)}
              className="rounded-md border-white/10 bg-black/30 text-white placeholder:text-zinc-500 focus:border-relic focus:ring-relic"
            />
            <input
              placeholder="Комментарий"
              value={gameAccount.notes}
              onChange={(event) => updateGameAccount("notes", event.target.value)}
              className="rounded-md border-white/10 bg-black/30 text-white placeholder:text-zinc-500 focus:border-relic focus:ring-relic"
            />
          </div>
        </div>

        {error ? <p className="rounded-md border border-ember/30 bg-ember/10 p-3 text-sm text-ember">{error}</p> : null}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-relic px-4 py-3 text-sm font-black text-abyss transition hover:bg-relic/90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Создаем аккаунт..." : "Зарегистрироваться"}
        </button>
      </form>
      <p className="mt-5 text-sm text-zinc-400">
        Уже есть аккаунт?{" "}
        <Link href="/login" className="font-semibold text-relic">
          Войти
        </Link>
      </p>
    </GlassPanel>
  );
}
