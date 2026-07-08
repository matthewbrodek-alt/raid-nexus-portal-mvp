"use client";

import type { User } from "firebase/auth";
import { onAuthStateChanged, signOut as firebaseSignOut } from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc, updateDoc } from "firebase/firestore";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { auth, db } from "@/lib/firebase/client";
import { collections } from "@/lib/firebase/collections";
import { emailToDocId, normalizeEmail } from "@/lib/auth/role-utils";
import type { UserProfile, UserRole } from "@/lib/auth/types";
import { makeReferralCode } from "@/lib/referrals";

type AuthContextValue = {
  loading: boolean;
  profile: UserProfile | null;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
  user: User | null;
};

const AuthContext = createContext<AuthContextValue | null>(null);

async function loadOrCreateProfile(user: User): Promise<UserProfile> {
  const userRef = doc(db, collections.users, user.uid);
  const existingProfile = await getDoc(userRef);
  const authEmail = normalizeEmail(user.email);
  const displayName = user.displayName || authEmail.split("@")[0] || "Raid Player";
  const invitedAdminRef = doc(db, collections.adminInvites, emailToDocId(authEmail));
  const invitedAdmin = authEmail ? await getDoc(invitedAdminRef) : null;

  if (existingProfile.exists()) {
    const profile = existingProfile.data() as UserProfile;
    const email = authEmail || normalizeEmail(profile.email);
    let nextRole = profile.role;
    const savedDisplayName = profile.displayName || displayName;
    const referralCode = profile.referralCode || makeReferralCode(savedDisplayName, user.uid);

    if (profile.role === "user" && invitedAdmin?.exists() && invitedAdmin.data().status === "pending") {
      nextRole = "admin";
    }

    await setDoc(
      userRef,
      {
        email,
        displayName: savedDisplayName,
        role: nextRole,
        status: profile.status ?? "active",
        referralCode,
        bumpyCoinsBalance: profile.bumpyCoinsBalance ?? 0,
        bumpyCoinsEarnedTotal: profile.bumpyCoinsEarnedTotal ?? 0,
        bumpyCoinsSpentTotal: profile.bumpyCoinsSpentTotal ?? 0,
        theme: profile.theme ?? "dark",
        updatedAt: serverTimestamp()
      },
      { merge: true }
    );

    if (!profile.referralCode) {
      await setDoc(
        doc(db, collections.referralCodes, referralCode),
        {
          code: referralCode,
          ownerUid: user.uid,
          ownerEmail: email,
          ownerDisplayName: savedDisplayName,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        },
        { merge: true }
      ).catch(() => undefined);
    }

    if (nextRole === "admin" && invitedAdmin?.exists()) {
      await updateDoc(invitedAdminRef, {
        acceptedAt: serverTimestamp(),
        acceptedBy: user.uid,
        status: "accepted"
      }).catch(() => undefined);
    }

    return {
      ...profile,
      uid: user.uid,
      email,
      displayName: savedDisplayName,
      role: nextRole,
      status: profile.status ?? "active",
      referralCode,
      bumpyCoinsBalance: profile.bumpyCoinsBalance ?? 0,
      bumpyCoinsEarnedTotal: profile.bumpyCoinsEarnedTotal ?? 0,
      bumpyCoinsSpentTotal: profile.bumpyCoinsSpentTotal ?? 0,
      theme: profile.theme ?? "dark"
    };
  }

  const email = authEmail || `${user.uid}@social.bumpypay.local`.toLowerCase();
  const role: UserRole = invitedAdmin?.exists() && invitedAdmin.data().status === "pending" ? "admin" : "user";
  const referralCode = makeReferralCode(displayName, user.uid);
  const profile: UserProfile = {
    uid: user.uid,
    email,
    displayName,
    avatarPreset: "raid-logo",
    avatarFrame: "none",
    avatarHiddenByAdmin: false,
    nicknameStyle: "plain",
    bpStatus: "bronze",
    totalSpentRub: 0,
    referralCode,
    bumpyCoinsBalance: 0,
    bumpyCoinsEarnedTotal: 0,
    bumpyCoinsSpentTotal: 0,
    theme: "dark",
    role,
    status: "active"
  };

  await setDoc(userRef, {
    ...profile,
    activityStats: {
      forumThreadsCount: 0,
      marketplaceViewsCount: 0,
      messagesCount: 0,
      topupRequestsCount: 0
    },
    interests: [],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });

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

  if (role === "admin" && invitedAdmin?.exists()) {
    await updateDoc(invitedAdminRef, {
      acceptedAt: serverTimestamp(),
      acceptedBy: user.uid,
      status: "accepted"
    }).catch(() => undefined);
  }

  return profile;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshProfile = useCallback(async () => {
    const currentUser = auth.currentUser;

    if (!currentUser) {
      setProfile(null);
      return;
    }

    const nextProfile = await loadOrCreateProfile(currentUser);
    setProfile(nextProfile);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (nextUser) => {
      setLoading(true);
      setUser(nextUser);

      try {
        if (nextUser) {
          setProfile(await loadOrCreateProfile(nextUser));
        } else {
          setProfile(null);
        }
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      loading,
      profile,
      refreshProfile,
      signOut: () => firebaseSignOut(auth),
      user
    }),
    [loading, profile, refreshProfile, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
