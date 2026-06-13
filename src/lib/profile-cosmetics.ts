import type { BpStatusId } from "@/lib/bp-status";

export type AvatarFrameId =
  | "none"
  | "bronze-root"
  | "bronze-blade"
  | "silver-thorn"
  | "silver-ice"
  | "gold-crown"
  | "gold-dragon"
  | "platinum-crystal"
  | "platinum-void"
  | "rgb"
  | "admin-blue";
export type NicknameStyleId =
  | "plain"
  | "violet"
  | "purple"
  | "fuchsia"
  | "blue"
  | "cyan"
  | "emerald"
  | "amber"
  | "orange"
  | "crimson"
  | "relic"
  | "ember"
  | "rgb";

const statusRank: Record<BpStatusId, number> = {
  bronze: 0,
  silver: 1,
  gold: 2,
  platinum: 3
};

type Unlockable = {
  minStatus: BpStatusId;
};

export const avatarFrames: Array<Unlockable & { id: AvatarFrameId; label: string; className: string; previewClassName: string; adminOnly?: boolean }> = [
  {
    id: "none",
    label: "Без рамки",
    minStatus: "bronze",
    className: "bp-frame-none",
    previewClassName: "from-zinc-950 via-zinc-800 to-zinc-700"
  },
  {
    id: "bronze-root",
    label: "Root Relic",
    minStatus: "bronze",
    className: "bp-frame-bronze bp-frame-art-root",
    previewClassName: "from-[#3b2417] via-[#a97142] to-[#f1b37a]"
  },
  {
    id: "bronze-blade",
    label: "Bronze Blades",
    minStatus: "bronze",
    className: "bp-frame-bronze bp-frame-bronze-iron bp-frame-art-blades",
    previewClassName: "from-[#241008] via-[#9f4f24] to-[#f1b37a]"
  },
  {
    id: "silver-thorn",
    label: "Silver Thorns",
    minStatus: "silver",
    className: "bp-frame-silver bp-frame-silver-guard bp-frame-art-thorns",
    previewClassName: "from-[#5d6670] via-[#cfd8e3] to-[#ffffff]"
  },
  {
    id: "silver-ice",
    label: "Moon Ice",
    minStatus: "silver",
    className: "bp-frame-silver bp-frame-silver-moon bp-frame-art-ice",
    previewClassName: "from-[#172238] via-[#9db9d8] to-[#ffffff]"
  },
  {
    id: "gold-crown",
    label: "Royal Crest",
    minStatus: "gold",
    className: "bp-frame-gold bp-frame-gold-royal bp-frame-art-crown",
    previewClassName: "from-[#704611] via-[#63a6ff] to-[#fff0a8]"
  },
  {
    id: "gold-dragon",
    label: "Dragon Gold",
    minStatus: "gold",
    className: "bp-frame-ember bp-frame-art-dragon",
    previewClassName: "from-[#42110a] via-[#ff7a2f] to-[#ffd28b]"
  },
  {
    id: "platinum-crystal",
    label: "Crystal Aegis",
    minStatus: "platinum",
    className: "bp-frame-platinum bp-frame-art-crystal",
    previewClassName: "from-[#1d3f55] via-[#9ee7ff] to-[#ffffff]"
  },
  {
    id: "platinum-void",
    label: "Void Rune",
    minStatus: "platinum",
    className: "bp-frame-void bp-frame-art-void",
    previewClassName: "from-[#1b102d] via-[#7c3aed] to-[#d8b4fe]"
  },
  {
    id: "rgb",
    label: "RGB Mythic",
    minStatus: "gold",
    className: "bp-frame-rgb bp-avatar-rgb bp-frame-style-crown",
    previewClassName: "from-red-500 via-emerald-400 to-cyan-400"
  },
  {
    id: "admin-blue",
    label: "Admin Blue",
    minStatus: "bronze",
    adminOnly: true,
    className: "bp-frame-admin-blue",
    previewClassName: "from-[#06111f] via-[#163a68] to-[#5d93d8]"
  }
];

const legacyFrameMap: Record<string, AvatarFrameId> = {
  bronze: "bronze-root",
  "bronze-iron": "bronze-blade",
  "bronze-spikes": "bronze-blade",
  silver: "silver-thorn",
  "silver-moon": "silver-ice",
  "silver-guard": "silver-thorn",
  gold: "gold-crown",
  "gold-royal": "gold-crown",
  ember: "gold-dragon",
  platinum: "platinum-crystal",
  void: "platinum-void"
};

export const nicknameStyles: Array<Unlockable & { id: NicknameStyleId; label: string; className: string }> = [
  {
    id: "plain",
    label: "Telegram Rose",
    minStatus: "bronze",
    className: "text-[#d9689f]"
  },
  {
    id: "violet",
    label: "Violet",
    minStatus: "bronze",
    className: "text-violet-300"
  },
  {
    id: "purple",
    label: "Purple",
    minStatus: "bronze",
    className: "text-purple-300"
  },
  {
    id: "fuchsia",
    label: "Fuchsia",
    minStatus: "bronze",
    className: "text-fuchsia-300"
  },
  {
    id: "blue",
    label: "Blue",
    minStatus: "bronze",
    className: "text-blue-300"
  },
  {
    id: "cyan",
    label: "Cyan",
    minStatus: "bronze",
    className: "text-cyan-300"
  },
  {
    id: "emerald",
    label: "Emerald",
    minStatus: "bronze",
    className: "text-emerald-300"
  },
  {
    id: "amber",
    label: "Amber",
    minStatus: "bronze",
    className: "text-amber-300"
  },
  {
    id: "orange",
    label: "Orange",
    minStatus: "bronze",
    className: "text-orange-300"
  },
  {
    id: "crimson",
    label: "Crimson",
    minStatus: "bronze",
    className: "text-rose-300"
  },
  {
    id: "relic",
    label: "Relic Gold",
    minStatus: "silver",
    className: "text-relic drop-shadow-[0_0_12px_rgba(99,166,255,0.34)]"
  },
  {
    id: "ember",
    label: "Ember",
    minStatus: "gold",
    className: "text-[#ff9b54] drop-shadow-[0_0_12px_rgba(255,122,47,0.38)]"
  },
  {
    id: "rgb",
    label: "RGB Glow",
    minStatus: "gold",
    className: "bp-nick-rgb"
  }
];

function canUse(minStatus: BpStatusId, statusId: BpStatusId) {
  return statusRank[statusId] >= statusRank[minStatus];
}

export function getAvailableAvatarFrames(statusId: BpStatusId, isAdmin = false) {
  return avatarFrames.filter((frame) => canUse(frame.minStatus, statusId) && (!frame.adminOnly || isAdmin));
}

export function getAvailableNicknameStyles(statusId: BpStatusId) {
  return nicknameStyles.filter((style) => canUse(style.minStatus, statusId));
}

export function normalizeAvatarFrame(frameId: string | undefined, statusId: BpStatusId, isAdmin = false): AvatarFrameId {
  const mappedFrameId = frameId ? legacyFrameMap[frameId] ?? frameId : frameId;
  const available = getAvailableAvatarFrames(statusId, isAdmin);
  return (available.find((frame) => frame.id === mappedFrameId)?.id ?? "none") as AvatarFrameId;
}

export function normalizeNicknameStyle(styleId: string | undefined, statusId: BpStatusId): NicknameStyleId {
  const available = getAvailableNicknameStyles(statusId);
  return (available.find((style) => style.id === styleId)?.id ?? available[0].id) as NicknameStyleId;
}

export function getAvatarFrameClass(frameId: string | undefined, statusId: BpStatusId) {
  const mappedFrameId = frameId ? legacyFrameMap[frameId] ?? frameId : frameId;
  const direct = avatarFrames.find((frame) => frame.id === mappedFrameId);
  const normalized = normalizeAvatarFrame(mappedFrameId, statusId);
  return direct?.className ?? avatarFrames.find((frame) => frame.id === normalized)?.className ?? "bp-frame-none";
}

export function getNicknameClass(styleId: string | undefined, statusId: BpStatusId) {
  const normalized = normalizeNicknameStyle(styleId, statusId);
  return nicknameStyles.find((style) => style.id === normalized)?.className ?? nicknameStyles[0].className;
}
