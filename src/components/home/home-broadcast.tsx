"use client";

import { PlayCircle } from "lucide-react";
import { doc, onSnapshot } from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";
import { db } from "@/lib/firebase/client";
import { collections } from "@/lib/firebase/collections";

type BroadcastSettings = {
  title?: string;
  videoUrl?: string;
};

const defaultSettings: BroadcastSettings = {
  title: "Боевой эфир",
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
  const [settings, setSettings] = useState<BroadcastSettings>(defaultSettings);

  useEffect(() => {
    return onSnapshot(doc(db, collections.siteSettings, "homeBroadcast"), (snapshot) => {
      setSettings({ ...defaultSettings, ...((snapshot.data() as BroadcastSettings | undefined) ?? {}) });
    });
  }, []);

  const playbackUrl = useMemo(() => normalizeYoutubeUrl(settings.videoUrl || defaultSettings.videoUrl), [settings.videoUrl]);

  return (
    <div className="raid-ornate-panel overflow-hidden p-4 sm:p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.36em] text-relic">Raid Broadcast</p>
          <h2 className="mt-2 font-[var(--font-cinzel)] text-2xl font-black text-white">{settings.title || "Боевой эфир"}</h2>
        </div>
        <PlayCircle className="shrink-0 text-relic" />
      </div>

      {isVideoFile(playbackUrl) ? (
        <video className="aspect-video w-full border border-relic/25 bg-black object-cover" src={playbackUrl} controls playsInline />
      ) : (
        <iframe
          className="aspect-video w-full border border-relic/25 bg-black"
          src={playbackUrl}
          title={settings.title || "Raid broadcast"}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      )}
    </div>
  );
}
