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

function normalizeYoutubeUrl(value?: string) {
  if (!value) {
    return "";
  }

  if (value.includes("/embed/")) {
    return value;
  }

  const match = value.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?/]+)/);
  return match?.[1] ? `https://www.youtube.com/embed/${match[1]}` : value;
}

export function HomeBroadcast() {
  const { language } = useLanguage();
  const [settings, setSettings] = useState<BroadcastSettings>(defaultSettings);
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

  const playbackUrl = useMemo(() => normalizeYoutubeUrl(settings.videoUrl || defaultSettings.videoUrl), [settings.videoUrl]);
  const isLive = Boolean(settings.isLive && playbackUrl);
  const rawTitle = settings.title?.trim();
  const displayTitle = rawTitle && !rawTitle.toLowerCase().includes("боевой") && rawTitle !== defaultSettings.title ? rawTitle : "";

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
        <video className="relative z-0 aspect-video w-full border border-relic/25 bg-black object-cover" src={playbackUrl} controls playsInline />
      ) : (
        <iframe
          className="relative z-0 aspect-video w-full border border-relic/25 bg-black"
          src={playbackUrl}
          title={displayTitle || fallbackTitle}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      )}
    </div>
  );
}
