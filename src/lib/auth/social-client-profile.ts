"use client";

import type { User } from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { collections } from "@/lib/firebase/collections";
import { db } from "@/lib/firebase/client";
import { makeReferralCode } from "@/lib/referrals";
import { makeSocialEmailFallback, type SocialProfileSeed } from "@/lib/auth/social-providers";
import type { UserProfile } from "@/lib/auth/types";

export async function upsertSocialUserProfile(user: User, seed: SocialProfileSeed) {
  const userRef = doc(db, collections.users, user.uid);
  const snapshot = await getDoc(userRef).catch(() => null);
  const existing = snapshot?.exists() ? (snapshot.data() as UserProfile) : null;
  const displayName = existing?.displayName || seed.displayName || user.displayName || "Raid Player";
  const email = existing?.email || seed.email || user.email || makeSocialEmailFallback(seed.provider, seed.providerUserId);
  const referralCode = existing?.referralCode || makeReferralCode(displayName, user.uid);

  await setDoc(
    userRef,
    {
      uid: user.uid,
      email,
      displayName,
      avatarUrl: existing?.avatarUrl || seed.avatarUrl || user.photoURL || "",
      avatarPreset: existing?.avatarPreset ?? "raid-logo",
      avatarFrame: existing?.avatarFrame ?? "none",
      avatarHiddenByAdmin: existing?.avatarHiddenByAdmin ?? false,
      nicknameStyle: existing?.nicknameStyle ?? "plain",
      bpStatus: existing?.bpStatus ?? "bronze",
      totalSpentRub: existing?.totalSpentRub ?? 0,
      referralCode,
      bumpyCoinsBalance: existing?.bumpyCoinsBalance ?? 0,
      bumpyCoinsEarnedTotal: existing?.bumpyCoinsEarnedTotal ?? 0,
      bumpyCoinsSpentTotal: existing?.bumpyCoinsSpentTotal ?? 0,
      theme: existing?.theme ?? "dark",
      role: existing?.role ?? "user",
      status: existing?.status ?? "active",
      socialAuth: {
        ...(existing as UserProfile & { socialAuth?: Record<string, unknown> } | null)?.socialAuth,
        [seed.provider]: {
          avatarUrl: seed.avatarUrl || "",
          connectedAt: new Date().toISOString(),
          displayName: seed.displayName,
          email: seed.email || "",
          providerUserId: seed.providerUserId,
          username: seed.username || ""
        }
      },
      activityStats: existing?.activityStats ?? {
        forumThreadsCount: 0,
        marketplaceViewsCount: 0,
        messagesCount: 0,
        topupRequestsCount: 0
      },
      updatedAt: serverTimestamp(),
      ...(existing ? {} : { createdAt: serverTimestamp(), interests: [] })
    },
    { merge: true }
  );

  await setDoc(
    doc(db, collections.referralCodes, referralCode),
    {
      code: referralCode,
      ownerUid: user.uid,
      ownerEmail: email,
      ownerDisplayName: displayName,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    },
    { merge: true }
  ).catch(() => undefined);
}
