"use client";

import { SignalZero } from "lucide-react";
import { doc, onSnapshot } from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";
import { db } from "@/lib/firebase/client";
import { collections } from "@/lib/firebase/collections";
import { useLanguage } from "@/lib/i18n/use-language";
import { StreamLiveChat } from "./stream-live-chat";

type StreamSettings = {
  title?: string;
  videoUrl?: string;
  backgroundImageUrl?: string;
  isLive?: boolean;
};

const defaultSettings: StreamSettings = {
  title: "Эфир",
  videoUrl: "",
  backgroundImageUrl: "",
  isLive: false
};

function isVideoFile(value?: string) {
  return Boolean(value && /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(value));
}

function normalizeEmbedUrl(value?: string) {
  if (!value) {
    return "";
  }

  if (value.includes("/embed/") || value.includes("player.vimeo.com") || value.includes("vkvideo.ru/video_ext.php")) {
    return value;
  }

  const youtubeMatch = value.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?/]+)/);
  if (youtubeMatch?.[1]) {
    return `https://www.youtube.com/embed/${youtubeMatch[1]}`;
  }

  const twitchMatch = value.match(/twitch\.tv\/([^/?]+)/);
  if (twitchMatch?.[1] && !value.includes("player.twitch.tv")) {
    const parent = typeof window === "undefined" ? "" : `&parent=${window.location.hostname}`;
    return `https://player.twitch.tv/?channel=${twitchMatch[1]}${parent}`;
  }

  return value;
}

export function StreamPageContent() {
  const { language } = useLanguage();
  const [settings, setSettings] = useState<StreamSettings>(defaultSettings);

  useEffect(() => {
    return onSnapshot(
      doc(db, collections.siteSettings, "streamBroadcast"),
      (snapshot) => setSettings({ ...defaultSettings, ...((snapshot.data() as StreamSettings | undefined) ?? {}) }),
      () => setSettings(defaultSettings)
    );
  }, []);

  const playbackUrl = useMemo(() => normalizeEmbedUrl(settings.videoUrl), [settings.videoUrl]);
  const isLive = Boolean(settings.isLive && playbackUrl);
  const rawTitle = settings.title?.trim();
  const title = rawTitle && !rawTitle.toLowerCase().includes("боевой") ? rawTitle : language === "ru" ? "Эфир" : "Live stream";
  const statusText = isLive ? (language === "ru" ? "Эфир запущен" : "Live now") : language === "ru" ? "Эфир выключен" : "Offline";

  return (
    <section className="mx-auto max-w-5xl">
      <div className="raid-ornate-panel overflow-hidden p-4 sm:p-6">
        <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.34em] text-relic">{language === "ru" ? "Трансляция портала" : "Portal stream"}</p>
            <h2 className="raid-title-metal mt-3 text-3xl font-black uppercase leading-tight sm:text-5xl">{title}</h2>
          </div>
          <div
            className={`inline-flex items-center gap-3 rounded-full border px-4 py-2 text-sm font-black uppercase tracking-[0.12em] ${
              isLive
                ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-300 shadow-[0_0_26px_rgba(52,211,153,0.18)]"
                : "border-red-500/40 bg-red-500/10 text-red-300 shadow-[0_0_26px_rgba(239,68,68,0.14)]"
            }`}
          >
            <span className={`h-3 w-3 rounded-full ${isLive ? "animate-pulse bg-emerald-400" : "bg-red-500"}`} />
            {statusText}
          </div>
        </div>

        <div
          className="relative overflow-hidden rounded-[24px] border border-relic/25 bg-black shadow-[0_28px_80px_rgba(0,0,0,0.58)]"
          style={
            settings.backgroundImageUrl
              ? {
                  backgroundImage: `linear-gradient(180deg, rgba(2,6,11,0.52), rgba(2,6,11,0.88)), url(${settings.backgroundImageUrl})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center"
                }
              : undefined
          }
        >
          {playbackUrl ? (
            isVideoFile(playbackUrl) ? (
              <video className="relative z-10 aspect-video w-full bg-black object-cover" src={playbackUrl} controls playsInline />
            ) : (
              <iframe
                className="relative z-10 aspect-video w-full bg-black"
                src={playbackUrl}
                title={title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            )
          ) : (
            <div className="grid aspect-video place-items-center p-8 text-center">
              <div>
                <SignalZero className="mx-auto h-12 w-12 text-red-300" />
                <p className="mt-4 text-xl font-black text-white">{language === "ru" ? "Эфир скоро начнется" : "Stream starts soon"}</p>
                <p className="mt-2 text-sm text-zinc-400">
                  {language === "ru" ? "Администратор еще не добавил ссылку на трансляцию." : "The stream link has not been added yet."}
                </p>
              </div>
            </div>
          )}
        </div>

        <StreamLiveChat />
      </div>

    </section>
  );
}
