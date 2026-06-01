import type { BpStatusId } from "@/lib/bp-status";

export type AvatarFrameId = "none" | "bronze" | "silver" | "gold" | "platinum" | "ember" | "void" | "rgb" | "admin-blue";
export type NicknameStyleId = "plain" | "relic" | "ember" | "rgb";

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
    id: "bronze",
    label: "Bronze",
    minStatus: "bronze",
    className: "bp-frame-bronze",
    previewClassName: "from-[#3b2417] via-[#a97142] to-[#f1b37a]"
  },
  {
    id: "silver",
    label: "Silver",
    minStatus: "silver",
    className: "bp-frame-silver",
    previewClassName: "from-[#5d6670] via-[#cfd8e3] to-[#ffffff]"
  },
  {
    id: "gold",
    label: "Gold",
    minStatus: "gold",
    className: "bp-frame-gold",
    previewClassName: "from-[#704611] via-[#e7c16a] to-[#fff0a8]"
  },
  {
    id: "ember",
    label: "Ember",
    minStatus: "gold",
    className: "bp-frame-ember",
    previewClassName: "from-[#42110a] via-[#ff7a2f] to-[#ffd28b]"
  },
  {
    id: "platinum",
    label: "Platinum",
    minStatus: "platinum",
    className: "bp-frame-platinum",
    previewClassName: "from-[#1d3f55] via-[#9ee7ff] to-[#ffffff]"
  },
  {
    id: "void",
    label: "Void",
    minStatus: "platinum",
    className: "bp-frame-void",
    previewClassName: "from-[#1b102d] via-[#7c3aed] to-[#d8b4fe]"
  },
  {
    id: "rgb",
    label: "RGB",
    minStatus: "gold",
    className: "bp-frame-rgb bp-avatar-rgb",
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

export const nicknameStyles: Array<Unlockable & { id: NicknameStyleId; label: string; className: string }> = [
  {
    id: "plain",
    label: "Classic",
    minStatus: "bronze",
    className: "text-white"
  },
  {
    id: "relic",
    label: "Relic Gold",
    minStatus: "silver",
    className: "text-relic drop-shadow-[0_0_12px_rgba(231,193,106,0.34)]"
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
  const available = getAvailableAvatarFrames(statusId, isAdmin);
  return (available.find((frame) => frame.id === frameId)?.id ?? "none") as AvatarFrameId;
}

export function normalizeNicknameStyle(styleId: string | undefined, statusId: BpStatusId): NicknameStyleId {
  const available = getAvailableNicknameStyles(statusId);
  return (available.find((style) => style.id === styleId)?.id ?? available[0].id) as NicknameStyleId;
}

export function getAvatarFrameClass(frameId: string | undefined, statusId: BpStatusId) {
  const direct = avatarFrames.find((frame) => frame.id === frameId);
  const normalized = normalizeAvatarFrame(frameId, statusId);
  return direct?.className ?? avatarFrames.find((frame) => frame.id === normalized)?.className ?? "bp-frame-none";
}

export function getNicknameClass(styleId: string | undefined, statusId: BpStatusId) {
  const normalized = normalizeNicknameStyle(styleId, statusId);
  return nicknameStyles.find((style) => style.id === normalized)?.className ?? nicknameStyles[0].className;
}
