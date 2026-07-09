"use client";

import { PlayCircle } from "lucide-react";
import { doc, onSnapshot } from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";
import { db } from "@/lib/firebase/client";
import { collections } from "@/lib/firebase/collections";
import { useLanguage } from "@/lib/i18n/use-language";

type BroadcastSettings = {
  title?: string;
  videoUrl?: string;
  isLive?: boolean;
};

const defaultSettings: BroadcastSettings = {
  title: "Эфир",
  videoUrl: "",
  isLive: false
};

function isVideoFile(value?: string) {
  return Boolean(value && /\.(mp4|webm|ogg)(\?.*)?$/i.test(value));
}

function normalizePlaybackUrl(value?: string) {
  if (!value) {
    return "";
  }

  if (value.includes("/embed/") || value.includes("player.vimeo.com") || value.includes("vkvideo.ru/video_ext.php")) {
    return value;
  }

  const match = value.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?/]+)/);
  return match?.[1] ? `https://www.youtube.com/embed/${match[1]}` : value;
}

function getYoutubeId(value?: string) {
  if (!value) {
    return "";
  }

  const match = value.match(/(?:youtube\.com\/embed\/|youtube\.com\/watch\?v=|youtu\.be\/)([^&?/]+)/);
  return match?.[1] ?? "";
}

export function HomeBroadcast() {
  const { language } = useLanguage();
  const [settings, setSettings] = useState<BroadcastSettings>(defaultSettings);
  const [playerOpen, setPlayerOpen] = useState(false);
  const fallbackTitle = language === "ru" ? "Трансляция" : "Stream";

  useEffect(() => {
    return onSnapshot(
      doc(db, collections.siteSettings, "homeBroadcast"),
      (snapshot) => {
        setSettings({ ...defaultSettings, ...((snapshot.data() as BroadcastSettings | undefined) ?? {}) });
      },
      () => setSettings(defaultSettings)
    );
  }, []);

  const playbackUrl = useMemo(() => normalizePlaybackUrl(settings.videoUrl || defaultSettings.videoUrl), [settings.videoUrl]);
  const youtubeId = useMemo(() => getYoutubeId(settings.videoUrl || playbackUrl), [playbackUrl, settings.videoUrl]);
  const isLive = Boolean(settings.isLive && playbackUrl);
  const rawTitle = settings.title?.trim();
  const displayTitle = rawTitle && !rawTitle.toLowerCase().includes("боевой") && rawTitle !== defaultSettings.title ? rawTitle : "";

  useEffect(() => {
    setPlayerOpen(false);
  }, [playbackUrl]);

  return (
    <div className="raid-ornate-panel relative z-0 overflow-hidden p-5">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          {displayTitle ? <h2 className="raid-title-metal text-xl leading-tight">{displayTitle}</h2> : null}
        </div>
        <span
          className={`grid h-9 w-9 shrink-0 place-items-center rounded-full border shadow-[0_0_22px_rgba(47,124,255,0.16)] ${
            isLive ? "border-emerald-400/55 text-emerald-300" : "border-red-500/55 text-red-300"
          }`}
          title={isLive ? "Эфир запущен" : "Эфир выключен"}
        >
          <PlayCircle size={20} />
        </span>
      </div>

      {!playbackUrl ? (
        <div className="grid aspect-video place-items-center border border-relic/25 bg-black/70 p-6 text-center">
          <p className="text-sm font-semibold text-zinc-400">{language === "ru" ? "Трансляция скоро начнется" : "Stream starts soon"}</p>
        </div>
      ) : isVideoFile(playbackUrl) ? (
        <video className="relative z-0 aspect-video w-full border border-relic/25 bg-black object-cover" src={playbackUrl} controls playsInline preload="metadata" />
      ) : !playerOpen ? (
        <button
          type="button"
          onClick={() => setPlayerOpen(true)}
          className="group relative z-0 grid aspect-video w-full overflow-hidden border border-relic/25 bg-black text-left"
          aria-label={language === "ru" ? "РћС‚РєСЂС‹С‚СЊ С‚СЂР°РЅСЃР»СЏС†РёСЋ" : "Open stream"}
        >
          {youtubeId ? (
            <span
              className="absolute inset-0 bg-cover bg-center opacity-85 transition group-hover:scale-[1.02] group-hover:opacity-100"
              style={{ backgroundImage: `url("https://i.ytimg.com/vi_webp/${youtubeId}/hqdefault.webp")` }}
            />
          ) : null}
          <span className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,6,11,0.2),rgba(2,6,11,0.72))]" />
          <span className="relative z-10 m-auto inline-flex h-14 w-14 items-center justify-center rounded-full border border-white/20 bg-black/64 text-relic shadow-[0_0_28px_rgba(47,124,255,0.28)] transition group-hover:scale-105">
            <PlayCircle size={34} />
          </span>
        </button>
      ) : (
        <iframe
          className="relative z-0 aspect-video w-full border border-relic/25 bg-black"
          src={playbackUrl}
          title={displayTitle || fallbackTitle}
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      )}
    </div>
  );
}
