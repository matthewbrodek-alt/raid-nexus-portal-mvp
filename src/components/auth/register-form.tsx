"use client";

import Link from "next/link";
import { createUserWithEmailAndPassword, signOut, updateProfile } from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase/client";
import { normalizeEmail } from "@/lib/auth/role-utils";
import { sendPortalEmailVerification } from "@/lib/auth/email-verification";
import type { UserProfile } from "@/lib/auth/types";
import { collections } from "@/lib/firebase/collections";
import { makeReferralCode, normalizeReferralCode } from "@/lib/referrals";
import { GlassPanel } from "@/components/ui/glass-panel";
import { LegalConsentCheckbox } from "@/components/legal/legal-consent-checkbox";

export function RegisterForm() {
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [error, setError] = useState("");
  const [legalConsent, setLegalConsent] = useState(false);
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const code = normalizeReferralCode(new URLSearchParams(window.location.search).get("ref"));

    if (code) {
      setReferralCode(code);
    }
  }, []);

  async function createUserProfile(uid: string, userEmail: string, userDisplayName: string) {
    const normalizedEmail = normalizeEmail(userEmail);
    const ownReferralCode = makeReferralCode(userDisplayName, uid);
    const invitedByCode = normalizeReferralCode(referralCode);
    let referredByUid = "";

    if (invitedByCode) {
      const referralSnapshot = await getDoc(doc(db, collections.referralCodes, invitedByCode)).catch(() => null);
      const referralData = referralSnapshot?.exists() ? (referralSnapshot.data() as { ownerUid?: string }) : null;

      if (referralData?.ownerUid && referralData.ownerUid !== uid) {
        referredByUid = referralData.ownerUid;
      }
    }

    const profile: UserProfile = {
      uid,
      email: normalizedEmail,
      displayName: userDisplayName,
      avatarPreset: "raid-logo",
      avatarFrame: "none",
      avatarHiddenByAdmin: false,
      nicknameStyle: "plain",
      bpStatus: "bronze",
      totalSpentRub: 0,
      referralCode: ownReferralCode,
      referredByCode: referredByUid ? invitedByCode : "",
      referredByUid,
      bumpyCoinsBalance: 0,
      bumpyCoinsEarnedTotal: 0,
      bumpyCoinsSpentTotal: 0,
      theme: "dark",
      role: "user",
      status: "active"
    };

    await setDoc(
      doc(db, collections.users, uid),
      {
        ...profile,
        activityStats: {
          forumThreadsCount: 0,
          marketplaceViewsCount: 0,
          messagesCount: 0,
          topupRequestsCount: 0
        },
        interests: [],
        legalConsents: {
          consentVersion: "2026-06-17",
          personalDataConsentAt: serverTimestamp(),
          privacyAcceptedAt: serverTimestamp(),
          termsAcceptedAt: serverTimestamp()
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      },
      { merge: true }
    );

    await setDoc(
      doc(db, collections.referralCodes, ownReferralCode),
      {
        code: ownReferralCode,
        ownerUid: uid,
        ownerEmail: normalizedEmail,
        ownerDisplayName: userDisplayName,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      },
      { merge: true }
    );
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setNotice("");

    if (!legalConsent) {
      setError("Для регистрации нужно принять соглашение и дать согласие на обработку персональных данных.");
      return;
    }

    setLoading(true);

    try {
      const credential = await createUserWithEmailAndPassword(auth, normalizeEmail(email), password);
      await updateProfile(credential.user, { displayName });
      await createUserProfile(credential.user.uid, credential.user.email ?? email, displayName);
      await sendPortalEmailVerification(credential.user);
      await signOut(auth);
      setNotice("Аккаунт создан. Мы отправили письмо для подтверждения email. Подтвердите почту и затем войдите.");
      setDisplayName("");
      setEmail("");
      setPassword("");
      setLegalConsent(false);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Не удалось зарегистрироваться.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <GlassPanel className="w-full p-5 sm:p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm text-zinc-300">Имя на портале</span>
            <input
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              className="w-full rounded-md border-white/10 bg-black/30 text-white focus:border-relic focus:ring-relic"
              autoComplete="name"
              required
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm text-zinc-300">Email</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-md border-white/10 bg-black/30 text-white focus:border-relic focus:ring-relic"
              autoComplete="email"
              required
            />
          </label>
        </div>
        <label className="space-y-2">
          <span className="text-sm text-zinc-300">Пароль</span>
          <input
            type="password"
            minLength={6}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-md border-white/10 bg-black/30 text-white focus:border-relic focus:ring-relic"
            autoComplete="new-password"
            required
          />
        </label>

        <label className="space-y-2">
          <span className="text-sm text-zinc-300">Referral code</span>
          <input
            value={referralCode}
            onChange={(event) => setReferralCode(normalizeReferralCode(event.target.value))}
            className="w-full rounded-md border-white/10 bg-black/30 text-white placeholder:text-zinc-500 focus:border-relic focus:ring-relic"
            placeholder="BP-PLAYER-123ABC"
          />
          <span className="block text-xs text-zinc-500">Если игрок пришел по реферальной ссылке, код подставится автоматически.</span>
        </label>

        <LegalConsentCheckbox checked={legalConsent} kind="registration" onChange={setLegalConsent} />

        {notice ? <p className="rounded-md border border-relic/30 bg-relic/10 p-3 text-sm text-relic">{notice}</p> : null}
        {error ? <p className="rounded-md border border-ember/30 bg-ember/10 p-3 text-sm text-ember">{error}</p> : null}
        <button
          type="submit"
          disabled={loading || !legalConsent}
          className="w-full rounded-md bg-relic px-4 py-3 text-sm font-black text-abyss transition hover:bg-relic/90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Создаем аккаунт..." : "Зарегистрироваться"}
        </button>
      </form>
      <p className="mt-5 text-sm text-zinc-400">
        Уже есть аккаунт?{" "}
        <Link href="/login" className="font-semibold text-relic">
          Войти
        </Link>
      </p>
    </GlassPanel>
  );
}
