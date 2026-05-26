export const REFERRAL_REWARD_RATE = 0.02;

export function normalizeReferralCode(value?: string | null) {
  return (value ?? "")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9-]/g, "")
    .slice(0, 32);
}

export function makeReferralCode(displayName: string, uid: string) {
  const namePart =
    normalizeReferralCode(displayName)
      .replaceAll("-", "")
      .slice(0, 8) || "PLAYER";
  const uidPart = normalizeReferralCode(uid).slice(0, 6);

  return `BP-${namePart}-${uidPart}`;
}

export function makeReferralLink(origin: string, code?: string) {
  const normalizedCode = normalizeReferralCode(code);

  if (!origin || !normalizedCode) {
    return "";
  }

  return `${origin.replace(/\/$/, "")}/register?ref=${encodeURIComponent(normalizedCode)}`;
}

export function calculateReferralReward(amountRub: number) {
  if (!Number.isFinite(amountRub) || amountRub <= 0) {
    return 0;
  }

  return Math.floor(amountRub * REFERRAL_REWARD_RATE);
}
