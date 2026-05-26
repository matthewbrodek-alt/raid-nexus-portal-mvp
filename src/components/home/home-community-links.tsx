"use client";

import Link from "next/link";
import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase/client";
import { collections } from "@/lib/firebase/collections";

type SocialLinks = {
  telegram?: string;
  vkVideo?: string;
  vkCommunity?: string;
  youtube?: string;
  twitch?: string;
};

type HomeCommunityLinksProps = {
  variant?: "desktop" | "mobile";
};

const communityLinks = [
  { key: "telegram", title: "Telegram", icon: "/icons/social/telegram.png" },
  { key: "vkVideo", title: "VK Video", icon: "/icons/social/vk-video.png" },
  { key: "vkCommunity", title: "VK Community", icon: "/icons/social/vk-community.png" },
  { key: "youtube", title: "YouTube", icon: "/icons/social/youtube.png" },
  { key: "twitch", title: "Twitch", icon: "/icons/social/twitch.png" }
] as const;

function CommunityIcon({ icon, title, variant }: { icon: string; title: string; variant: "desktop" | "mobile" }) {
  return (
    // A plain image keeps local public assets visible even before Next optimizes them.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={icon}
      alt={title}
      className={`absolute left-1/2 top-1/2 z-10 max-w-none -translate-x-1/2 -translate-y-1/2 object-cover brightness-125 contrast-110 saturate-125 transition duration-200 group-hover:scale-105 group-hover:brightness-150 ${
        variant === "mobile"
          ? "h-[112%] w-[112%] drop-shadow-[0_0_7px_rgba(231,193,106,0.24)]"
          : "h-[104%] w-[104%] drop-shadow-[0_0_6px_rgba(231,193,106,0.2)]"
      }`}
    />
  );
}

export function HomeCommunityLinks({ variant = "desktop" }: HomeCommunityLinksProps) {
  const [links, setLinks] = useState<SocialLinks>({});

  useEffect(() => {
    let active = true;

    getDoc(doc(db, collections.siteSettings, "socialLinks"))
      .then((snapshot) => {
        if (active) {
          setLinks((snapshot.data() as SocialLinks | undefined) ?? {});
        }
      })
      .catch(() => {
        if (active) {
          setLinks({});
        }
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className={`relative z-20 grid grid-cols-5 ${variant === "mobile" ? "mt-5 gap-2" : "mt-4 gap-1.5"}`}>
      {communityLinks.map((item) => {
        const href = links[item.key];
        const className =
          `group relative z-20 aspect-square min-h-0 overflow-hidden bg-transparent transition duration-200 hover:-translate-y-0.5 ${
            variant === "mobile"
              ? "scale-[0.76] rounded-[11px] shadow-[0_0_12px_rgba(0,0,0,0.3)] hover:scale-[0.84] hover:shadow-[0_0_16px_rgba(231,193,106,0.16)]"
              : "scale-[0.72] rounded-[10px] shadow-[0_0_10px_rgba(0,0,0,0.25)] hover:scale-[0.8] hover:shadow-[0_0_12px_rgba(231,193,106,0.14)]"
          }`;
        const icon = <CommunityIcon icon={item.icon} title={item.title} variant={variant} />;

        if (!href) {
          return (
            <span key={item.key} title={item.title} className={`${className} grid place-items-center opacity-100`}>
              {icon}
            </span>
          );
        }

        return (
          <Link key={item.key} href={href} target="_blank" rel="noreferrer" title={item.title} className={`${className} grid place-items-center`}>
            {icon}
          </Link>
        );
      })}
    </div>
  );
}
