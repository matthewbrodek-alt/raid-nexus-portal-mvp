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
};

const defaultSettings: BroadcastSettings = {
  title: "Эмбрис в 9 леса, что он может!?",
  videoUrl: "https://www.youtube.com/embed/MhsY9Uvcx7E"
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
  const defaultTitle = language === "ru" ? "Эмбрис в 9 леса, что он может!?" : "RAID Broadcast";

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

  return (
    <div className="raid-ornate-panel relative z-0 overflow-hidden p-5">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-[0.36em] text-relic">Raid Broadcast</p>
          <h2 className="raid-title-metal mt-3 text-xl font-black uppercase leading-tight">{settings.title && settings.title !== defaultSettings.title ? settings.title : defaultTitle}</h2>
        </div>
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-relic/55 text-relic shadow-[0_0_22px_rgba(216,168,71,0.16)]">
          <PlayCircle size={20} />
        </span>
      </div>

      {isVideoFile(playbackUrl) ? (
        <video className="relative z-0 aspect-video w-full border border-relic/25 bg-black object-cover" src={playbackUrl} controls playsInline />
      ) : (
        <iframe
          className="relative z-0 aspect-video w-full border border-relic/25 bg-black"
          src={playbackUrl}
          title={settings.title && settings.title !== defaultSettings.title ? settings.title : defaultTitle}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      )}
    </div>
  );
}
