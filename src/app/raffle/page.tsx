"use client";

import Link from "next/link";
import { CheckCircle2, ChevronLeft } from "lucide-react";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { useEffect, useRef, useState } from "react";
import { RaidLogo } from "@/components/brand/raid-logo";
import { useAuth } from "@/components/auth/auth-provider";
import { db } from "@/lib/firebase/client";
import { collections } from "@/lib/firebase/collections";
import { getNextRaffleInfo, RAFFLE_PRIZE, type RaffleInfo } from "@/lib/raffle";

const CRY_LINES = ["Ай-ай-ай!", "Хнык...", "Не по пузику!", "Еще чуть-чуть...", "Мачеха терпит ради рубинов", "Уже почти участник!"];
const REQUIRED_CLICKS = 100;
const MACHEHA_CRY_SOUND_SRC = "/sounds/macheha-cry.mp3";
const HIT_VIDEO_KEYS = ["hit1", "hit2", "hit3"] as const;

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
  ]
};

function pickHitVideo(previous: RaffleVideoKey) {
  const available = HIT_VIDEO_KEYS.filter((item) => item !== previous);
  return available[Math.floor(Math.random() * available.length)] ?? HIT_VIDEO_KEYS[0];
}

export default function RafflePage() {
  const { loading, profile, user } = useAuth();
  const [raffle, setRaffle] = useState<RaffleInfo | null>(null);
  const [clicks, setClicks] = useState(0);
  const [entryExists, setEntryExists] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [cryIndex, setCryIndex] = useState(0);
  const [activeVideo, setActiveVideo] = useState<RaffleVideoKey>("idle");
  const [videoNonce, setVideoNonce] = useState(0);
  const [videoSourceIndex, setVideoSourceIndex] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const shouldPlayReactionRef = useRef(false);
  const lastHitVideoRef = useRef<RaffleVideoKey>("idle");
  const activeVideoSources = MACHEHA_VIDEOS[activeVideo];
  const activeVideoSource = activeVideoSources[videoSourceIndex] ?? activeVideoSources[0];
  const progress = Math.min(100, Math.round((clicks / REQUIRED_CLICKS) * 100));
  const entryId = user && raffle ? `${user.uid}_${raffle.drawKey}` : "";

  useEffect(() => {
    setRaffle(getNextRaffleInfo());
  }, []);

  useEffect(() => {
    const video = videoRef.current;

    if (!video) {
      return;
    }

    if (activeVideo === "idle") {
      video.muted = true;
      void video.play().catch(() => undefined);
      return;
    }

    if (!shouldPlayReactionRef.current) {
      return;
    }

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
      .catch(() => undefined);
  }, [activeVideo, videoNonce, videoSourceIndex]);

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

    const nextVideo = pickHitVideo(lastHitVideoRef.current);
    lastHitVideoRef.current = nextVideo;
    shouldPlayReactionRef.current = true;
    setVideoSourceIndex(0);
    setActiveVideo(nextVideo);
    setVideoNonce((current) => current + 1);

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
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(99,166,255,0.12),transparent_24%),linear-gradient(180deg,rgba(5,7,11,0.48),#05070b_82%)]" />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-5 sm:px-6 lg:px-8">
        <header className="flex items-center justify-between gap-4">
          <RaidLogo compact />
          <Link href="/" className="raid-glow-button inline-flex items-center gap-2 border border-relic/35 bg-black/35 px-4 py-3 text-xs font-black uppercase tracking-[0.16em] text-relic">
            <ChevronLeft size={16} />
            На главную
          </Link>
        </header>

        <section className="mt-6 flex flex-1 justify-center">
          <div className="raid-ornate-panel w-full max-w-4xl overflow-hidden p-5 sm:p-7">
            <p className="text-xs font-bold tracking-[0.24em] text-relic">Ruby giveaway</p>
            <h1 className="mt-3 max-w-3xl text-4xl font-black leading-[1.05] text-white sm:text-6xl">
              Потыкай мачехе в пузико 100 раз
            </h1>
            <p className="mt-5 max-w-3xl text-base font-semibold leading-7 text-zinc-300">
              После сотого клика аккаунт попадает в список участников ближайшего розыгрыша. Участвовать могут только зарегистрированные игроки.
            </p>

            <div className="mt-5 inline-flex min-w-[178px] flex-col rounded-[18px] border border-white/80 bg-black/18 px-5 py-3">
              <span className="text-center text-[11px] font-bold tracking-[0.28em] text-zinc-500">Приз</span>
              <span className="mt-1 text-lg font-black text-relic">{RAFFLE_PRIZE}</span>
            </div>

            <div className="relative mx-auto mt-7 w-full max-w-[520px] overflow-hidden rounded-[28px] border border-relic/30 bg-[#030407] shadow-[0_28px_90px_rgba(0,0,0,0.55)]">
              <div className="absolute inset-0 bg-[#02050a]" />

              <div
                className="group relative block aspect-square w-full overflow-hidden text-left"
                aria-label="Потыкай мачеху в пузико"
              >
                <span className="pointer-events-none absolute inset-0 z-[1] bg-[linear-gradient(90deg,rgba(2,5,10,0.82),transparent_18%,transparent_82%,rgba(2,5,10,0.82))]" />
                <video
                  key={`${activeVideo}-${videoNonce}-${videoSourceIndex}`}
                  ref={videoRef}
                  src={activeVideoSource?.src}
                  className="raffle-character-video pointer-events-none absolute left-0 top-0 z-[4] h-full w-full object-cover object-top opacity-100"
                  muted
                  playsInline
                  preload="auto"
                  autoPlay={activeVideo === "idle"}
                  loop={activeVideo === "idle"}
                  onEnded={(event) => {
                    if (activeVideo === "idle") {
                      return;
                    }

                    event.currentTarget.pause();

                    try {
                      event.currentTarget.currentTime = 0;
                    } catch {
                      // Some mobile browsers reject seeking before metadata is ready.
                    }

                    setVideoSourceIndex(0);
                    setActiveVideo("idle");
                    setVideoNonce((current) => current + 1);
                  }}
                  onError={() => {
                    setVideoSourceIndex((current) => (current + 1 < activeVideoSources.length ? current + 1 : current));
                  }}
                />

                <button
                  type="button"
                  onClick={tapMacheha}
                  disabled={!user || entryExists || saving}
                  className="absolute left-1/2 top-[24%] z-[8] h-[48%] w-[34%] -translate-x-1/2 rounded-full bg-transparent text-transparent outline-none disabled:cursor-default"
                  aria-label="РџРѕС‚С‹РєР°Р№ РјР°С‡РµС…Сѓ РІ РїСѓР·РёРєРѕ"
                />

                <span className="pointer-events-none absolute left-4 top-4 z-[9] grid min-w-20 place-items-center rounded-[14px] border border-relic/40 bg-black/58 px-3 py-2 font-[var(--font-cinzel)] text-lg font-black text-relic shadow-[0_0_28px_rgba(47,124,255,0.2)] backdrop-blur-sm">
                  {clicks}/{REQUIRED_CLICKS}
                </span>

                <span className="pointer-events-none absolute bottom-5 left-5 right-5 z-[7] rounded-[20px] border border-relic/24 bg-black/68 p-4 backdrop-blur-sm">
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
                <p className="inline-flex items-center gap-2 rounded-[16px] border border-emerald-400/25 bg-emerald-400/10 px-4 py-3 text-sm font-bold text-emerald-200">
                  <CheckCircle2 size={18} />
                  Спасибо за участие. Аккаунт уже записан в ближайший розыгрыш.
                </p>
              ) : null}

              {error ? <p className="mt-3 rounded-[16px] border border-blood/35 bg-blood/10 px-4 py-3 text-sm text-red-200">{error}</p> : null}

              {!loading && !user ? (
                <p className="mt-3 rounded-[16px] border border-relic/18 bg-black/24 px-4 py-3 text-sm leading-6 text-zinc-400">
                  Для записи участия нужен вход в аккаунт. Без входа клики не сохраняются.
                </p>
              ) : null}
            </div>

            <audio ref={audioRef} src={MACHEHA_CRY_SOUND_SRC} preload="auto" />
          </div>
        </section>
      </div>
    </main>
  );
}
