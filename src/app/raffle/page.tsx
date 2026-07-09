"use client";

import Link from "next/link";
import { CheckCircle2, ChevronLeft } from "lucide-react";
import { browserLocalPersistence, setPersistence, signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc, runTransaction, serverTimestamp, setDoc } from "firebase/firestore";
import { useCallback, useEffect, useRef, useState } from "react";
import { RaidLogo } from "@/components/brand/raid-logo";
import { useAuth } from "@/components/auth/auth-provider";
import { normalizeEmail } from "@/lib/auth/role-utils";
import { auth, db } from "@/lib/firebase/client";
import { collections } from "@/lib/firebase/collections";
import { getNextRaffleInfo, RAFFLE_PRIZE, type RaffleInfo } from "@/lib/raffle";
import type { PortalEventWidget } from "@/lib/types";

const CRY_LINES = ["Ай-ай-ай!", "Хнык...", "Не по пузику!", "Еще чуть-чуть...", "Мачеха терпит ради рубинов", "Уже почти участник!"];
const REQUIRED_CLICKS = 100;
const MACHEHA_CRY_SOUND_SRC = "/sounds/macheha-cry.mp3";
const HIT_VIDEO_KEYS = ["hit1", "hit2", "hit3", "hit4", "hit5"] as const;

type RaffleVideoKey = "idle" | (typeof HIT_VIDEO_KEYS)[number];
type RaffleVideoSource = {
  src: string;
  type: string;
};

const MACHEHA_VIDEOS: Record<RaffleVideoKey, RaffleVideoSource[]> = {
  idle: [
    { src: "/videos/raffle/macheha-idle.mp4", type: "video/mp4" },
    { src: "/videos/raffle/macheha-idle.webm", type: "video/webm" },
    { src: "/videos/raffle/macheha-idle.mov", type: "video/quicktime" },
    { src: "/videos/raffle/macheha.webm", type: "video/webm" },
    { src: "/videos/raffle/macheha.mov", type: "video/quicktime" }
  ],
  hit1: [
    { src: "/videos/raffle/macheha-hit-1.mp4", type: "video/mp4" },
    { src: "/videos/raffle/macheha-hit-1.webm", type: "video/webm" },
    { src: "/videos/raffle/macheha-hit-1.mov", type: "video/quicktime" },
    { src: "/videos/raffle/macheha.webm", type: "video/webm" },
    { src: "/videos/raffle/macheha.mov", type: "video/quicktime" }
  ],
  hit2: [
    { src: "/videos/raffle/macheha-hit-2.mp4", type: "video/mp4" },
    { src: "/videos/raffle/macheha-hit-2.webm", type: "video/webm" },
    { src: "/videos/raffle/macheha-hit-2.mov", type: "video/quicktime" },
    { src: "/videos/raffle/macheha.webm", type: "video/webm" },
    { src: "/videos/raffle/macheha.mov", type: "video/quicktime" }
  ],
  hit3: [
    { src: "/videos/raffle/macheha-hit-3.mp4", type: "video/mp4" },
    { src: "/videos/raffle/macheha-hit-3.webm", type: "video/webm" },
    { src: "/videos/raffle/macheha-hit-3.mov", type: "video/quicktime" },
    { src: "/videos/raffle/macheha.webm", type: "video/webm" },
    { src: "/videos/raffle/macheha.mov", type: "video/quicktime" }
  ],
  hit4: [
    { src: "/videos/raffle/macheha-hit-4.mp4", type: "video/mp4" },
    { src: "/videos/raffle/macheha-hit-4.webm", type: "video/webm" },
    { src: "/videos/raffle/macheha-hit-4.mov", type: "video/quicktime" },
    { src: "/videos/raffle/macheha-hit-1.mp4", type: "video/mp4" },
    { src: "/videos/raffle/macheha-hit-1.webm", type: "video/webm" }
  ],
  hit5: [
    { src: "/videos/raffle/macheha-hit-5.mp4", type: "video/mp4" },
    { src: "/videos/raffle/macheha-hit-5.webm", type: "video/webm" },
    { src: "/videos/raffle/macheha-hit-5.mov", type: "video/quicktime" },
    { src: "/videos/raffle/macheha-hit-2.mp4", type: "video/mp4" },
    { src: "/videos/raffle/macheha-hit-2.webm", type: "video/webm" }
  ]
};

function pickHitVideo(previous: RaffleVideoKey) {
  const available = HIT_VIDEO_KEYS.filter((item) => item !== previous);
  return available[Math.floor(Math.random() * available.length)] ?? HIT_VIDEO_KEYS[0];
}

export default function RafflePage() {
  const { loading, profile, user } = useAuth();
  const [eventId, setEventId] = useState("");
  const [raffle, setRaffle] = useState<RaffleInfo | null>(null);
  const [raffleWidget, setRaffleWidget] = useState<PortalEventWidget | null>(null);
  const [clicks, setClicks] = useState(0);
  const [entryExists, setEntryExists] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [cryIndex, setCryIndex] = useState(0);
  const [reactionVideo, setReactionVideo] = useState<(typeof HIT_VIDEO_KEYS)[number] | null>(null);
  const [reactionVisible, setReactionVisible] = useState(false);
  const [reactionNonce, setReactionNonce] = useState(0);
  const [reactionSourceIndex, setReactionSourceIndex] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const reactionVideoRef = useRef<HTMLVideoElement | null>(null);
  const shouldPlayReactionRef = useRef(false);
  const lastHitVideoRef = useRef<RaffleVideoKey>("idle");
  const reactionVideoSources = reactionVideo ? MACHEHA_VIDEOS[reactionVideo] : [];
  const reactionVideoSource = reactionVideoSources[reactionSourceIndex] ?? reactionVideoSources[0];
  const progress = Math.min(100, Math.round((clicks / REQUIRED_CLICKS) * 100));
  const entryId = user && raffle ? `${user.uid}_${raffle.drawKey}` : "";

  useEffect(() => {
    setEventId(new URLSearchParams(window.location.search).get("event") ?? "");
  }, []);

  const resetIdleVideo = useCallback((video: HTMLVideoElement | null = videoRef.current) => {
    if (!video) {
      return;
    }

    video.pause();

    try {
      video.currentTime = 0;
    } catch {
      // Some mobile browsers reject seeking before metadata is ready.
    }
  }, []);

  const playIdleVideo = useCallback((video: HTMLVideoElement | null = videoRef.current, fromStart = false) => {
    if (!video) {
      return;
    }

    video.muted = true;
    video.loop = true;

    if (fromStart) {
      try {
        video.currentTime = 0;
      } catch {
        // Some mobile browsers reject seeking before metadata is ready.
      }
    }

    void video.play().catch(() => undefined);
  }, []);

  useEffect(() => {
    let alive = true;

    async function loadRaffle() {
      const fallback = getNextRaffleInfo();

      if (!eventId) {
        setRaffleWidget(null);
        setRaffle(fallback);
        return;
      }

      const snapshot = await getDoc(doc(db, collections.eventWidgets, eventId)).catch(() => null);
      const widget = snapshot?.exists() ? ({ id: snapshot.id, ...(snapshot.data() as Omit<PortalEventWidget, "id">) } as PortalEventWidget) : null;

      if (!alive) {
        return;
      }

      if (widget?.status === "published" && widget.type === "contest") {
        const deadline = widget.deadlineAt ? new Date(widget.deadlineAt) : fallback.date;
        const date = Number.isNaN(deadline.getTime()) ? fallback.date : deadline;

        setRaffleWidget(widget);
        setRaffle({
          date,
          drawKey: widget.id,
          title: widget.title || fallback.title
        });
        return;
      }

      setRaffleWidget(null);
      setRaffle(fallback);
    }

    void loadRaffle();

    return () => {
      alive = false;
    };
  }, [eventId]);

  useEffect(() => {
    const video = videoRef.current;

    if (!video) {
      return;
    }

    video.muted = true;
    playIdleVideo(video, true);
  }, [playIdleVideo]);

  useEffect(() => {
    if (!reactionVideo || !shouldPlayReactionRef.current) {
      return;
    }

    const video = reactionVideoRef.current;

    if (!video) {
      return;
    }

    resetIdleVideo();
    video.pause();

    try {
      video.currentTime = 0;
    } catch {
      // Some mobile browsers reject seeking before metadata is ready.
    }

    void video
      .play()
      .then(() => {
        shouldPlayReactionRef.current = false;
      })
      .catch(() => {
        shouldPlayReactionRef.current = false;
        setReactionVisible(false);
        setReactionVideo(null);
      });
  }, [reactionNonce, reactionSourceIndex, reactionVideo, resetIdleVideo]);

  useEffect(() => {
    if (!user || !entryId) {
      setEntryExists(false);
      return;
    }

    let alive = true;
    setEntryExists(false);

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
        prize: raffleWidget?.prizeFund || RAFFLE_PRIZE,
        requiredClicks: REQUIRED_CLICKS,
        service: "ruby_subscription_raffle",
        source: "portal",
        totalClicks: nextClicks,
        uid: user.uid
      });

      if (raffleWidget?.id) {
        await runTransaction(db, async (transaction) => {
          const widgetRef = doc(db, collections.eventWidgets, raffleWidget.id);
          const widgetSnapshot = await transaction.get(widgetRef);
          const widgetData = widgetSnapshot.exists() ? (widgetSnapshot.data() as PortalEventWidget) : null;
          const participants = Array.isArray(widgetData?.participants) ? widgetData.participants : [];

          if (participants.includes(user.uid)) {
            return;
          }

          const nextParticipants = [...participants, user.uid];

          transaction.update(widgetRef, {
            participantCount: nextParticipants.length,
            participants: nextParticipants,
            updatedAt: serverTimestamp()
          });
        }).catch(() => undefined);
      }

      setEntryExists(true);
    } catch {
      setError("Не удалось записать участие. Проверь вход в аккаунт и правила Firestore.");
    } finally {
      setSaving(false);
    }
  }

  async function handleInlineLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoginError("");
    setError("");
    setLoginLoading(true);

    try {
      await setPersistence(auth, browserLocalPersistence);
      await signInWithEmailAndPassword(auth, normalizeEmail(loginEmail), loginPassword);
      setShowLoginForm(false);
    } catch (caughtError) {
      setLoginError(caughtError instanceof Error ? caughtError.message : "Не удалось войти в аккаунт.");
    } finally {
      setLoginLoading(false);
    }
  }

  function tapMacheha() {
    if (!user || entryExists || saving) {
      return;
    }

    const nextVideo = pickHitVideo(lastHitVideoRef.current);
    lastHitVideoRef.current = nextVideo;
    shouldPlayReactionRef.current = true;
    resetIdleVideo();
    setReactionVisible(false);
    setReactionSourceIndex(0);
    setReactionVideo(nextVideo);
    setReactionNonce((current) => current + 1);

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
      <div className="fixed inset-0 bg-[url('/images/raid-castle-bg-optimized.jpg')] bg-cover bg-center opacity-58" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(99,166,255,0.12),transparent_24%),linear-gradient(180deg,rgba(5,7,11,0.48),#05070b_82%)]" />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-5 sm:px-6 lg:px-8">
        <header className="flex items-center justify-between gap-4">
          <RaidLogo compact />
          <Link href="/" className="raid-glow-button inline-flex items-center gap-2 border border-relic/30 bg-black/40 px-4 py-3 text-xs font-black uppercase tracking-[0.16em] text-relic">
            <ChevronLeft size={16} />
            На главную
          </Link>
        </header>

        <section className="mt-6 flex flex-1 justify-center">
          <div className="raid-ornate-panel w-full max-w-4xl overflow-hidden p-5 sm:p-7">
            <div className="mx-auto mb-4 w-fit rounded-[18px] border border-relic/30 bg-black/20 px-6 py-3 text-center text-sm font-black text-relic shadow-[0_0_26px_rgba(47,124,255,0.14)]">
              Розыгрыш рубинов
            </div>
            <h1 className="max-w-3xl text-4xl font-black leading-[1.05] text-white sm:text-6xl">
              Потыкай мачехе в пузико 100 раз
            </h1>
            <p className="mt-5 max-w-3xl text-base font-semibold leading-7 text-zinc-300">
              После сотого клика аккаунт попадает в список участников ближайшего розыгрыша. Участвовать могут только зарегистрированные игроки.
            </p>

            <div className="relative mx-auto mt-7 w-full max-w-[520px] overflow-hidden rounded-[28px] border border-relic/30 bg-[#030407] shadow-[0_28px_90px_rgba(0,0,0,0.55)]">
              <div className="absolute inset-0 bg-[#02050a]" />

              <div
                className="group relative block aspect-square w-full overflow-hidden text-left"
                aria-label="Потыкай мачеху в пузико"
              >
                <span className="pointer-events-none absolute inset-0 z-[1] bg-[linear-gradient(90deg,rgba(2,5,10,0.82),transparent_18%,transparent_82%,rgba(2,5,10,0.82))]" />
                <video
                  ref={videoRef}
                  className="raffle-character-video pointer-events-none absolute left-[50%] top-0 z-[4] h-full w-full object-cover object-top opacity-100"
                  muted
                  playsInline
                  preload="auto"
                  autoPlay
                  loop
                  onLoadedMetadata={(event) => playIdleVideo(event.currentTarget, true)}
                  onCanPlay={(event) => playIdleVideo(event.currentTarget)}
                >
                  {MACHEHA_VIDEOS.idle.map((source) => (
                    <source key={source.src} src={source.src} type={source.type} />
                  ))}
                </video>

                {reactionVideo && reactionVideoSource ? (
                  <video
                    key={`${reactionVideo}-${reactionNonce}-${reactionSourceIndex}`}
                    ref={reactionVideoRef}
                    src={reactionVideoSource.src}
                    className={`raffle-character-video pointer-events-none absolute left-[50%] top-0 z-[5] h-full w-full object-cover object-top transition-opacity duration-200 ${
                      reactionVisible ? "opacity-100" : "opacity-0"
                    }`}
                    muted
                    playsInline
                    preload="auto"
                    onPlaying={() => setReactionVisible(true)}
                    onEnded={(event) => {
                      event.currentTarget.pause();

                      try {
                        event.currentTarget.currentTime = 0;
                      } catch {
                        // Some mobile browsers reject seeking before metadata is ready.
                      }

                      playIdleVideo(undefined, true);
                      setReactionVisible(false);
                      window.setTimeout(() => {
                        setReactionSourceIndex(0);
                        setReactionVideo(null);
                      }, 180);
                    }}
                    onError={() => {
                      setReactionSourceIndex((current) => (current + 1 < reactionVideoSources.length ? current + 1 : current));
                    }}
                  />
                ) : null}

                <button
                  type="button"
                  onClick={tapMacheha}
                  disabled={!user || entryExists || saving}
                  className="absolute left-1/2 top-[24%] z-[8] h-[48%] w-[34%] -translate-x-1/2 rounded-full bg-transparent text-transparent outline-none disabled:cursor-default"
                  aria-label="Потыкай мачеху в пузико"
                />

                <span className="pointer-events-none absolute left-4 top-4 z-[9] grid min-w-20 place-items-center rounded-[14px] border border-relic/40 bg-black/60 px-3 py-2 font-[var(--font-cinzel)] text-lg font-black text-relic shadow-[0_0_28px_rgba(47,124,255,0.2)] backdrop-blur-sm">
                  {clicks}/{REQUIRED_CLICKS}
                </span>

                <span className="pointer-events-none absolute bottom-5 left-5 right-5 z-[7] rounded-[20px] border border-relic/25 bg-black/70 p-4 backdrop-blur-sm">
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

            <div className="mt-5">
              {entryExists ? (
                <p className="raffle-entry-status inline-flex items-center gap-2 rounded-[16px] border border-emerald-400/25 bg-emerald-400/10 px-4 py-3 text-sm font-bold text-emerald-200">
                  <CheckCircle2 size={18} />
                  Спасибо за участие. Аккаунт уже записан в ближайший розыгрыш.
                </p>
              ) : null}

              {error ? <p className="mt-3 rounded-[16px] border border-blood/30 bg-blood/10 px-4 py-3 text-sm text-red-200">{error}</p> : null}

              {!loading && !user ? (
                <div className="mt-3 rounded-[18px] border border-relic/20 bg-black/30 p-4 text-sm text-zinc-300">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="max-w-xl font-semibold leading-6 text-zinc-300">
                      Чтобы клики засчитались и аккаунт попал в список участников, войдите в личный кабинет или зарегистрируйтесь.
                    </p>
                    <div className="flex shrink-0 flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setShowLoginForm((current) => !current)}
                        className="rounded-xl bg-relic px-5 py-2 text-xs font-black text-black transition hover:bg-[#8bbcff]"
                      >
                        Войти
                      </button>
                      <Link href="/register" className="rounded-xl border border-white/10 px-4 py-2 text-xs font-black text-relic transition hover:border-relic">
                        Регистрация
                      </Link>
                    </div>
                  </div>

                  {showLoginForm ? (
                    <form onSubmit={handleInlineLogin} className="mt-4 rounded-[16px] border border-white/10 bg-black/30 p-3">
                      <div className="grid gap-3 sm:grid-cols-2">
                        <input
                          type="email"
                          value={loginEmail}
                          onChange={(event) => setLoginEmail(event.target.value)}
                          className="min-w-0 rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-white outline-none transition focus:border-relic"
                          placeholder="Email"
                          autoComplete="email"
                          required
                        />
                        <input
                          type="password"
                          value={loginPassword}
                          onChange={(event) => setLoginPassword(event.target.value)}
                          className="min-w-0 rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-white outline-none transition focus:border-relic"
                          placeholder="Пароль"
                          autoComplete="current-password"
                          required
                        />
                      </div>
                      <div className="mt-3 flex justify-end">
                        <button
                          type="submit"
                          disabled={loginLoading}
                          className="rounded-xl bg-relic px-5 py-2 text-xs font-black text-black transition hover:bg-[#8bbcff] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {loginLoading ? "Вход..." : "Войти"}
                        </button>
                      </div>
                    </form>
                  ) : null}

                  {loginError ? <p className="mt-3 rounded-xl border border-blood/30 bg-blood/10 px-3 py-2 text-xs text-red-200">{loginError}</p> : null}
                </div>
              ) : null}
            </div>

            <audio ref={audioRef} src={MACHEHA_CRY_SOUND_SRC} preload="auto" />
          </div>
        </section>
      </div>
    </main>
  );
}
