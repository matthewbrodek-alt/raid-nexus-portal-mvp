"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Radio, Send, ShieldCheck } from "lucide-react";
import { addDoc, collection, doc, getDocs, limit, query, serverTimestamp, setDoc, where } from "firebase/firestore";
import { type FormEvent, useState } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { LegalConsentCheckbox } from "@/components/legal/legal-consent-checkbox";
import { db } from "@/lib/firebase/client";
import { collections } from "@/lib/firebase/collections";
import { useLanguage } from "@/lib/i18n/use-language";

type ManagerCandidate = {
  uid: string;
  displayName?: string;
  email?: string;
};

function directThreadId(firstUid: string, secondUid: string) {
  return [firstUid, secondUid].sort().join("__");
}

async function findManager(): Promise<ManagerCandidate | null> {
  const ownerQuery = query(collection(db, collections.users), where("role", "==", "owner"), limit(1));
  const adminQuery = query(collection(db, collections.users), where("role", "==", "admin"), limit(1));
  const [ownerSnapshot, adminSnapshot] = await Promise.all([getDocs(ownerQuery), getDocs(adminQuery)]);
  const managerDoc = ownerSnapshot.docs[0] ?? adminSnapshot.docs[0];

  if (!managerDoc) {
    return null;
  }

  const data = managerDoc.data() as Omit<ManagerCandidate, "uid">;

  return {
    uid: managerDoc.id,
    displayName: data.displayName,
    email: data.email
  };
}

export function HomeStreamHelpRequest() {
  const router = useRouter();
  const { language } = useLanguage();
  const { profile, user } = useAuth();
  const isRu = language === "ru";
  const [gameData, setGameData] = useState("");
  const [problemZones, setProblemZones] = useState("");
  const [legalConsent, setLegalConsent] = useState(false);
  const [status, setStatus] = useState<"idle" | "sending" | "error">("idle");

  async function submitRequest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!user?.uid || !legalConsent || status === "sending") {
      setStatus("error");
      return;
    }

    setStatus("sending");

    try {
      const manager = await findManager();
      const leadRef = doc(collection(db, collections.topupLeads));
      const threadId = manager ? directThreadId(user.uid, manager.uid) : "";
      const clientName = profile?.displayName || user.email || "Raid Player";
      const comment = [
        "Бесплатная помощь на трансляции.",
        "",
        "Данные для входа:",
        gameData.trim() || "-",
        "",
        "Проблемные игровые зоны:",
        problemZones.trim() || "-"
      ].join("\n");

      await setDoc(leadRef, {
        uid: user.uid,
        email: user.email ?? "",
        clientName,
        leadId: leadRef.id,
        managerUid: manager?.uid ?? "",
        threadId,
        telegram: clientName,
        packageId: "stream-help",
        packageName: "Бесплатная помощь на трансляции",
        baseAmountRub: 0,
        amountRub: 0,
        paymentMethod: "manager",
        comment,
        serviceType: "game_help",
        status: "new",
        source: "stream_help",
        legalConsentAcceptedAt: serverTimestamp(),
        legalConsentVersion: "2026-06-17",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      if (manager) {
        await setDoc(
          doc(db, "directThreads", threadId),
          {
            participants: [user.uid, manager.uid],
            topupLeadIds: [leadRef.id],
            lastMessageText: "Заявка на помощь на трансляции",
            lastMessageUid: user.uid,
            lastMessageAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          },
          { merge: true }
        );

        await addDoc(collection(db, "directThreads", threadId, "messages"), {
          uid: user.uid,
          displayName: clientName,
          text: comment,
          topupLeadId: leadRef.id,
          createdAt: serverTimestamp()
        });
      }

      router.push(`/orders/${leadRef.id}`);
    } catch {
      setStatus("error");
    }
  }

  return (
    <section className="mt-5 overflow-hidden rounded-[24px] border border-relic/18 bg-[#050b12]/78 p-5 shadow-[0_22px_70px_rgba(0,0,0,0.28)] backdrop-blur-md sm:p-6">
      <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
        <div>
          <p className="text-xs font-bold tracking-[0.18em] text-relic">{isRu ? "Помощь на трансляции" : "Stream help"}</p>
          <h2 className="mt-2 text-2xl font-black text-white sm:text-3xl">
            {isRu ? "Бесплатный разбор аккаунта в эфире" : "Free live account review"}
          </h2>
          <p className="mt-3 text-sm font-semibold leading-7 text-zinc-300">
            {isRu
              ? "Оставьте заявку на бесплатную помощь: напишите данные для входа, укажите проблемные игровые зоны и приходите на трансляции ежедневно с 21:00 до 24:00 (МСК)."
              : "Send a free help request: provide login details, describe problem zones and join daily streams from 21:00 to 24:00 Moscow time."}
          </p>
          <div className="mt-4 grid gap-2 text-sm text-zinc-400 sm:grid-cols-3">
            <span className="rounded-2xl border border-relic/16 bg-black/24 p-3">
              <Radio className="mb-2 text-relic" size={18} />
              {isRu ? "Ежедневный эфир" : "Daily stream"}
            </span>
            <span className="rounded-2xl border border-relic/16 bg-black/24 p-3">
              <ShieldCheck className="mb-2 text-relic" size={18} />
              {isRu ? "Заявка в панели" : "Admin request"}
            </span>
            <span className="rounded-2xl border border-relic/16 bg-black/24 p-3">
              <Send className="mb-2 text-relic" size={18} />
              {isRu ? "Диалог с менеджером" : "Manager dialog"}
            </span>
          </div>
        </div>

        {user ? (
          <form onSubmit={submitRequest} className="rounded-[22px] border border-white/10 bg-black/26 p-4">
            <label className="block">
              <span className="text-xs font-bold tracking-[0.14em] text-relic">{isRu ? "Данные для входа" : "Login details"}</span>
              <textarea
                value={gameData}
                onChange={(event) => setGameData(event.target.value)}
                rows={3}
                className="mt-2 w-full rounded-2xl border-white/10 bg-black/36 text-white placeholder:text-zinc-600 focus:border-relic focus:ring-relic"
                placeholder={isRu ? "Логин, пароль, сервер или удобный способ связи" : "Login, password, server or contact method"}
              />
            </label>
            <label className="mt-3 block">
              <span className="text-xs font-bold tracking-[0.14em] text-relic">{isRu ? "Что разобрать" : "What to review"}</span>
              <textarea
                value={problemZones}
                onChange={(event) => setProblemZones(event.target.value)}
                rows={3}
                className="mt-2 w-full rounded-2xl border-white/10 bg-black/36 text-white placeholder:text-zinc-600 focus:border-relic focus:ring-relic"
                placeholder={isRu ? "Арена, гидра, клан-босс, сборки, прогресс миссий..." : "Arena, Hydra, Clan Boss, builds, missions..."}
              />
            </label>
            <div className="mt-3">
              <LegalConsentCheckbox checked={legalConsent} kind="request" onChange={setLegalConsent} />
            </div>
            <button
              type="submit"
              disabled={status === "sending" || !legalConsent}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#2f7cff] px-4 py-3 text-sm font-black text-white transition hover:bg-[#63a6ff] disabled:cursor-not-allowed disabled:opacity-55"
            >
              <Send size={17} />
              {status === "sending" ? (isRu ? "Создаем заявку..." : "Creating request...") : isRu ? "Оставить заявку" : "Send request"}
            </button>
            {status === "error" ? (
              <p className="mt-3 rounded-xl border border-red-400/30 bg-red-500/10 p-3 text-sm font-semibold text-red-200">
                {isRu ? "Проверьте вход в аккаунт и согласие на обработку данных." : "Check sign-in and data consent."}
              </p>
            ) : null}
          </form>
        ) : (
          <div className="rounded-[22px] border border-relic/20 bg-black/28 p-5">
            <p className="text-sm font-semibold leading-7 text-zinc-300">
              {isRu ? "Чтобы заявка сохранилась и появилась у менеджера, нужно войти в аккаунт." : "Sign in so the request is saved and visible to a manager."}
            </p>
            <Link
              href="/login"
              className="mt-4 inline-flex rounded-2xl bg-[#2f7cff] px-5 py-3 text-sm font-black text-white transition hover:bg-[#63a6ff]"
            >
              {isRu ? "Войти" : "Sign in"}
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
