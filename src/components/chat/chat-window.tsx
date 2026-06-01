"use client";

import Link from "next/link";
import { ChevronDown, CornerDownRight, ImagePlus, Menu, MessageSquare, Search, Send, Smile, Trash2, Users, X } from "lucide-react";
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
import { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import type { UserProfile } from "@/lib/auth/types";
import { getClipboardImageFile } from "@/lib/browser/clipboard-image";
import type { CloudinaryAsset } from "@/lib/cloudinary/types";
import { db } from "@/lib/firebase/client";
import { collections } from "@/lib/firebase/collections";
import { getAvatarFrameClass, getNicknameClass } from "@/lib/profile-cosmetics";

type MentionedUser = {
  uid: string;
  displayName: string;
};

type ChatMessage = {
  id: string;
  uid: string;
  displayName: string;
  avatarUrl?: string;
  avatarFrame?: string;
  nicknameStyle?: string;
  text: string;
  attachment?: {
    secureUrl?: string;
    url?: string;
    alt?: string;
  } | null;
  replyTo?: {
    id: string;
    displayName: string;
    text: string;
  } | null;
  mentions?: MentionedUser[];
  createdAt?: { seconds?: number };
};

type ImagePreview = {
  url: string;
  alt: string;
};

type MemberMenu = {
  uid: string;
  displayName: string;
  avatarUrl?: string;
  avatarFrame?: string;
  nicknameStyle?: string;
  bpStatus?: "bronze" | "silver" | "gold" | "platinum";
  avatarHiddenByAdmin?: boolean;
};

const basicEmojis = ["\u{1F600}", "\u{1F602}", "\u{1F60D}", "\u{1F44D}", "\u{1F525}", "\u2764\uFE0F", "\u{1F64F}", "\u{1F389}", "\u{1F60E}", "\u{1F914}"];

async function uploadChatImage(file: File) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("folder", "chat");
  formData.append("publicId", `screenshots/${Date.now()}-${file.name.replace(/[^a-z0-9.]+/gi, "-")}`);

  const response = await fetch("/api/cloudinary/upload", {
    method: "POST",
    body: formData
  });

  if (!response.ok) {
    throw new Error("Не удалось загрузить изображение.");
  }

  return (await response.json()) as CloudinaryAsset;
}

function directThreadId(firstUid: string, secondUid: string) {
  return [firstUid, secondUid].sort().join("__");
}

function getUserLabel(userProfile: Pick<UserProfile, "displayName" | "email">) {
  return userProfile.displayName || "User";
}

function getPublicUserMeta(userProfile: UserProfile) {
  return userProfile.role;
}

function formatTime(message: ChatMessage) {
  if (!message.createdAt?.seconds) {
    return "сейчас";
  }

  return new Intl.DateTimeFormat("ru-RU", {
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(message.createdAt.seconds * 1000));
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function renderMessageText(text: string, mentions?: MentionedUser[]) {
  if (!mentions?.length) {
    return text;
  }

  const names = mentions.map((mention) => mention.displayName).filter(Boolean).sort((a, b) => b.length - a.length);

  if (!names.length) {
    return text;
  }

  const pattern = new RegExp(`(@(?:${names.map(escapeRegExp).join("|")}))`, "gi");

  return text.split(pattern).map((part, index) => {
    const matched = names.find((name) => part.toLowerCase() === `@${name}`.toLowerCase());

    if (!matched) {
      return <span key={`${part}-${index}`}>{part}</span>;
    }

    return (
      <span key={`${part}-${index}`} className="rounded bg-relic/15 px-1 font-bold text-relic">
        @{matched}
      </span>
    );
  });
}

function extractMentions(text: string, users: UserProfile[], currentUid?: string) {
  const haystack = text.toLowerCase();

  return users
    .filter((item) => item.uid !== currentUid)
    .map((item) => ({ uid: item.uid, displayName: getUserLabel(item) }))
    .filter((item) => haystack.includes(`@${item.displayName}`.toLowerCase()));
}

function shouldShowAvatar(ownerUid: string, currentUid?: string, hiddenByAdmin?: boolean) {
  return ownerUid === currentUid || !hiddenByAdmin;
}

export function ChatWindow() {
  const { profile, user } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [directContactIds, setDirectContactIds] = useState<string[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [replyTo, setReplyTo] = useState<ChatMessage | null>(null);
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const [attachmentPreviewUrl, setAttachmentPreviewUrl] = useState("");
  const [imagePreview, setImagePreview] = useState<ImagePreview | null>(null);
  const [memberMenu, setMemberMenu] = useState<MemberMenu | null>(null);
  const [personalBlockedUids, setPersonalBlockedUids] = useState<string[]>([]);
  const [chatMenuOpen, setChatMenuOpen] = useState(false);
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const sendingRef = useRef(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const canSend = Boolean(message.trim() || attachmentFile) && Boolean(user) && !sending;
  const canModerate = profile?.role === "admin" || profile?.role === "owner";

  const activeThread = selectedUser && user ? directThreadId(user.uid, selectedUser.uid) : "global";
  const directContactIdSet = useMemo(() => new Set(directContactIds), [directContactIds]);
  const filteredUsers = useMemo(
    () =>
      users.filter((item) => {
        const haystack = getUserLabel(item).toLowerCase();
        return item.uid !== user?.uid && directContactIdSet.has(item.uid) && haystack.includes(search.trim().toLowerCase());
      }),
    [directContactIdSet, search, user?.uid, users]
  );
  const visibleMessages = useMemo(
    () => messages.filter((item) => item.uid === user?.uid || !personalBlockedUids.includes(item.uid)),
    [messages, personalBlockedUids, user?.uid]
  );
  const mentionQuery = useMemo(() => {
    if (selectedUser) {
      return null;
    }

    const match = message.match(/(^|\s)@([^\s@]{0,40})$/);
    return match ? match[2].toLowerCase() : null;
  }, [message, selectedUser]);
  const mentionSuggestions = useMemo(() => {
    if (mentionQuery === null) {
      return [];
    }

    return users
      .filter((item) => item.uid !== user?.uid)
      .filter((item) => getUserLabel(item).toLowerCase().includes(mentionQuery))
      .slice(0, 6);
  }, [mentionQuery, user?.uid, users]);

  useEffect(() => {
    if (!attachmentFile) {
      setAttachmentPreviewUrl("");
      return;
    }

    const objectUrl = URL.createObjectURL(attachmentFile);
    setAttachmentPreviewUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [attachmentFile]);

  useEffect(() => {
    if (!user) {
      setPersonalBlockedUids([]);
      return;
    }

    const stored = window.localStorage.getItem(`raid-personal-blocks-${user.uid}`);
    setPersonalBlockedUids(stored ? (JSON.parse(stored) as string[]) : []);
  }, [user]);

  useEffect(() => {
    if (!user) {
      return;
    }

    window.localStorage.setItem(`raid-personal-blocks-${user.uid}`, JSON.stringify(personalBlockedUids));
  }, [personalBlockedUids, user]);

  useEffect(() => {
    if (!user) {
      return;
    }

    const usersQuery = query(collection(db, collections.users), orderBy("displayName"));
    return onSnapshot(
      usersQuery,
      (snapshot) => {
        setUsers(snapshot.docs.map((item) => item.data() as UserProfile));
      },
      () => setUsers([])
    );
  }, [user]);

  useEffect(() => {
    if (!user) {
      setDirectContactIds([]);
      return;
    }

    const threadsQuery = query(collection(db, "directThreads"), where("participants", "array-contains", user.uid));
    return onSnapshot(
      threadsQuery,
      (snapshot) => {
        const nextContactIds = new Set<string>();

        snapshot.docs.forEach((item) => {
          const thread = item.data() as { participants?: string[]; lastMessageAt?: unknown; lastMessageText?: string };

          if (!thread.lastMessageAt && !thread.lastMessageText) {
            return;
          }

          const participants = thread.participants ?? [];
          participants.forEach((participantUid) => {
            if (participantUid !== user.uid) {
              nextContactIds.add(participantUid);
            }
          });
        });

        setDirectContactIds([...nextContactIds]);
      },
      () => setDirectContactIds([])
    );
  }, [user]);

  useEffect(() => {
    const targetUid = new URLSearchParams(window.location.search).get("user");

    if (!targetUid || selectedUser?.uid === targetUid) {
      return;
    }

    const targetUser = users.find((item) => item.uid === targetUid);

    if (targetUser) {
      setSelectedUser(targetUser);
    }
  }, [selectedUser?.uid, users]);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    let cancelled = false;

    async function subscribe() {
      if (cancelled) {
        return;
      }

      const messagesRef =
        selectedUser && user
          ? collection(db, "directThreads", directThreadId(user.uid, selectedUser.uid), "messages")
          : collection(db, collections.chatRooms, "global", "messages");
      const messagesQuery = query(messagesRef, orderBy("createdAt", "asc"), limit(80));

      unsubscribe = onSnapshot(
        messagesQuery,
        (snapshot) => {
          setMessages(snapshot.docs.map((item) => ({ id: item.id, ...(item.data() as Omit<ChatMessage, "id">) })));
        },
        () => setMessages([])
      );
    }

    void subscribe();

    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, [selectedUser, user]);

  useEffect(() => {
    scrollToBottom();
  }, [activeThread, messages.length]);

  function scrollToBottom() {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }

  function openMemberMenu(messageItem: ChatMessage) {
    if (messageItem.uid === user?.uid) {
      return;
    }

    const author = users.find((item) => item.uid === messageItem.uid);

    setMemberMenu({
      uid: messageItem.uid,
      displayName: messageItem.displayName,
      avatarFrame: author ? author.avatarFrame ?? "none" : messageItem.avatarFrame,
      bpStatus: author?.bpStatus ?? "bronze",
      avatarHiddenByAdmin: Boolean(author?.avatarHiddenByAdmin),
      nicknameStyle: author?.nicknameStyle || messageItem.nicknameStyle,
      avatarUrl: shouldShowAvatar(messageItem.uid, user?.uid, author?.avatarHiddenByAdmin) ? author?.avatarUrl || messageItem.avatarUrl : ""
    });
  }

  async function toggleMemberAvatarVisibility(member: MemberMenu) {
    if (!canModerate) {
      return;
    }

    const nextHidden = !member.avatarHiddenByAdmin;

    await updateDoc(doc(db, collections.users, member.uid), {
      avatarHiddenByAdmin: nextHidden,
      updatedAt: serverTimestamp()
    });

    setUsers((current) => current.map((item) => (item.uid === member.uid ? { ...item, avatarHiddenByAdmin: nextHidden } : item)));
    setMemberMenu({
      ...member,
      avatarHiddenByAdmin: nextHidden,
      avatarUrl: nextHidden ? "" : users.find((item) => item.uid === member.uid)?.avatarUrl || member.avatarUrl
    });
  }

  function startDirectMessage(member: MemberMenu) {
    const targetUser = users.find((item) => item.uid === member.uid);

    if (targetUser) {
      setSelectedUser(targetUser);
    }

    setMemberMenu(null);
  }

  function blockForMe(member: MemberMenu) {
    setPersonalBlockedUids((current) => (current.includes(member.uid) ? current : [...current, member.uid]));
    setMemberMenu(null);
  }

  async function blockGlobally(member: MemberMenu, minutes: number | "forever") {
    if (!user || !canModerate) {
      return;
    }

    const blockedUntil =
      minutes === "forever"
        ? Timestamp.fromDate(new Date("2099-12-31T23:59:59.000Z"))
        : Timestamp.fromMillis(Date.now() + minutes * 60 * 1000);

    await setDoc(
      doc(db, collections.globalUserBlocks, member.uid),
      {
        uid: member.uid,
        displayName: member.displayName,
        blockedBy: user.uid,
        blockedUntil,
        scope: "global",
        updatedAt: serverTimestamp()
      },
      { merge: true }
    );

    setMemberMenu(null);
  }

  async function deleteMessage(messageItem: ChatMessage) {
    if (!user) {
      return;
    }

    const canDelete = messageItem.uid === user.uid || (canModerate && !selectedUser);

    if (!canDelete || !window.confirm("Удалить сообщение?")) {
      return;
    }

    const messageRef =
      selectedUser && user
        ? doc(db, "directThreads", directThreadId(user.uid, selectedUser.uid), "messages", messageItem.id)
        : doc(db, collections.chatRooms, "global", "messages", messageItem.id);

    await deleteDoc(messageRef);
  }

  function applySelectedFile(file?: File | null) {
    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      return;
    }

    setAttachmentFile(file);
  }

  function insertMention(targetUser: UserProfile) {
    const label = getUserLabel(targetUser);
    setMessage((current) => current.replace(/(^|\s)@([^\s@]*)$/, `$1@${label} `));
    requestAnimationFrame(() => textareaRef.current?.focus());
  }

  async function sendMessage() {
    if (sendingRef.current) {
      return;
    }

    const text = message.trim();

    if ((!text && !attachmentFile) || !user || !profile) {
      return;
    }

    sendingRef.current = true;
    setSending(true);

    try {
      const uploadedAttachment = attachmentFile ? await uploadChatImage(attachmentFile) : null;
      const lastMessageText = text || "Изображение";
      const baseMessage = {
        uid: user.uid,
        displayName: profile.displayName,
        avatarUrl: profile.avatarHiddenByAdmin ? "" : profile.avatarUrl ?? "",
        avatarFrame: profile.avatarFrame ?? "none",
        nicknameStyle: profile.nicknameStyle ?? "plain",
        text,
        attachment: uploadedAttachment
          ? {
              secureUrl: uploadedAttachment.secureUrl,
              url: uploadedAttachment.url,
              alt: attachmentFile?.name ?? "Image"
            }
          : null,
        replyTo: replyTo
          ? {
              id: replyTo.id,
              displayName: replyTo.displayName,
              text: replyTo.text.slice(0, 180)
            }
          : null,
        mentions: selectedUser ? [] : extractMentions(text, users, user.uid),
        createdAt: serverTimestamp()
      };

      if (selectedUser) {
        const threadId = directThreadId(user.uid, selectedUser.uid);
        await setDoc(
          doc(db, "directThreads", threadId),
          {
            participants: [user.uid, selectedUser.uid],
            lastMessageText,
            lastMessageUid: user.uid,
            lastMessageAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          },
          { merge: true }
        );
        await addDoc(collection(db, "directThreads", threadId, "messages"), baseMessage);
      } else {
        await setDoc(
          doc(db, collections.chatRooms, "global"),
          {
            title: "Global",
            type: "global",
            isPublic: true,
            lastMessageText,
            lastMessageUid: user.uid,
            lastMessageAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          },
          { merge: true }
        );
        await addDoc(collection(db, collections.chatRooms, "global", "messages"), {
          ...baseMessage,
          moderationStatus: "visible"
        });
      }

      setMessage("");
      setReplyTo(null);
      setAttachmentFile(null);
      setEmojiOpen(false);
    } finally {
      sendingRef.current = false;
      setSending(false);
    }
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void sendMessage();
  }

  function handlePaste(event: React.ClipboardEvent<HTMLTextAreaElement>) {
    const imageFile = getClipboardImageFile(event.clipboardData, `chat-${Date.now()}.png`);

    if (imageFile) {
      event.preventDefault();
      applySelectedFile(imageFile);
    }
  }

  function renderUserButton(item: UserProfile, compact = false) {
    const label = getUserLabel(item);
    const visibleAvatarUrl = shouldShowAvatar(item.uid, user?.uid, item.avatarHiddenByAdmin) ? item.avatarUrl : "";
    const statusId = item.bpStatus ?? "bronze";
    const avatarFrameClass = getAvatarFrameClass(item.avatarFrame, statusId);
    const nicknameClass = getNicknameClass(item.nicknameStyle, statusId);

    return (
      <button
        key={item.uid}
        type="button"
        onClick={() => {
          setSelectedUser(item);
          setChatMenuOpen(false);
        }}
        className={`flex ${compact ? "w-full" : "min-w-[220px] lg:min-w-0 lg:w-full"} items-center gap-3 rounded-lg p-3 text-left transition ${
          selectedUser?.uid === item.uid ? "border border-violet-400/45 bg-violet-500/15 text-white" : "border border-white/10 bg-white/[0.03] text-zinc-300 hover:bg-white/[0.06]"
        }`}
      >
        <span className={`bp-avatar-chat grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-xl border bg-gradient-to-br from-violet-500 to-cyan-600 text-xs font-black text-white ${avatarFrameClass}`}>
          {visibleAvatarUrl ? <img src={visibleAvatarUrl} alt={label} className="h-full w-full rounded-lg object-cover" /> : label.slice(0, 2).toUpperCase()}
        </span>
        <span className="min-w-0">
          <span className={`block truncate font-semibold ${nicknameClass}`}>{label}</span>
          <span className="block truncate text-xs text-zinc-500">
            {getPublicUserMeta(item)}
          </span>
        </span>
      </button>
    );
  }

  return (
    <>
      <div className="mx-auto grid h-[calc(100dvh-112px)] min-h-[620px] w-full max-w-7xl overflow-hidden rounded-[18px] border border-relic/20 bg-[#05070b]/95 shadow-[0_0_44px_rgba(0,0,0,0.55)] lg:h-[78vh] lg:grid-cols-[330px_1fr]">
        <aside className="hidden min-w-0 border-b border-white/10 bg-[#080e1a] lg:block lg:border-b-0 lg:border-r">
          <div className="border-b border-white/10 p-3 sm:p-4">
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg border border-relic/35 bg-relic/15 text-relic">
                <Users size={20} />
              </span>
              <div className="min-w-0">
                <h2 className="truncate text-lg font-bold text-white">Сообщения</h2>
                <p className="truncate text-sm text-zinc-500">Общий чат и личные диалоги</p>
              </div>
            </div>

            <div className="mt-3 flex items-center gap-2 rounded-md border border-white/10 bg-black/30 px-3 py-2">
              <Search size={16} className="shrink-0 text-zinc-500" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="min-w-0 flex-1 border-0 bg-transparent text-sm text-white placeholder:text-zinc-500 focus:ring-0"
                placeholder="Найти пользователя"
              />
            </div>
          </div>

          <div className="flex max-h-[150px] gap-2 overflow-x-auto p-3 lg:block lg:max-h-[590px] lg:space-y-2 lg:overflow-y-auto">
            <button
              type="button"
              onClick={() => {
                setSelectedUser(null);
                setChatMenuOpen(false);
              }}
              className={`flex min-w-[220px] items-center gap-3 rounded-lg p-3 text-left transition lg:min-w-0 lg:w-full ${
                !selectedUser ? "border border-relic/35 bg-relic/15 text-white" : "border border-white/10 bg-white/[0.03] text-zinc-300 hover:bg-white/[0.06]"
              }`}
            >
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-relic to-amber-700 text-sm font-black text-black">
                G
              </span>
              <span className="min-w-0">
                <span className="block truncate font-semibold">Общий чат</span>
                <span className="block truncate text-xs text-zinc-500">Видят все участники</span>
              </span>
            </button>

            {filteredUsers.map((item) => renderUserButton(item))}

            {user && filteredUsers.length === 0 ? (
              <p className="min-w-[220px] rounded-lg border border-white/10 bg-black/20 p-3 text-sm text-zinc-500 lg:min-w-0">
                Личных диалогов пока нет. Откройте личные сообщения через участника в общем чате.
              </p>
            ) : null}
          </div>
        </aside>

        <section className="relative flex min-h-0 min-w-0 flex-col bg-[#0b1220]/96">
          <header className="flex items-center gap-3 border-b border-relic/15 bg-[#08101c]/96 p-3 sm:p-4">
            <button
              type="button"
              onClick={() => setChatMenuOpen(true)}
              className="grid h-10 w-10 shrink-0 place-items-center rounded-md border border-relic/30 bg-relic/10 text-relic lg:hidden"
              aria-label="Открыть меню чатов"
            >
              <Menu size={19} />
            </button>
            <span className="hidden h-11 w-11 shrink-0 place-items-center rounded-lg border border-white/10 bg-white/[0.04] text-relic lg:grid">
              <MessageSquare size={20} />
            </span>
            <div className="hidden min-w-0 lg:block">
              <h2 className="truncate text-lg font-bold text-white">{selectedUser ? getUserLabel(selectedUser) : "Общий чат"}</h2>
              <p className="truncate text-sm text-zinc-500">{selectedUser ? "Личный диалог" : "Открытая комната портала"}</p>
            </div>
          </header>

          <div
            ref={scrollRef}
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault();
              applySelectedFile(event.dataTransfer.files?.[0]);
            }}
            className="min-h-0 flex-1 overflow-y-auto px-3 py-3 sm:px-5"
          >
            {visibleMessages.map((item) => {
              const own = item.uid === user?.uid;
              const attachmentUrl = item.attachment?.secureUrl ?? item.attachment?.url;
              const attachmentAlt = item.attachment?.alt ?? "Image";
              const initials = (item.displayName || "U").slice(0, 2).toUpperCase();
              const authorProfile = users.find((userItem) => userItem.uid === item.uid);
              const authorStatusId = authorProfile?.bpStatus ?? "bronze";
              const authorAvatarFrameClass = getAvatarFrameClass(authorProfile ? authorProfile.avatarFrame ?? "none" : item.avatarFrame, authorStatusId);
              const authorNicknameClass = getNicknameClass(authorProfile?.nicknameStyle || item.nicknameStyle, authorStatusId);
              const messageAvatarUrl = shouldShowAvatar(item.uid, user?.uid, authorProfile?.avatarHiddenByAdmin)
                ? authorProfile?.avatarUrl || item.avatarUrl
                : "";

              return (
                <div key={item.id} className={`mb-2 flex items-end gap-2 ${own ? "justify-end" : "justify-start"}`}>
                  {!own ? (
                    <button
                      type="button"
                      onClick={() => openMemberMenu(item)}
                      className={`bp-avatar-chat grid h-8 w-8 shrink-0 place-items-center overflow-hidden rounded-lg border bg-gradient-to-br from-violet-500 to-cyan-600 text-[11px] font-black text-white ${authorAvatarFrameClass}`}
                      title={item.displayName}
                    >
                      {messageAvatarUrl ? <img src={messageAvatarUrl} alt={item.displayName} className="h-full w-full object-cover" /> : initials}
                    </button>
                  ) : null}
                  <article
                    className={`group max-w-[82%] rounded-xl px-3 py-2 shadow-lg sm:max-w-[62%] ${
                      own
                        ? "rounded-br-sm border border-relic/35 bg-[linear-gradient(135deg,rgba(35,21,49,0.96),rgba(200,154,61,0.72))] text-white shadow-[0_0_22px_rgba(200,154,61,0.18)]"
                        : "rounded-bl-sm border border-relic/15 bg-[#050a12]/92 text-white shadow-[0_0_20px_rgba(0,0,0,0.32)]"
                    }`}
                  >
                    {!own ? (
                      <button type="button" onClick={() => openMemberMenu(item)} className={`mb-0.5 text-[11px] font-bold hover:text-white ${authorNicknameClass}`}>
                        {item.displayName}
                      </button>
                    ) : null}
                    {item.replyTo ? (
                      <div className="mb-1.5 rounded-md border border-white/10 bg-black/20 p-1.5 text-[11px] leading-4 text-zinc-300">
                        <p className="font-bold text-relic">{item.replyTo.displayName}</p>
                        <p className="line-clamp-2">{item.replyTo.text}</p>
                      </div>
                    ) : null}
                    {attachmentUrl ? (
                      <button
                        type="button"
                        onClick={() => setImagePreview({ url: attachmentUrl, alt: attachmentAlt })}
                        className="mb-1.5 block overflow-hidden rounded-md border border-white/10"
                      >
                        <img src={attachmentUrl} alt={attachmentAlt} className="max-h-44 object-cover" />
                      </button>
                    ) : null}
                    {item.text ? <p className="break-words text-[13px] leading-5">{renderMessageText(item.text, item.mentions)}</p> : null}
                    {!selectedUser ? (
                      <div className="mt-1 flex items-center gap-2 opacity-0 transition focus-within:opacity-100 group-hover:opacity-100">
                        <button
                          type="button"
                          onClick={() => setReplyTo(item)}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-relic hover:text-white"
                        >
                          <CornerDownRight size={13} />
                          Ответить
                        </button>
                        {own || canModerate ? (
                          <button
                            type="button"
                            onClick={() => void deleteMessage(item)}
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-300 hover:text-red-100"
                          >
                            <Trash2 size={12} />
                            Удалить
                          </button>
                        ) : null}
                      </div>
                    ) : own ? (
                      <button
                        type="button"
                        onClick={() => void deleteMessage(item)}
                        className="mt-1 inline-flex items-center gap-1 text-[11px] font-semibold text-red-200 opacity-0 transition hover:text-red-100 focus-visible:opacity-100 group-hover:opacity-100"
                      >
                        <Trash2 size={12} />
                        Удалить
                      </button>
                    ) : null}
                    <p className={`mt-0.5 text-right text-[10px] ${own ? "text-white/65" : "text-zinc-500"}`}>{formatTime(item)}</p>
                  </article>
                </div>
              );
            })}

            {visibleMessages.length === 0 ? (
              <div className="grid min-h-[260px] place-items-center text-center sm:min-h-[360px]">
                <div>
                  <p className="text-xl font-bold text-white">Начни диалог</p>
                  <p className="mt-2 max-w-md text-sm leading-6 text-zinc-500">
                    Выбери пользователя для личного сообщения или напиши в общий чат.
                  </p>
                </div>
              </div>
            ) : null}
          </div>

          <button
            type="button"
            onClick={scrollToBottom}
            className={`absolute right-5 z-10 grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-[#111827]/90 text-relic shadow-lg transition hover:bg-relic hover:text-black ${
              replyTo && attachmentFile ? "bottom-56" : replyTo || attachmentFile ? "bottom-40" : "bottom-24"
            }`}
            aria-label="Прокрутить вниз"
          >
            <ChevronDown size={20} />
          </button>

          {user ? (
            <form onSubmit={handleSubmit} className="border-t border-white/10 bg-[#0d1422] p-3 sm:p-4">
              {replyTo ? (
                <div className="mb-2 flex items-start justify-between gap-3 rounded-md border border-relic/20 bg-relic/[0.08] p-2 text-xs text-zinc-300">
                  <div className="min-w-0">
                    <p className="font-bold text-relic">Ответ: {replyTo.displayName}</p>
                    <p className="truncate">{replyTo.text}</p>
                  </div>
                  <button type="button" onClick={() => setReplyTo(null)} className="text-zinc-500 hover:text-white">
                    <X size={14} />
                  </button>
                </div>
              ) : null}

              {attachmentFile ? (
                <div className="mb-2 flex items-center gap-3 rounded-xl border border-relic/20 bg-black/35 p-2 text-xs text-zinc-300">
                  {attachmentPreviewUrl ? (
                    <img src={attachmentPreviewUrl} alt={attachmentFile.name} className="h-16 w-16 rounded-lg object-cover" />
                  ) : null}
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-white">{attachmentFile.name}</p>
                    <p className="text-zinc-500">Будет отправлено вместе с сообщением</p>
                  </div>
                  <button type="button" onClick={() => setAttachmentFile(null)} className="grid h-8 w-8 place-items-center rounded-md border border-white/10 text-zinc-500 hover:text-white">
                    <X size={14} />
                  </button>
                </div>
              ) : null}

              <div className="flex items-end gap-2">
                <label className="grid h-11 w-11 shrink-0 cursor-pointer place-items-center rounded-md border border-white/10 bg-black/30 text-relic transition hover:bg-white/[0.06]">
                  <ImagePlus size={18} />
                  <input type="file" accept="image/*" className="hidden" onChange={(event) => applySelectedFile(event.target.files?.[0])} />
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setEmojiOpen((current) => !current)}
                    className="grid h-11 w-11 shrink-0 place-items-center rounded-md border border-white/10 bg-black/30 text-relic transition hover:bg-white/[0.06]"
                    aria-label="Открыть смайлики"
                  >
                    <Smile size={18} />
                  </button>
                  {emojiOpen ? (
                    <div className="absolute bottom-[calc(100%+8px)] left-0 z-20 grid w-[214px] grid-cols-5 gap-1 rounded-[16px] border border-relic/20 bg-[#060b13]/98 p-2 shadow-[0_18px_44px_rgba(0,0,0,0.48)] backdrop-blur-xl">
                      {basicEmojis.map((emoji) => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => {
                            setMessage((current) => `${current}${emoji}`);
                            setEmojiOpen(false);
                          }}
                          className="grid h-9 w-9 place-items-center rounded-lg text-xl transition hover:bg-relic/15"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
                <div className="relative min-w-0 flex-1">
                  {mentionSuggestions.length > 0 ? (
                    <div className="absolute bottom-[calc(100%+8px)] left-0 right-0 z-20 overflow-hidden rounded-[16px] border border-relic/20 bg-[#060b13]/98 p-2 shadow-[0_18px_44px_rgba(0,0,0,0.48)] backdrop-blur-xl">
                      {mentionSuggestions.map((item) => (
                        <button
                          key={item.uid}
                          type="button"
                          onClick={() => insertMention(item)}
                          className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm text-zinc-200 transition hover:bg-relic/15 hover:text-white"
                        >
                          <span className="grid h-7 w-7 place-items-center overflow-hidden rounded-full bg-gradient-to-br from-violet-500 to-cyan-600 text-[10px] font-black text-white">
                            {shouldShowAvatar(item.uid, user?.uid, item.avatarHiddenByAdmin) && item.avatarUrl ? (
                              <img src={item.avatarUrl} alt={getUserLabel(item)} className="h-full w-full object-cover" />
                            ) : (
                              getUserLabel(item).slice(0, 2).toUpperCase()
                            )}
                          </span>
                          @{getUserLabel(item)}
                        </button>
                      ))}
                    </div>
                  ) : null}
                  <textarea
                    ref={textareaRef}
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    onPaste={handlePaste}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" && !event.shiftKey) {
                        event.preventDefault();
                        void sendMessage();
                      }
                    }}
                    rows={1}
                    placeholder={selectedUser ? "Личное сообщение..." : "Сообщение в общий чат... используйте @имя"}
                    className="max-h-28 min-h-11 w-full resize-none rounded-md border-white/10 bg-black/30 text-sm text-white placeholder:text-zinc-500 focus:border-relic focus:ring-relic"
                  />
                </div>
                <button disabled={!canSend} className="grid h-11 w-11 shrink-0 place-items-center rounded-md bg-relic text-black transition hover:bg-[#f0c766] disabled:cursor-not-allowed disabled:opacity-50">
                  <Send size={18} />
                </button>
              </div>
            </form>
          ) : (
            <div className="border-t border-white/10 bg-[#0d1422] p-4 text-center text-sm text-zinc-400">
              Для отправки сообщений нужно <Link href="/login" className="font-semibold text-relic">войти</Link>.
            </div>
          )}
        </section>
      </div>

      {chatMenuOpen ? (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm lg:hidden" role="dialog" aria-modal="true">
          <div className="h-full w-[86vw] max-w-sm overflow-y-auto border-r border-relic/25 bg-[#080e1a] p-4 shadow-2xl">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg border border-relic/35 bg-relic/15 text-relic">
                  <Users size={20} />
                </span>
                <div className="min-w-0">
                  <h2 className="truncate text-lg font-bold text-white">Сообщения</h2>
                  <p className="truncate text-sm text-zinc-500">Общий чат и личные диалоги</p>
                </div>
              </div>
              <button type="button" onClick={() => setChatMenuOpen(false)} className="grid h-10 w-10 place-items-center rounded-md border border-white/10 text-zinc-400">
                <X size={18} />
              </button>
            </div>

            <div className="mb-4 flex items-center gap-2 rounded-md border border-white/10 bg-black/30 px-3 py-2">
              <Search size={16} className="shrink-0 text-zinc-500" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="min-w-0 flex-1 border-0 bg-transparent text-sm text-white placeholder:text-zinc-500 focus:ring-0"
                placeholder="Найти пользователя"
              />
            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => {
                  setSelectedUser(null);
                  setChatMenuOpen(false);
                }}
                className={`flex w-full items-center gap-3 rounded-lg p-3 text-left transition ${
                  !selectedUser ? "border border-relic/35 bg-relic/15 text-white" : "border border-white/10 bg-white/[0.03] text-zinc-300"
                }`}
              >
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-relic to-amber-700 text-sm font-black text-black">
                  G
                </span>
                <span className="min-w-0">
                  <span className="block truncate font-semibold">Общий чат</span>
                  <span className="block truncate text-xs text-zinc-500">Видят все участники</span>
                </span>
              </button>

              {filteredUsers.map((item) => renderUserButton(item, true))}

              {user && filteredUsers.length === 0 ? (
                <p className="rounded-lg border border-white/10 bg-black/20 p-3 text-sm leading-5 text-zinc-500">
                  Личных диалогов пока нет. Откройте личные сообщения через участника в общем чате.
                </p>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      {memberMenu ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4 backdrop-blur-sm" role="dialog" aria-modal="true">
          <div className="w-full max-w-sm rounded-lg border border-relic/25 bg-[#0b101b] p-4 shadow-2xl">
            <div className="relative flex min-h-[136px] items-center gap-5 rounded-lg border border-white/10 bg-black/20 p-4">
              <span className={`bp-avatar-chat-preview grid h-24 w-24 shrink-0 place-items-center rounded-xl border bg-gradient-to-br from-violet-500 to-cyan-600 p-[3px] text-2xl font-black text-white ${getAvatarFrameClass(memberMenu.avatarFrame, memberMenu.bpStatus ?? "bronze")}`}>
                <span className="relative z-[1] grid h-full w-full place-items-center overflow-hidden rounded-lg">
                  {memberMenu.avatarUrl ? <img src={memberMenu.avatarUrl} alt={memberMenu.displayName} className="h-full w-full object-cover" /> : memberMenu.displayName.slice(0, 2).toUpperCase()}
                </span>
              </span>
              <div className="min-w-0">
                <p className={`truncate font-bold ${getNicknameClass(memberMenu.nicknameStyle, memberMenu.bpStatus ?? "bronze")}`}>{memberMenu.displayName}</p>
                <p className="text-xs text-zinc-500">Действия с участником</p>
              </div>
              <button type="button" onClick={() => setMemberMenu(null)} className="ml-auto grid h-9 w-9 shrink-0 place-items-center rounded-md border border-white/10 text-zinc-400 hover:text-white">
                <X size={16} />
              </button>
            </div>

            <div className="mt-5 grid gap-2 border-t border-relic/20 pt-4">
              <button type="button" onClick={() => startDirectMessage(memberMenu)} className="rounded-md border border-relic/30 bg-relic/10 px-4 py-3 text-left font-semibold text-relic hover:bg-relic hover:text-black">
                Перейти в личные сообщения
              </button>
              <button type="button" onClick={() => blockForMe(memberMenu)} className="rounded-md border border-white/10 bg-white/[0.04] px-4 py-3 text-left font-semibold text-zinc-200 hover:bg-white/[0.08]">
                Не показывать мне сообщения участника
              </button>

              {canModerate ? (
                <button
                  type="button"
                  onClick={() => void toggleMemberAvatarVisibility(memberMenu)}
                  className={`w-full rounded-md border px-4 py-3 text-left font-semibold transition ${
                    memberMenu.avatarHiddenByAdmin
                      ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-200 hover:bg-emerald-400/15"
                      : "border-ember/35 bg-ember/10 text-ember hover:bg-ember/15"
                  }`}
                >
                  {memberMenu.avatarHiddenByAdmin ? "Показать аватар пользователя" : "Скрыть аватар пользователя"}
                </button>
              ) : null}

              {canModerate ? (
                <div className="mt-2 rounded-md border border-blood/30 bg-blood/10 p-3">
                  <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-ember">Глобальная блокировка</p>
                  <div className="grid grid-cols-3 gap-2">
                    <button type="button" onClick={() => void blockGlobally(memberMenu, 5)} className="rounded-md border border-blood/30 px-2 py-2 text-xs font-bold text-ember hover:bg-blood/20">
                      5 мин
                    </button>
                    <button type="button" onClick={() => void blockGlobally(memberMenu, 30)} className="rounded-md border border-blood/30 px-2 py-2 text-xs font-bold text-ember hover:bg-blood/20">
                      30 мин
                    </button>
                    <button type="button" onClick={() => void blockGlobally(memberMenu, "forever")} className="rounded-md border border-blood/30 px-2 py-2 text-xs font-bold text-ember hover:bg-blood/20">
                      Навсегда
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      {imagePreview ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/85 p-4 backdrop-blur-sm" role="dialog" aria-modal="true">
          <div className="relative max-h-[92vh] max-w-5xl overflow-hidden rounded-lg border border-white/10 bg-[#0b101b] shadow-2xl">
            <button
              type="button"
              onClick={() => setImagePreview(null)}
              className="absolute right-3 top-3 z-10 grid h-10 w-10 place-items-center rounded-md border border-white/10 bg-black/60 text-zinc-300 transition hover:text-white"
              aria-label="Закрыть изображение"
            >
              <X size={18} />
            </button>
            <img src={imagePreview.url} alt={imagePreview.alt} className="max-h-[92vh] w-full object-contain" />
          </div>
        </div>
      ) : null}
    </>
  );
}
