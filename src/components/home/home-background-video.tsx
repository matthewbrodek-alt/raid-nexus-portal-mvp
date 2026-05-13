"use client";

import { doc, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase/client";
import { collections } from "@/lib/firebase/collections";

type BackgroundSettings = {
  backgroundImageUrl?: string;
};

export function HomeBackgroundVideo() {
  const [settings, setSettings] = useState<BackgroundSettings>({});

  useEffect(() => {
    return onSnapshot(doc(db, collections.siteSettings, "homeBroadcast"), (snapshot) => {
      setSettings((snapshot.data() as BackgroundSettings | undefined) ?? {});
    });
  }, []);

  return (
    <div
      className="raid-static-background pointer-events-none fixed inset-0 z-0"
      style={settings.backgroundImageUrl ? { backgroundImage: `url(${settings.backgroundImageUrl})` } : undefined}
      aria-hidden="true"
    />
  );
}
