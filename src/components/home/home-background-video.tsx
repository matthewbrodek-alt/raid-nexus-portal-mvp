"use client";

import { doc, onSnapshot } from "firebase/firestore";
import type { CSSProperties } from "react";
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
      style={
        {
          "--raid-bg-image": settings.backgroundImageUrl ? `url(${settings.backgroundImageUrl})` : "none"
        } as CSSProperties
      }
      aria-hidden="true"
    />
  );
}
