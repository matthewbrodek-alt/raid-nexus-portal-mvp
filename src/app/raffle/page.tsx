"use client";

import Link from "next/link";
import { CheckCircle2, ChevronLeft, ShieldCheck, Sparkles } from "lucide-react";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { useEffect, useMemo, useRef, useState } from "react";
import { RaidLogo } from "@/components/brand/raid-logo";
import { useAuth } from "@/components/auth/auth-provider";
import { db } from "@/lib/firebase/client";
import { collections } from "@/lib/firebase/collections";
import { getNextRaffleInfo, getRaffleTimeLeft, RAFFLE_PRIZE, type RaffleInfo } from "@/lib/raffle";

const CRY_LINES = ["Ай-ай-ай!", "Хнык...", "Не по пузику!", "Еще чуть-чуть...", "Мачеха терпит ради рубинов", "Уже почти участник!"];
const REQUIRED_CLICKS = 100;
const MACHEHA_VIDEO_SRC = "/videos/raffle/macheha.webm";
const MACHEHA_CRY_SOUND_SRC = "/sounds/macheha-cry.mp3";

export default function RafflePage() {
  const { loading, profile, user } = useAuth();
  const [raffle, setRaffle] = useState<RaffleInfo | null>(null);
  const [now, setNow] = useState<Date | null>(null);
  const [clicks, setClicks] = useState(0);
  const [entryExists, setEntryExists] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [cryIndex, setCryIndex] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const timeLeft = useMemo(() => (raffle && now ? getRaffleTimeLeft(raffle.date, now) : { days: 0, hours: 0, minutes: 0, seconds: 0 }), [now, raffle]);
  const progress = Math.min(100, Math.round((clicks / REQUIRED_CLICKS) * 100));
  const entryId = user && raffle ? `${user.uid}_${raffle.drawKey}` : "";

  useEffect(() => {
    setRaffle(getNextRaffleInfo());
    setNow(new Date());
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!user || !entryId) {
      return;
    }

    let alive = true;

    getDoc(doc(db, collections.raffleEntries, entryId))
      .then((snapshot) => {
        if (alive) {
          setEntryExists(snapshot.exists());
        }
      })
      .catch(() => undefined);

    return () => {
      alive = false;
    };
  }, [entryId, user]);

  async function completeEntry(nextClicks: number) {
    if (!user || !raffle || saving || entryExists) {
      return;
    }

    setSaving(true);
    setError("");

    try {
      await setDoc(doc(db, collections.raffleEntries, entryId), {
        createdAt: serverTimestamp(),
        displayName: profile?.displayName || user.email || "Raid Player",
        drawAt: raffle.date.toISOString(),
        drawKey: raffle.drawKey,
        email: user.email || "",
        prize: RAFFLE_PRIZE,
        requiredClicks: REQUIRED_CLICKS,
        service: "ruby_subscription_raffle",
        source: "portal",
        totalClicks: nextClicks,
        uid: user.uid
      });
      setEntryExists(true);
    } catch {
      setError("Не удалось записать участие. Проверь вход в аккаунт и правила Firestore.");
    } finally {
      setSaving(false);
    }
  }

  function tapMacheha() {
    if (!user || entryExists || saving) {
      return;
    }

    if (videoRef.current) {
      const video = videoRef.current;

      video.pause();

      try {
        video.currentTime = 0;
      } catch {
        // Some mobile browsers reject seeking before metadata is ready.
      }

      void video.play().catch(() => undefined);
    }

    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      void audioRef.current.play().catch(() => undefined);
    }

    setCryIndex((current) => (current + 1) % CRY_LINES.length);
    setClicks((current) => {
      const next = Math.min(REQUIRED_CLICKS, current + 1);

      if (next >= REQUIRED_CLICKS) {
        void completeEntry(next);
      }

      return next;
    });
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#05070b] text-pale">
      <div className="fixed inset-0 bg-[url('/images/raid-castle-bg.png')] bg-cover bg-center opacity-58" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(231,193,106,0.12),transparent_24%),linear-gradient(180deg,rgba(5,7,11,0.48),#05070b_82%)]" />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-5 sm:px-6 lg:px-8">
        <header className="flex items-center justify-between gap-4">
          <RaidLogo compact />
          <Link href="/" className="raid-glow-button inline-flex items-center gap-2 border border-relic/35 bg-black/35 px-4 py-3 text-xs font-black uppercase tracking-[0.16em] text-relic">
            <ChevronLeft size={16} />
            На главную
          </Link>
        </header>

        <section className="mt-6 grid flex-1 gap-5 lg:grid-cols-[minmax(0,1fr)_380px]">
          <div className="raid-ornate-panel overflow-hidden p-5 sm:p-7">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.32em] text-relic">Ruby Giveaway</p>
                <h1 className="raid-title-metal mt-4 max-w-2xl text-4xl font-black uppercase leading-tight sm:text-6xl">
                  Потыкай мачехе в пузико 100 раз
                </h1>
                <p className="mt-4 max-w-2xl text-base leading-7 text-zinc-300">
                  После сотого клика аккаунт попадает в список участников ближайшего розыгрыша. Участвовать могут только зарегистрированные игроки.
                </p>
              </div>
              <div className="rounded-[18px] border border-relic/24 bg-black/32 px-4 py-3 text-right">
                <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Приз</p>
                <p className="mt-1 font-black text-relic">{RAFFLE_PRIZE}</p>
              </div>
            </div>

            <div className="relative mt-7 overflow-hidden rounded-[28px] border border-relic/30 bg-[#030407] shadow-[0_28px_90px_rgba(0,0,0,0.55)]">
              <div className="absolute inset-0 bg-[url('/images/raid-castle-bg.png')] bg-cover bg-center opacity-62" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_44%_54%,rgba(231,193,106,0.12),transparent_30%),linear-gradient(90deg,rgba(3,4,7,0.9),rgba(3,4,7,0.34),rgba(3,4,7,0.92))]" />

              <div
                className="group relative block min-h-[520px] w-full overflow-hidden text-left"
                aria-label="Потыкай мачеху в пузико"
              >
                <span className="pointer-events-none absolute left-[44%] top-[48%] h-[74%] w-[72%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(3,4,7,0.04),rgba(3,4,7,0.42)_54%,rgba(3,4,7,0.84)_78%,transparent_88%)] blur-xl" />
                <span className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(ellipse_at_44%_52%,transparent_0_35%,rgba(3,4,7,0.28)_56%,rgba(3,4,7,0.68)_82%)]" />
                <video
                  ref={videoRef}
                  src={MACHEHA_VIDEO_SRC}
                  className="pointer-events-none absolute inset-y-0 left-[44%] z-[2] h-full w-[112%] max-w-none -translate-x-1/2 object-contain object-center drop-shadow-[0_28px_55px_rgba(0,0,0,0.72)] [mask-image:radial-gradient(ellipse_at_44%_52%,black_0_54%,rgba(0,0,0,0.72)_64%,transparent_82%)] [mask-repeat:no-repeat] [mask-size:100%_100%]"
                  muted
                  playsInline
                  preload="auto"
                  onEnded={(event) => {
                    event.currentTarget.pause();
                    event.currentTarget.currentTime = 0;
                  }}
                />

                <button
                  type="button"
                  onClick={tapMacheha}
                  disabled={!user || entryExists || saving}
                  className="absolute left-[45%] top-[38%] z-[4] h-[37%] w-[31%] -translate-x-1/2 rounded-full bg-transparent text-transparent outline-none disabled:cursor-default"
                  aria-label="РџРѕС‚С‹РєР°Р№ РјР°С‡РµС…Сѓ РІ РїСѓР·РёРєРѕ"
                />

                <span className="pointer-events-none absolute left-4 top-4 z-[5] grid min-w-20 place-items-center rounded-[14px] border border-relic/40 bg-black/58 px-3 py-2 font-[var(--font-cinzel)] text-lg font-black text-relic shadow-[0_0_28px_rgba(200,154,61,0.2)] backdrop-blur-sm">
                  {clicks}/{REQUIRED_CLICKS}
                </span>

                <span className="pointer-events-none absolute bottom-5 left-5 right-5 z-[3] rounded-[20px] border border-relic/24 bg-black/68 p-4 backdrop-blur-sm">
                  <span className="flex items-center justify-between gap-3">
                    <span className="font-black text-white">{entryExists ? "Спасибо за участие в розыгрыше" : CRY_LINES[cryIndex]}</span>
                    <span className="text-sm font-bold text-relic">{progress}%</span>
                  </span>
                  <span className="mt-3 block h-2 overflow-hidden rounded-full bg-white/10">
                    <span className="block h-full rounded-full bg-relic transition-all" style={{ width: `${progress}%` }} />
                  </span>
                </span>
              </div>
            </div>

            <audio ref={audioRef} src={MACHEHA_CRY_SOUND_SRC} preload="auto" />
          </div>

          <aside className="space-y-5">
            <div className="raid-ornate-panel p-5">
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-relic">Следующий розыгрыш через</p>
              <div className="mt-4 grid grid-cols-2 gap-3">
                {[
                  [timeLeft.days, "дней"],
                  [timeLeft.hours, "часов"],
                  [timeLeft.minutes, "минут"],
                  [timeLeft.seconds, "секунд"]
                ].map(([value, label]) => (
                  <div key={label} className="rounded-[18px] border border-relic/18 bg-black/30 p-4 text-center">
                    <p className="font-[var(--font-cinzel)] text-3xl font-black text-white">{String(value).padStart(2, "0")}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.14em] text-zinc-500">{label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="raid-ornate-panel p-5">
              {loading ? (
                <p className="text-sm text-zinc-400">Проверяем аккаунт...</p>
              ) : user ? (
                <div>
                  <p className="inline-flex items-center gap-2 text-sm font-black text-white">
                    <ShieldCheck className="text-relic" size={18} />
                    {profile?.displayName || user.email}
                  </p>
                  <p className="mt-3 text-sm leading-6 text-zinc-400">
                    Нажми на мачеху {REQUIRED_CLICKS} раз. После завершения участие будет записано автоматически.
                  </p>
                  {entryExists ? (
                    <p className="mt-4 inline-flex items-center gap-2 rounded-[16px] border border-emerald-400/25 bg-emerald-400/10 px-4 py-3 text-sm font-bold text-emerald-200">
                      <CheckCircle2 size={18} />
                      Вы уже участвуете в ближайшем событии.
                    </p>
                  ) : null}
                  {error ? <p className="mt-4 rounded-[16px] border border-blood/35 bg-blood/10 px-4 py-3 text-sm text-red-200">{error}</p> : null}
                </div>
              ) : (
                <div>
                  <p className="text-lg font-black text-white">Нужен вход в аккаунт</p>
                  <p className="mt-2 text-sm leading-6 text-zinc-400">Розыгрыш доступен только зарегистрированным участникам портала.</p>
                  <Link href="/login" className="raid-glow-button mt-4 inline-flex items-center gap-2 border border-relic/35 bg-relic px-5 py-3 text-sm font-black text-black">
                    <Sparkles size={16} />
                    Войти
                  </Link>
                </div>
              )}
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}
