"use client";

import { doc, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase/client";
import { collections } from "@/lib/firebase/collections";

type BroadcastSettings = {
  backgroundVideoUrl?: string;
  videoUrl?: string;
};

function isVideoFile(value?: string) {
  return Boolean(value && /\.(mp4|webm|ogg)(\?.*)?$/i.test(value));
}

export function HomeBackgroundVideo() {
  const [settings, setSettings] = useState<BroadcastSettings>({});

  useEffect(() => {
    return onSnapshot(doc(db, collections.siteSettings, "homeBroadcast"), (snapshot) => {
      setSettings((snapshot.data() as BroadcastSettings | undefined) ?? {});
    });
  }, []);

  const videoUrl = settings.backgroundVideoUrl || (isVideoFile(settings.videoUrl) ? settings.videoUrl : "");

  if (!videoUrl) {
    return null;
  }

  return (
    <video
      className="pointer-events-none fixed inset-0 z-0 h-full w-full object-cover opacity-30"
      src={videoUrl}
      autoPlay
      muted
      loop
      playsInline
      aria-hidden="true"
    />
  );
}
