"use client";

import Link from "next/link";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  where
} from "firebase/firestore";
import { Crown, History, MessageCircle, Megaphone, Pin, RotateCcw, Save, Send, Shield, Trash2, UserMinus, UserPlus, Users, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { GlassPanel } from "@/components/ui/glass-panel";
import { db } from "@/lib/firebase/client";
import { collections } from "@/lib/firebase/collections";

type FirestoreStamp = {
  seconds?: number;
};

type ClanAnnouncement = {
  id: string;
  uid?: string;
  authorName?: string;
  title?: string;
  text?: string;
  status?: "active" | "deleted" | "moderated";
  createdAt?: FirestoreStamp;
  updatedAt?: FirestoreStamp;
  expiresAt?: FirestoreStamp;
  archivedAt?: FirestoreStamp;
};

type GroupMember = {
  uid: string;
  displayName: string;
  avatarUrl?: string;
  bpStatus?: string;
  role?: string;
};

type DirectoryUser = {
  uid: string;
  displayName?: string;
  avatarUrl?: string;
  avatarHiddenByAdmin?: boolean;
  bpStatus?: string;
  role?: string;
  status?: string;
};

type UserGroup = {
  id: string;
  ownerUid?: string;
  ownerName?: string;
  ownerAvatarUrl?: string;
  ownerBpStatus?: string;
  title?: string;
  description?: string;
  requirements?: string;
  contact?: string;
  activity?: string;
  pinnedMessage?: string;
  members?: GroupMember[];
  memberUids?: string[];
  excludedUids?: string[];
  tags?: string[];
  createdAt?: FirestoreStamp;
  updatedAt?: FirestoreStamp;
};

function formatDate(item: { createdAt?: FirestoreStamp; updatedAt?: FirestoreStamp }) {
  const seconds = item.updatedAt?.seconds ?? item.createdAt?.seconds;

  if (!seconds) {
    return "только что";
  }

  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(seconds * 1000));
}

function parseTags(value: string) {
  return value
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean)
    .slice(0, 8);
}

function bpLabel(status?: string) {
  if (status === "platinum") return "Platinum BP";
  if (status === "gold") return "Gold BP";
  if (status === "silver") return "Silver BP";
  return "Bronze BP";
}

function ownerInitials(name?: string) {
  return (name || "BP")
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function memberFromProfile(uid: string, profile: { displayName?: string; avatarUrl?: string; avatarHiddenByAdmin?: boolean; bpStatus?: string; role?: string }) {
  return {
    uid,
    displayName: profile.displayName || "Raid Player",
    avatarUrl: profile.avatarHiddenByAdmin ? "" : profile.avatarUrl || "",
    bpStatus: profile.bpStatus ?? "bronze",
    role: profile.role ?? "user"
  };
}

function uniqueMembers(members: GroupMember[]) {
  const seen = new Set<string>();

  return members.filter((member) => {
    if (!member.uid || seen.has(member.uid)) return false;
    seen.add(member.uid);
    return true;
  });
}

function getGroupMembers(group: UserGroup) {
  const ownerMember = group.ownerUid
    ? [{
        uid: group.ownerUid,
        displayName: group.ownerName || "Raid Player",
        avatarUrl: group.ownerAvatarUrl || "",
        bpStatus: group.ownerBpStatus || "bronze",
        role: "owner"
      }]
    : [];

  return uniqueMembers([...ownerMember, ...(group.members ?? [])]);
}

const announcementLifetimeMs = 7 * 24 * 60 * 60 * 1000;

function announcementExpiresAt(item: ClanAnnouncement) {
  if (item.expiresAt?.seconds) {
    return item.expiresAt.seconds * 1000;
  }

  if (item.createdAt?.seconds) {
    return item.createdAt.seconds * 1000 + announcementLifetimeMs;
  }

  return Number.POSITIVE_INFINITY;
}

function isAnnouncementVisible(item: ClanAnnouncement, now: number) {
  return (item.status ?? "active") === "active" && announcementExpiresAt(item) > now;
}

function announcementHistoryLabel(item: ClanAnnouncement, now: number) {
  if (item.status === "moderated") return "Снято модератором";
  if (item.status === "deleted") return "Удалено с доски";
  if (announcementExpiresAt(item) <= now) return "Срок публикации истёк";
  return "В архиве";
}

export function ClanBoard() {
  const { profile, user } = useAuth();
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [announcements, setAnnouncements] = useState<ClanAnnouncement[]>([]);
  const [groups, setGroups] = useState<UserGroup[]>([]);
  const [directoryUsers, setDirectoryUsers] = useState<DirectoryUser[]>([]);
  const [groupTitle, setGroupTitle] = useState("");
  const [groupDescription, setGroupDescription] = useState("");
  const [groupRequirements, setGroupRequirements] = useState("");
  const [groupContact, setGroupContact] = useState("");
  const [groupActivity, setGroupActivity] = useState("");
  const [groupPinnedMessage, setGroupPinnedMessage] = useState("");
  const [groupTags, setGroupTags] = useState("");
  const [adminEditingGroupId, setAdminEditingGroupId] = useState("");
  const [memberSearch, setMemberSearch] = useState("");
  const [previewUser, setPreviewUser] = useState<DirectoryUser | null>(null);
  const [announcementStatus, setAnnouncementStatus] = useState("");
  const [groupStatus, setGroupStatus] = useState("");
  const [savingAnnouncement, setSavingAnnouncement] = useState(false);
  const [savingGroup, setSavingGroup] = useState(false);
  const [announcementClock, setAnnouncementClock] = useState(() => Date.now());
  const canModerate = profile?.role === "admin" || profile?.role === "owner";

  useEffect(() => {
    const announcementsQuery = query(collection(db, collections.clanAnnouncements), orderBy("createdAt", "desc"), limit(120));

    return onSnapshot(announcementsQuery, (snapshot) => {
      setAnnouncements(snapshot.docs.map((item) => ({ id: item.id, ...(item.data() as Omit<ClanAnnouncement, "id">) })));
    });
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => setAnnouncementClock(Date.now()), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!user?.uid) {
      setGroups([]);
      return;
    }

    const groupsQuery = query(
      collection(db, collections.userGroups),
      where("memberUids", "array-contains", user.uid),
      limit(120)
    );

    return onSnapshot(groupsQuery, (snapshot) => {
      const nextGroups = snapshot.docs
        .map((item) => ({ id: item.id, ...(item.data() as Omit<UserGroup, "id">) }))
        .sort((first, second) => (second.updatedAt?.seconds ?? second.createdAt?.seconds ?? 0) - (first.updatedAt?.seconds ?? first.createdAt?.seconds ?? 0));

      setGroups(nextGroups);
    });
  }, [user?.uid]);

  useEffect(() => {
    if (!user) {
      setDirectoryUsers([]);
      return;
    }

    const usersQuery = query(collection(db, collections.users), limit(240));

    return onSnapshot(usersQuery, (snapshot) => {
      setDirectoryUsers(
        snapshot.docs
          .map((item) => ({ uid: item.id, ...(item.data() as Omit<DirectoryUser, "uid">) }))
          .filter((item) => item.status !== "blocked")
          .sort((first, second) => (first.displayName || "").localeCompare(second.displayName || "", "ru"))
      );
    });
  }, [user]);

  const ownGroup = useMemo(() => {
    if (!user) return null;
    return groups.find((group) => group.id === user.uid || group.ownerUid === user.uid) ?? null;
  }, [groups, user]);

  const visibleAnnouncements = useMemo(
    () => announcements.filter((item) => isAnnouncementVisible(item, announcementClock)),
    [announcements, announcementClock]
  );

  const announcementHistory = useMemo(() => {
    if (!user) return [];

    return announcements.filter(
      (item) => item.uid === user.uid && !isAnnouncementVisible(item, announcementClock)
    );
  }, [announcements, announcementClock, user]);

  const activeGroup = useMemo(() => {
    if (canModerate && adminEditingGroupId) {
      return groups.find((group) => group.id === adminEditingGroupId) ?? ownGroup;
    }

    return ownGroup;
  }, [adminEditingGroupId, canModerate, groups, ownGroup]);

  useEffect(() => {
    if (!user) {
      setGroupTitle("");
      setGroupDescription("");
      setGroupRequirements("");
      setGroupContact("");
      setGroupActivity("");
      setGroupPinnedMessage("");
      setGroupTags("");
      setMemberSearch("");
      return;
    }

    setGroupTitle(activeGroup?.title ?? "");
    setGroupDescription(activeGroup?.description ?? "");
    setGroupRequirements(activeGroup?.requirements ?? "");
    setGroupContact(activeGroup?.contact ?? "");
    setGroupActivity(activeGroup?.activity ?? "");
    setGroupPinnedMessage(activeGroup?.pinnedMessage ?? "");
    setGroupTags((activeGroup?.tags ?? []).join(", "));
  }, [
    activeGroup?.activity,
    activeGroup?.contact,
    activeGroup?.description,
    activeGroup?.id,
    activeGroup?.pinnedMessage,
    activeGroup?.requirements,
    activeGroup?.tags,
    activeGroup?.title,
    user
  ]);

  const activeGroupMembers = useMemo(() => {
    if (!activeGroup) return [];
    return getGroupMembers({
      ...activeGroup,
      ownerUid: activeGroup.ownerUid || user?.uid,
      ownerName: activeGroup.ownerName || profile?.displayName || "Raid Player",
      ownerAvatarUrl: activeGroup.ownerAvatarUrl || (profile?.avatarHiddenByAdmin ? "" : profile?.avatarUrl || ""),
      ownerBpStatus: activeGroup.ownerBpStatus || profile?.bpStatus || "bronze"
    });
  }, [activeGroup, profile, user?.uid]);

  const excludedUsers = useMemo(() => {
    const excluded = new Set(activeGroup?.excludedUids ?? []);
    return directoryUsers.filter((item) => excluded.has(item.uid));
  }, [activeGroup?.excludedUids, directoryUsers]);

  const memberCandidates = useMemo(() => {
    const search = memberSearch.trim().toLowerCase();
    const memberUids = new Set(activeGroupMembers.map((member) => member.uid));
    const excluded = new Set(activeGroup?.excludedUids ?? []);

    return directoryUsers
      .filter((item) => item.uid !== user?.uid)
      .filter((item) => !memberUids.has(item.uid))
      .filter((item) => !excluded.has(item.uid))
      .filter((item) => {
        if (!search) return true;
        return (item.displayName || "").toLowerCase().includes(search) || item.uid.toLowerCase().includes(search);
      })
      .slice(0, 8);
  }, [activeGroup?.excludedUids, activeGroupMembers, directoryUsers, memberSearch, user?.uid]);

  const previewIsGroupMember = previewUser ? activeGroupMembers.some((member) => member.uid === previewUser.uid) : false;
  const previewIsGroupOwner = Boolean(previewUser && activeGroup?.ownerUid === previewUser.uid);

  function openMemberPreview(member: GroupMember) {
    const directoryUser = directoryUsers.find((item) => item.uid === member.uid);

    setPreviewUser({
      uid: member.uid,
      displayName: directoryUser?.displayName ?? member.displayName,
      avatarUrl: directoryUser?.avatarHiddenByAdmin ? "" : directoryUser?.avatarUrl ?? member.avatarUrl ?? "",
      avatarHiddenByAdmin: directoryUser?.avatarHiddenByAdmin,
      bpStatus: directoryUser?.bpStatus ?? member.bpStatus,
      role: directoryUser?.role ?? member.role,
      status: directoryUser?.status
    });
  }

  async function saveGroup(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!user || !profile) {
      setGroupStatus("Чтобы создать группу, войди в личный кабинет.");
      return;
    }

    const nextTitle = groupTitle.trim();
    const nextDescription = groupDescription.trim();

    if (!nextTitle || !nextDescription) {
      setGroupStatus("Заполни название группы и описание.");
      return;
    }

    setSavingGroup(true);
    setGroupStatus("");

    try {
      const targetGroupId = activeGroup?.id ?? user.uid;
      const isNewGroup = !activeGroup;
      const payload: Record<string, unknown> = {
        ownerUid: activeGroup?.ownerUid ?? user.uid,
        ownerName: activeGroup?.ownerName ?? profile.displayName ?? "Raid Player",
        ownerAvatarUrl: activeGroup?.ownerAvatarUrl ?? (profile.avatarHiddenByAdmin ? "" : profile.avatarUrl || ""),
        ownerBpStatus: activeGroup?.ownerBpStatus ?? profile.bpStatus ?? "bronze",
        title: nextTitle,
        description: nextDescription,
        requirements: groupRequirements.trim(),
        contact: groupContact.trim(),
        activity: groupActivity.trim(),
        pinnedMessage: groupPinnedMessage.trim(),
        tags: parseTags(groupTags),
        updatedAt: serverTimestamp()
      };

      if (activeGroup) {
        payload.memberUids = activeGroupMembers.map((member) => member.uid);
      }

      if (isNewGroup) {
        const initialMembers = [memberFromProfile(user.uid, profile)];
        payload.createdAt = serverTimestamp();
        payload.members = initialMembers;
        payload.memberUids = initialMembers.map((member) => member.uid);
        payload.excludedUids = [];
      }

      await setDoc(doc(db, collections.userGroups, targetGroupId), payload, { merge: true });
      setGroupStatus(activeGroup ? "Группа обновлена." : "Группа создана. У этого аккаунта может быть только одна группа.");
    } catch (error) {
      setGroupStatus(error instanceof Error ? error.message : "Не удалось сохранить группу.");
    } finally {
      setSavingGroup(false);
    }
  }

  async function removeGroup(item: UserGroup) {
    if (!user || (item.ownerUid !== user.uid && item.id !== user.uid && !canModerate)) {
      return;
    }

    await deleteDoc(doc(db, collections.userGroups, item.id));
  }

  async function addGroupMember(item: DirectoryUser) {
    if (!user || !activeGroup) {
      setGroupStatus("Сначала создай группу.");
      return;
    }

    const nextMembers = uniqueMembers([
      ...activeGroupMembers,
      memberFromProfile(item.uid, item)
    ]).slice(0, 80);
    const nextExcluded = (activeGroup.excludedUids ?? []).filter((uid) => uid !== item.uid);

    await setDoc(
      doc(db, collections.userGroups, activeGroup.id),
      {
        members: nextMembers,
        memberUids: nextMembers.map((member) => member.uid),
        excludedUids: nextExcluded,
        updatedAt: serverTimestamp()
      },
      { merge: true }
    );
    setMemberSearch("");
    setPreviewUser(null);
    setGroupStatus(`${item.displayName || "Участник"} добавлен в группу.`);
  }

  async function excludeGroupMember(member: GroupMember) {
    if (!user || !activeGroup || member.uid === activeGroup.ownerUid) {
      return;
    }

    const nextMembers = activeGroupMembers.filter((item) => item.uid !== member.uid);
    const nextExcluded = Array.from(new Set([...(activeGroup.excludedUids ?? []), member.uid])).slice(0, 120);

    await setDoc(
      doc(db, collections.userGroups, activeGroup.id),
      {
        members: nextMembers,
        memberUids: nextMembers.map((item) => item.uid),
        excludedUids: nextExcluded,
        updatedAt: serverTimestamp()
      },
      { merge: true }
    );
    setPreviewUser(null);
    setGroupStatus(`${member.displayName} исключен из группы.`);
  }

  async function restoreExcludedUser(uid: string) {
    if (!user || !activeGroup) {
      return;
    }

    await setDoc(
      doc(db, collections.userGroups, activeGroup.id),
      {
        excludedUids: (activeGroup.excludedUids ?? []).filter((item) => item !== uid),
        updatedAt: serverTimestamp()
      },
      { merge: true }
    );
    setPreviewUser(null);
  }

  async function createAnnouncement(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!user || !profile) {
      setAnnouncementStatus("Чтобы разместить объявление, войди в личный кабинет.");
      return;
    }

    setSavingAnnouncement(true);
    setAnnouncementStatus("");

    try {
      await addDoc(collection(db, collections.clanAnnouncements), {
        uid: user.uid,
        authorName: profile.displayName || "Raid Player",
        title: title.trim(),
        text: text.trim(),
        status: "active",
        expiresAt: Timestamp.fromMillis(Date.now() + announcementLifetimeMs),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      setTitle("");
      setText("");
      setAnnouncementStatus("Объявление опубликовано.");
    } catch (error) {
      setAnnouncementStatus(error instanceof Error ? error.message : "Не удалось опубликовать объявление.");
    } finally {
      setSavingAnnouncement(false);
    }
  }

  async function archiveAnnouncement(item: ClanAnnouncement) {
    if (!user || (item.uid !== user.uid && !canModerate)) {
      return;
    }

    const removedByModerator = canModerate && item.uid !== user.uid;

    await updateDoc(doc(db, collections.clanAnnouncements, item.id), {
      status: removedByModerator ? "moderated" : "deleted",
      archivedAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  }

  async function republishAnnouncement(item: ClanAnnouncement) {
    if (!user || item.uid !== user.uid || item.status === "moderated") {
      return;
    }

    await updateDoc(doc(db, collections.clanAnnouncements, item.id), {
      status: "active",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      expiresAt: Timestamp.fromMillis(Date.now() + announcementLifetimeMs),
      archivedAt: null
    });
  }

  async function deleteAnnouncementPermanently(item: ClanAnnouncement) {
    if (!user || (item.uid !== user.uid && !canModerate)) {
      return;
    }

    await deleteDoc(doc(db, collections.clanAnnouncements, item.id));
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[440px_1fr]">
        <GlassPanel className="p-5 sm:p-6">
          <div className="mb-5 flex items-center gap-3">
            <span className="grid h-12 w-12 place-items-center rounded-[16px] border border-relic/30 bg-relic/12 text-relic">
              <Crown size={22} />
            </span>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-relic">My Clan Group</p>
              <h2 className="text-2xl font-black text-white">{activeGroup ? (canModerate && adminEditingGroupId ? "Админ: группа" : "Моя группа") : "Создать группу"}</h2>
            </div>
          </div>

          {canModerate && adminEditingGroupId ? (
            <button
              type="button"
              onClick={() => {
                setAdminEditingGroupId("");
                setMemberSearch("");
              }}
              className="mb-4 inline-flex w-full items-center justify-center rounded-md border border-relic/25 bg-relic/10 px-3 py-2 text-sm font-bold text-relic transition hover:bg-relic hover:text-black"
            >
              Вернуться к своей группе
            </button>
          ) : null}

          {user ? (
            <>
            <form onSubmit={saveGroup} className="space-y-3">
              <input
                value={groupTitle}
                onChange={(event) => setGroupTitle(event.target.value)}
                required
                maxLength={80}
                placeholder="Название группы"
                className="w-full rounded-md border-white/10 bg-black/30 text-white placeholder:text-zinc-500 focus:border-relic focus:ring-relic"
              />
              <textarea
                value={groupDescription}
                onChange={(event) => setGroupDescription(event.target.value)}
                required
                maxLength={900}
                rows={5}
                placeholder="Описание: цель группы, формат игры, кого ищете..."
                className="w-full rounded-md border-white/10 bg-black/30 text-white placeholder:text-zinc-500 focus:border-relic focus:ring-relic"
              />
              <input
                value={groupRequirements}
                onChange={(event) => setGroupRequirements(event.target.value)}
                maxLength={180}
                placeholder="Требования: уровень, активность, Discord/Telegram..."
                className="w-full rounded-md border-white/10 bg-black/30 text-white placeholder:text-zinc-500 focus:border-relic focus:ring-relic"
              />
              <input
                value={groupActivity}
                onChange={(event) => setGroupActivity(event.target.value)}
                maxLength={160}
                placeholder="Активность: КБ, гидра, арена, CvC..."
                className="w-full rounded-md border-white/10 bg-black/30 text-white placeholder:text-zinc-500 focus:border-relic focus:ring-relic"
              />
              <input
                value={groupContact}
                onChange={(event) => setGroupContact(event.target.value)}
                maxLength={160}
                placeholder="Контакт для связи"
                className="w-full rounded-md border-white/10 bg-black/30 text-white placeholder:text-zinc-500 focus:border-relic focus:ring-relic"
              />
              <textarea
                value={groupPinnedMessage}
                onChange={(event) => setGroupPinnedMessage(event.target.value)}
                maxLength={420}
                rows={4}
                placeholder="Закрепленное сообщение: правила группы, важный анонс, ссылка на сбор..."
                className="w-full rounded-md border-white/10 bg-black/30 text-white placeholder:text-zinc-500 focus:border-relic focus:ring-relic"
              />
              <input
                value={groupTags}
                onChange={(event) => setGroupTags(event.target.value)}
                maxLength={180}
                placeholder="Теги через запятую: Hydra, CvC, новичкам"
                className="w-full rounded-md border-white/10 bg-black/30 text-white placeholder:text-zinc-500 focus:border-relic focus:ring-relic"
              />

              <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                <button disabled={savingGroup} className="inline-flex items-center justify-center gap-2 rounded-md bg-relic px-4 py-3 font-bold text-black disabled:opacity-60">
                  <Save size={16} />
                  {activeGroup ? "Сохранить группу" : "Создать группу"}
                </button>
                {activeGroup ? (
                  <button
                    type="button"
                    onClick={() => void removeGroup(activeGroup)}
                    className="inline-flex items-center justify-center gap-2 rounded-md border border-blood/35 px-4 py-3 font-bold text-ember transition hover:bg-blood/15"
                  >
                    <Trash2 size={16} />
                    Удалить
                  </button>
                ) : null}
              </div>
            </form>

            {activeGroup ? (
              <div className="mt-5 space-y-4 rounded-[20px] border border-relic/18 bg-black/28 p-4">
                <div className="flex items-center gap-2 text-relic">
                  <Pin size={16} />
                  <h3 className="font-black text-white">Управление группой</h3>
                </div>

                <div>
                  <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-relic">Участники</p>
                  <div className="max-h-56 space-y-2 overflow-y-auto pr-1">
                    {activeGroupMembers.map((member) => {
                      const isOwner = member.uid === activeGroup.ownerUid;

                      return (
                        <div key={member.uid} className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/30 p-2">
                          <button type="button" onClick={() => openMemberPreview(member)} className="flex min-w-0 flex-1 items-center gap-3 text-left">
                            <span className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-xl border border-relic/25 bg-relic/10 text-xs font-black text-relic">
                              {member.avatarUrl ? <img src={member.avatarUrl} alt="" className="h-full w-full object-cover" /> : ownerInitials(member.displayName)}
                            </span>
                            <div className="min-w-0">
                              <p className="truncate text-sm font-bold text-white">{member.displayName}</p>
                              <p className="text-xs text-zinc-500">{isOwner ? "Владелец" : bpLabel(member.bpStatus)}</p>
                            </div>
                          </button>
                          {!isOwner ? (
                            <button
                              type="button"
                              onClick={() => void excludeGroupMember(member)}
                              className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-blood/30 text-ember transition hover:bg-blood/15"
                              aria-label="Исключить участника"
                            >
                              <UserMinus size={16} />
                            </button>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-relic">Добавить пользователя</p>
                  <input
                    value={memberSearch}
                    onChange={(event) => setMemberSearch(event.target.value)}
                    placeholder="Найти по никнейму или UID"
                    className="w-full rounded-md border-white/10 bg-black/30 text-white placeholder:text-zinc-500 focus:border-relic focus:ring-relic"
                  />
                  <div className="mt-2 max-h-52 space-y-2 overflow-y-auto pr-1">
                    {memberCandidates.map((item) => (
                      <button
                        key={item.uid}
                        type="button"
                        onClick={() => setPreviewUser(item)}
                        className="flex w-full items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/30 p-2 text-left transition hover:border-relic/35 hover:bg-relic/[0.08]"
                      >
                        <span className="flex min-w-0 items-center gap-3">
                          <span className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-xl border border-relic/25 bg-relic/10 text-xs font-black text-relic">
                            {item.avatarUrl && !item.avatarHiddenByAdmin ? <img src={item.avatarUrl} alt="" className="h-full w-full object-cover" /> : ownerInitials(item.displayName)}
                          </span>
                          <span className="min-w-0">
                            <span className="block truncate text-sm font-bold text-white">{item.displayName || "Raid Player"}</span>
                            <span className="text-xs text-zinc-500">{bpLabel(item.bpStatus)}</span>
                          </span>
                        </span>
                        <UserPlus size={16} className="shrink-0 text-relic" />
                      </button>
                    ))}

                    {memberCandidates.length === 0 ? (
                      <p className="rounded-2xl border border-white/10 bg-black/24 p-3 text-sm text-zinc-500">Подходящих пользователей нет.</p>
                    ) : null}
                  </div>
                </div>

                {excludedUsers.length > 0 ? (
                  <div>
                    <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-ember">Исключенные</p>
                    <div className="space-y-2">
                      {excludedUsers.map((item) => (
                        <div key={item.uid} className="flex items-center justify-between gap-3 rounded-2xl border border-blood/20 bg-blood/[0.08] p-2">
                          <span className="truncate text-sm font-semibold text-zinc-300">{item.displayName || "Raid Player"}</span>
                          <button type="button" onClick={() => void restoreExcludedUser(item.uid)} className="rounded-xl border border-relic/25 px-3 py-1.5 text-xs font-bold text-relic hover:bg-relic hover:text-black">
                            Вернуть
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            ) : null}
            </>
          ) : (
            <div className="rounded-[18px] border border-relic/18 bg-black/28 p-4 text-sm leading-6 text-zinc-400">
              Создать свою группу может только зарегистрированный участник. <Link href="/login" className="font-semibold text-relic">Войти</Link>
            </div>
          )}

          <p className="mt-4 rounded-lg border border-relic/20 bg-relic/[0.08] p-3 text-sm text-zinc-300">
            Один пользователь может создать только одну группу. Если группа уже есть, эта форма редактирует ее.
          </p>
          {groupStatus ? <p className="mt-3 rounded-lg border border-relic/20 bg-black/30 p-3 text-sm text-zinc-300">{groupStatus}</p> : null}
        </GlassPanel>

        <GlassPanel className="p-5 sm:p-6">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-relic">Groups</p>
              <h2 className="text-2xl font-black text-white">Группы участников</h2>
            </div>
            <Users className="text-relic" />
          </div>

          <div className="grid max-h-[760px] gap-4 overflow-y-auto pr-1 md:grid-cols-2">
            {groups.map((item) => (
              <article key={item.id} className="rounded-[22px] border border-relic/18 bg-black/32 p-4 shadow-[inset_0_0_26px_rgba(47,124,255,0.04)]">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-2xl border border-relic/30 bg-relic/12 text-sm font-black text-relic">
                      {item.ownerAvatarUrl ? <img src={item.ownerAvatarUrl} alt="" className="h-full w-full object-cover" /> : ownerInitials(item.ownerName)}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-xs font-bold uppercase tracking-[0.16em] text-relic">{bpLabel(item.ownerBpStatus)}</p>
                      <h3 className="break-words text-xl font-black text-white">{item.title || "Группа Raid"}</h3>
                    </div>
                  </div>
                  {user && (item.ownerUid === user.uid || item.id === user.uid || canModerate) ? (
                    <div className="flex shrink-0 items-center gap-2">
                      {canModerate ? (
                        <button
                          type="button"
                          onClick={() => {
                            setAdminEditingGroupId(item.id);
                            setMemberSearch("");
                            setGroupStatus("Группа открыта для админского управления.");
                          }}
                          className="grid h-9 w-9 place-items-center rounded-md border border-relic/30 text-relic hover:bg-relic/15"
                          aria-label="Управлять группой"
                        >
                          <Shield size={16} />
                        </button>
                      ) : null}
                      <button type="button" onClick={() => void removeGroup(item)} className="grid h-9 w-9 place-items-center rounded-md border border-blood/30 text-ember hover:bg-blood/15" aria-label="Удалить группу">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ) : null}
                </div>

                {item.pinnedMessage ? (
                  <div className="mt-4 rounded-2xl border border-relic/22 bg-relic/[0.08] p-3">
                    <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-relic">
                      <Pin size={13} />
                      Закреплено
                    </p>
                    <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-zinc-200">{item.pinnedMessage}</p>
                  </div>
                ) : null}

                <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-7 text-zinc-300">{item.description}</p>

                <div className="mt-4 grid gap-2 text-sm text-zinc-400">
                  {item.requirements ? (
                    <p><span className="font-semibold text-relic">Требования:</span> {item.requirements}</p>
                  ) : null}
                  {item.activity ? (
                    <p><span className="font-semibold text-relic">Активность:</span> {item.activity}</p>
                  ) : null}
                  {item.contact ? (
                    <p><span className="font-semibold text-relic">Контакт:</span> {item.contact}</p>
                  ) : null}
                </div>

                {item.tags?.length ? (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {item.tags.map((tag) => (
                      <span key={tag} className="rounded-full border border-relic/25 bg-relic/10 px-2.5 py-1 text-xs font-semibold text-relic">{tag}</span>
                    ))}
                  </div>
                ) : null}

                <div className="mt-4 rounded-2xl border border-white/10 bg-black/24 p-3">
                  <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-relic">Состав</p>
                  <div className="flex flex-wrap items-center gap-2">
                    {getGroupMembers(item).slice(0, 8).map((member) => (
                      <button
                        key={member.uid}
                        type="button"
                        onClick={() => openMemberPreview(member)}
                        className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/30 py-1 pl-1 pr-3 text-left text-xs font-semibold text-zinc-300 transition hover:border-relic/35 hover:bg-relic/[0.08] hover:text-white"
                      >
                        <span className="grid h-7 w-7 place-items-center overflow-hidden rounded-full bg-relic/12 text-[10px] font-black text-relic">
                          {member.avatarUrl ? <img src={member.avatarUrl} alt="" className="h-full w-full object-cover" /> : ownerInitials(member.displayName)}
                        </span>
                        {member.displayName}
                      </button>
                    ))}
                    {getGroupMembers(item).length > 8 ? (
                      <span className="rounded-full border border-relic/20 px-3 py-1 text-xs font-bold text-relic">+{getGroupMembers(item).length - 8}</span>
                    ) : null}
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4 text-xs text-zinc-500">
                  <span>Обновлено: {formatDate(item)}</span>
                  {item.ownerUid && item.ownerUid !== user?.uid ? (
                    <Link
                      href={user ? `/chat?user=${item.ownerUid}` : "/login"}
                      className="inline-flex items-center gap-2 rounded-md border border-relic/30 bg-relic/10 px-3 py-2 text-sm font-semibold text-relic transition hover:bg-relic hover:text-black"
                    >
                      <MessageCircle size={16} />
                      Написать владельцу
                    </Link>
                  ) : null}
                </div>
              </article>
            ))}

            {groups.length === 0 ? (
              <div className="rounded-[18px] border border-white/10 bg-black/24 p-5 text-sm text-zinc-500 md:col-span-2">
                Групп пока нет. Первая созданная группа появится здесь.
              </div>
            ) : null}
          </div>
        </GlassPanel>
      </div>

      <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
        <GlassPanel className="p-5 sm:p-6">
          <div className="mb-5 flex items-center gap-3">
            <span className="grid h-12 w-12 place-items-center rounded-[16px] border border-relic/30 bg-relic/12 text-relic">
              <Megaphone size={22} />
            </span>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-relic">Clan Board</p>
              <h2 className="text-2xl font-black text-white">Объявление клана</h2>
            </div>
          </div>

          {user ? (
            <form onSubmit={createAnnouncement} className="space-y-3">
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                required
                maxLength={80}
                placeholder="Название объявления"
                className="w-full rounded-md border-white/10 bg-black/30 text-white placeholder:text-zinc-500 focus:border-relic focus:ring-relic"
              />
              <textarea
                value={text}
                onChange={(event) => setText(event.target.value)}
                required
                maxLength={700}
                rows={7}
                placeholder="Текст объявления: набор в клан, требования, контакты, расписание..."
                className="w-full rounded-md border-white/10 bg-black/30 text-white placeholder:text-zinc-500 focus:border-relic focus:ring-relic"
              />
              <button disabled={savingAnnouncement} className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-relic px-4 py-3 font-bold text-black disabled:opacity-60">
                <Send size={16} />
                Опубликовать
              </button>
            </form>
          ) : (
            <div className="rounded-[18px] border border-relic/18 bg-black/28 p-4 text-sm leading-6 text-zinc-400">
              Размещать объявления могут зарегистрированные участники. <Link href="/login" className="font-semibold text-relic">Войти</Link>
            </div>
          )}

          {announcementStatus ? <p className="mt-4 rounded-lg border border-relic/20 bg-relic/[0.08] p-3 text-sm text-zinc-300">{announcementStatus}</p> : null}

          {user ? (
            <div className="mt-5 rounded-[18px] border border-white/10 bg-black/24 p-3">
              <div className="flex items-center justify-between gap-3">
                <p className="inline-flex items-center gap-2 text-sm font-bold text-white">
                  <History size={16} className="text-relic" />
                  История объявлений
                </p>
                <span className="rounded-full border border-relic/20 px-2 py-0.5 text-xs font-bold text-relic">
                  {announcementHistory.length}
                </span>
              </div>

              <div className="mt-3 max-h-[300px] space-y-2 overflow-y-auto pr-1">
                {announcementHistory.map((item) => (
                  <article key={item.id} className="rounded-[14px] border border-white/10 bg-black/30 p-3">
                    <p className="break-words text-sm font-bold text-white">{item.title}</p>
                    <p className="mt-1 text-xs text-zinc-500">
                      {announcementHistoryLabel(item, announcementClock)} · {formatDate(item)}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {item.status !== "moderated" ? (
                        <button
                          type="button"
                          onClick={() => void republishAnnouncement(item)}
                          className="inline-flex items-center gap-2 rounded-md border border-relic/30 bg-relic/10 px-3 py-2 text-xs font-bold text-relic transition hover:bg-relic hover:text-black"
                        >
                          <RotateCcw size={14} />
                          Опубликовать снова
                        </button>
                      ) : null}
                      <button
                        type="button"
                        onClick={() => void deleteAnnouncementPermanently(item)}
                        className="inline-flex items-center gap-2 rounded-md border border-blood/30 px-3 py-2 text-xs font-bold text-ember transition hover:bg-blood/15"
                      >
                        <Trash2 size={14} />
                        Удалить навсегда
                      </button>
                    </div>
                  </article>
                ))}

                {announcementHistory.length === 0 ? (
                  <p className="rounded-[14px] border border-dashed border-white/10 px-3 py-4 text-center text-xs text-zinc-500">
                    Здесь появятся снятые и просроченные объявления.
                  </p>
                ) : null}
              </div>
            </div>
          ) : null}
        </GlassPanel>

        <GlassPanel className="p-5 sm:p-6">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-relic">Recruiting</p>
              <h2 className="text-2xl font-black text-white">Доска объявлений</h2>
            </div>
            <Shield className="text-relic" />
          </div>

          <div className="max-h-[680px] space-y-3 overflow-y-auto pr-1">
            {visibleAnnouncements.map((item) => (
              <article key={item.id} className="rounded-[18px] border border-relic/18 bg-black/28 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-relic">{item.authorName || "Raid Player"} · {formatDate(item)}</p>
                    <h3 className="mt-2 break-words text-xl font-black text-white">{item.title}</h3>
                  </div>
                  {user && (item.uid === user.uid || canModerate) ? (
                    <button type="button" onClick={() => void archiveAnnouncement(item)} className="grid h-9 w-9 shrink-0 place-items-center rounded-md border border-blood/30 text-ember hover:bg-blood/15" aria-label="Снять объявление с доски">
                      <Trash2 size={16} />
                    </button>
                  ) : null}
                </div>
                <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-7 text-zinc-300">{item.text}</p>
                {item.uid && item.uid !== user?.uid ? (
                  <Link
                    href={user ? `/chat?user=${item.uid}` : "/login"}
                    className="mt-4 inline-flex items-center gap-2 rounded-md border border-relic/30 bg-relic/10 px-3 py-2 text-sm font-semibold text-relic transition hover:bg-relic hover:text-black"
                  >
                    <MessageCircle size={16} />
                    Написать автору
                  </Link>
                ) : null}
              </article>
            ))}

            {visibleAnnouncements.length === 0 ? (
              <div className="rounded-[18px] border border-white/10 bg-black/24 p-5 text-sm text-zinc-500">
                Объявлений пока нет. Первое объявление появится здесь сразу после публикации.
              </div>
            ) : null}
          </div>
        </GlassPanel>
      </div>

      {previewUser ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/78 p-4 backdrop-blur-sm" role="dialog" aria-modal="true">
          <div className="w-full max-w-md overflow-hidden rounded-[22px] border border-relic/20 bg-[#0a101b] shadow-[0_28px_80px_rgba(0,0,0,0.62)]">
            <div className="flex items-start gap-4 border-b border-white/10 bg-white/[0.03] p-4">
              <span className="grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-2xl border border-relic/30 bg-relic/12 text-xl font-black text-relic">
                {previewUser.avatarUrl && !previewUser.avatarHiddenByAdmin ? (
                  <img src={previewUser.avatarUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  ownerInitials(previewUser.displayName)
                )}
              </span>
              <div className="min-w-0 flex-1 pt-1">
                <p className="truncate text-lg font-black text-white">{previewUser.displayName || "Raid Player"}</p>
                <p className="text-sm text-zinc-500">{bpLabel(previewUser.bpStatus)}</p>
                <p className="mt-2 inline-flex rounded-full border border-relic/25 bg-relic/10 px-2.5 py-1 text-xs font-bold uppercase tracking-[0.14em] text-relic">
                  {previewUser.role === "admin" || previewUser.role === "owner" ? "Администратор" : previewIsGroupOwner ? "Владелец группы" : previewIsGroupMember ? "Участник группы" : "Можно пригласить"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewUser(null)}
                className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white/10 text-zinc-400 transition hover:text-white"
                aria-label="Закрыть"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 p-4">
              {activeGroup ? (
                previewIsGroupMember ? (
                  previewIsGroupOwner ? (
                    <div className="rounded-xl border border-relic/20 bg-relic/[0.08] p-3 text-sm text-zinc-300">
                      Это владелец выбранной группы. Его нельзя исключить из состава.
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        if (!previewUser) {
                          return;
                        }

                        const member = activeGroupMembers.find((item) => item.uid === previewUser.uid);
                        if (member) {
                          void excludeGroupMember(member);
                        }
                      }}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-blood/35 bg-blood/10 px-4 py-3 font-bold text-ember transition hover:bg-blood/20"
                    >
                      <UserMinus size={16} />
                      Исключить из группы
                    </button>
                  )
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      if (previewUser) {
                        void addGroupMember(previewUser);
                      }
                    }}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-relic px-4 py-3 font-bold text-black transition hover:bg-[#8bbcff]"
                  >
                    <UserPlus size={16} />
                    Пригласить в группу
                  </button>
                )
              ) : (
                <div className="rounded-xl border border-relic/20 bg-relic/[0.08] p-3 text-sm text-zinc-300">
                  Сначала создай группу, затем открой поиск и пригласи участника.
                </div>
              )}

              {previewUser.uid !== user?.uid ? (
                <Link
                  href={user ? `/chat?user=${previewUser.uid}` : "/login"}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-relic/30 bg-relic/10 px-4 py-3 font-bold text-relic transition hover:bg-relic hover:text-black"
                >
                  <MessageCircle size={16} />
                  Перейти в личные сообщения
                </Link>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
