"use client";

import { Eye, EyeOff, MailPlus, ShieldCheck } from "lucide-react";
import { collection, doc, getDocs, serverTimestamp, setDoc, updateDoc } from "firebase/firestore";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { GlassPanel } from "@/components/ui/glass-panel";
import { emailToDocId, normalizeEmail } from "@/lib/auth/role-utils";
import type { UserProfile } from "@/lib/auth/types";
import { db } from "@/lib/firebase/client";
import { collections } from "@/lib/firebase/collections";

type AdminInvite = {
  email: string;
  status: string;
};

function userLabel(user: UserProfile) {
  return user.displayName || user.email || user.uid;
}

export function AdminUserManagement() {
  const { profile, refreshProfile } = useAuth();
  const [email, setEmail] = useState("");
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [admins, setAdmins] = useState<UserProfile[]>([]);
  const [invites, setInvites] = useState<AdminInvite[]>([]);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const isOwner = profile?.role === "owner";
  const isAdmin = profile?.role === "admin" || profile?.role === "owner";

  const loadUsersAndInvites = useCallback(async () => {
    const usersSnapshot = await getDocs(collection(db, collections.users));
    const nextUsers = usersSnapshot.docs
      .map((item) => item.data() as UserProfile)
      .sort((a, b) => userLabel(a).localeCompare(userLabel(b)));

    setUsers(nextUsers);
    setAdmins(nextUsers.filter((item) => item.role === "admin" || item.role === "owner").sort((a, b) => a.email.localeCompare(b.email)));

    if (isOwner) {
      const invitesSnapshot = await getDocs(collection(db, collections.adminInvites));
      setInvites(invitesSnapshot.docs.map((item) => item.data() as AdminInvite));
    } else {
      setInvites([]);
    }
  }, [isOwner]);

  useEffect(() => {
    if (isAdmin) {
      void loadUsersAndInvites();
    }
  }, [isAdmin, loadUsersAndInvites]);

  async function handleInvite(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!profile || !isOwner) {
      return;
    }

    const normalizedEmail = normalizeEmail(email);
    if (!normalizedEmail) {
      return;
    }

    setLoading(true);
    setStatus("");

    try {
      await setDoc(doc(db, collections.adminInvites, emailToDocId(normalizedEmail)), {
        createdAt: serverTimestamp(),
        createdBy: profile.uid,
        email: normalizedEmail,
        role: "admin",
        status: "pending",
        updatedAt: serverTimestamp()
      });
      setEmail("");
      setStatus(`Приглашение администратора создано для ${normalizedEmail}. После входа этот email получит роль admin.`);
      await loadUsersAndInvites();
      await refreshProfile();
    } catch (caughtError) {
      setStatus(caughtError instanceof Error ? caughtError.message : "Не удалось создать приглашение.");
    } finally {
      setLoading(false);
    }
  }

  async function toggleAvatarVisibility(target: UserProfile) {
    if (!isAdmin) {
      return;
    }

    const nextHidden = !target.avatarHiddenByAdmin;
    setStatus("");

    try {
      await updateDoc(doc(db, collections.users, target.uid), {
        avatarHiddenByAdmin: nextHidden,
        updatedAt: serverTimestamp()
      });
      setStatus(nextHidden ? `Аватар пользователя ${userLabel(target)} скрыт от остальных.` : `Аватар пользователя ${userLabel(target)} снова отображается.`);
      await loadUsersAndInvites();
    } catch (caughtError) {
      setStatus(caughtError instanceof Error ? caughtError.message : "Не удалось изменить видимость аватара.");
    }
  }

  return (
    <GlassPanel className="p-6">
      <div className="mb-5 flex items-center gap-3">
        <ShieldCheck className="text-relic" />
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-relic">Access control</p>
          <h2 className="text-2xl font-bold text-white">Администраторы и пользователи</h2>
        </div>
      </div>

      {isOwner ? (
        <form onSubmit={handleInvite} className="grid gap-3 md:grid-cols-[1fr_auto]">
          <label className="space-y-2">
            <span className="text-sm text-zinc-300">Email нового администратора</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="admin@example.com"
              className="w-full rounded-md border-white/10 bg-black/30 text-white placeholder:text-zinc-500 focus:border-relic focus:ring-relic"
              required
            />
          </label>
          <button
            type="submit"
            disabled={loading}
            className="mt-auto inline-flex items-center justify-center gap-2 rounded-md bg-relic px-4 py-3 text-sm font-black text-abyss disabled:cursor-not-allowed disabled:opacity-60"
          >
            <MailPlus size={16} />
            Добавить админа
          </button>
        </form>
      ) : (
        <p className="rounded-lg border border-white/10 bg-white/[0.035] p-4 text-sm leading-6 text-zinc-400">
          Вы администратор. Добавлять новых администраторов может только владелец портала с ролью `owner`.
        </p>
      )}

      {status ? <p className="mt-4 rounded-lg border border-relic/20 bg-relic/[0.08] p-3 text-sm text-zinc-300">{status}</p> : null}

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div>
          <h3 className="font-semibold text-white">Активные роли</h3>
          <div className="mt-3 space-y-2">
            {admins.map((admin) => (
              <div key={admin.uid} className="flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-black/25 p-3">
                <span className="text-sm text-zinc-300">{admin.email}</span>
                <span className="rounded-full border border-relic/30 px-2 py-1 text-xs uppercase text-relic">{admin.role}</span>
              </div>
            ))}
            {admins.length === 0 ? <p className="text-sm text-zinc-500">Активных админов пока нет.</p> : null}
          </div>
        </div>
        <div>
          <h3 className="font-semibold text-white">Приглашения</h3>
          <div className="mt-3 space-y-2">
            {invites.map((invite) => (
              <div key={invite.email} className="flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-black/25 p-3">
                <span className="text-sm text-zinc-300">{invite.email}</span>
                <span className="rounded-full border border-ember/30 px-2 py-1 text-xs uppercase text-ember">{invite.status}</span>
              </div>
            ))}
            {invites.length === 0 ? <p className="text-sm text-zinc-500">Приглашений пока нет.</p> : null}
          </div>
        </div>
      </div>

      <div className="mt-8">
        <h3 className="font-semibold text-white">Аватары пользователей</h3>
        <p className="mt-1 text-sm text-zinc-500">Админ может скрыть аватар пользователя от остальных участников. Сам пользователь увидит статус в личном кабинете.</p>
        <div className="mt-4 max-h-[420px] space-y-2 overflow-y-auto pr-1">
          {users.map((item) => {
            const hidden = Boolean(item.avatarHiddenByAdmin);

            return (
              <div key={item.uid} className="flex flex-col gap-3 rounded-lg border border-white/10 bg-black/25 p-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-xl border border-relic/20 bg-relic/10 text-xs font-black text-relic">
                    {!hidden && item.avatarUrl ? <img src={item.avatarUrl} alt={userLabel(item)} className="h-full w-full object-cover" /> : userLabel(item).slice(0, 2).toUpperCase()}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold text-white">{userLabel(item)}</span>
                    <span className="block truncate text-xs text-zinc-500">{item.email}</span>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => void toggleAvatarVisibility(item)}
                  className={`inline-flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold transition ${
                    hidden ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-200" : "border-blood/35 bg-blood/10 text-red-200"
                  }`}
                >
                  {hidden ? <Eye size={16} /> : <EyeOff size={16} />}
                  {hidden ? "Показать аватар" : "Скрыть аватар"}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </GlassPanel>
  );
}
