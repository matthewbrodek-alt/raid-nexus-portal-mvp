"use client";

import {
  Archive,
  ChevronDown,
  Hash,
  Menu,
  Mic,
  Paperclip,
  Pin,
  Search,
  Send,
  Settings,
  Shield,
  Smile
} from "lucide-react";
import { useMemo, useState } from "react";

type ChatMessage = {
  id: string;
  date: string;
  author: string;
  avatar: string;
  color: string;
  text: string;
  time: string;
  reactions: Array<keyof typeof reactionText>;
  attachment?: "raid-screenshot";
  own?: boolean;
};

const reactionText = {
  like: "like",
  fire: "fire",
  pin: "pin"
};

const tags = [
  { label: "global", count: 128, active: true },
  { label: "arena", count: 42, active: false },
  { label: "hydra", count: 37, active: false },
  { label: "market", count: 19, active: false },
  { label: "top-up", count: 12, active: false },
  { label: "guides", count: 31, active: false }
];

const initialMessages: ChatMessage[] = [
  {
    id: "m1",
    date: "Сегодня",
    author: "Raid Manager",
    avatar: "RM",
    color: "from-amber-500 to-red-700",
    text: "Пакеты на weekend string уже доступны. Для резерва оставьте заявку в Донат.",
    time: "12:04",
    reactions: ["fire", "like"]
  },
  {
    id: "m2",
    date: "Сегодня",
    author: "Arena Lead",
    avatar: "AL",
    color: "from-cyan-400 to-blue-700",
    text: "Для speed race против Arbiter держите lead 360+ с учетом aura, glyphs и live arena bonus.",
    time: "12:09",
    reactions: []
  },
  {
    id: "m3",
    date: "Сегодня",
    author: "Hydra Team",
    avatar: "HY",
    color: "from-emerald-400 to-green-800",
    text: "В треде закрепил скрин новой ротации Hydra и варианты провокации.",
    time: "12:16",
    reactions: ["pin"],
    attachment: "raid-screenshot"
  }
];

function getCurrentTime() {
  return new Intl.DateTimeFormat("ru-RU", {
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date());
}

function MessageList({ messages }: { messages: ChatMessage[] }) {
  let lastDate = "";

  return (
    <>
      {messages.map((item) => {
        const showDate = item.date !== lastDate;
        lastDate = item.date;

        return (
          <div key={item.id}>
            {showDate ? (
              <div className="my-3 flex justify-center">
                <span className="rounded-full bg-[#303942] px-4 py-1.5 text-sm font-semibold text-white shadow">
                  {item.date}
                </span>
              </div>
            ) : null}

            <div className={`mb-4 flex items-end gap-2 ${item.own ? "justify-end" : "justify-start"}`}>
              {!item.own ? (
                <div className={`grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br ${item.color} text-xs font-black text-white ring-2 ring-[#222a32]`}>
                  {item.avatar}
                </div>
              ) : null}

              <article className={`max-w-[84%] overflow-hidden rounded-2xl shadow-lg md:max-w-[72%] ${
                item.own
                  ? "rounded-br-md bg-gradient-to-br from-blood to-violet-700 text-white shadow-blood"
                  : "rounded-bl-md bg-[#343c45] text-white"
              }`}>
                {!item.own ? (
                  <div className="px-3 pt-2">
                    <p className="text-sm font-bold text-relic">{item.author}</p>
                  </div>
                ) : null}

                {item.attachment === "raid-screenshot" ? (
                  <div className="mt-1 aspect-[4/3] w-full min-w-[300px] bg-gradient-to-br from-[#202631] via-[#60402b] to-[#11161d] p-4">
                    <div className="flex h-full flex-col justify-between rounded-lg border border-relic/30 bg-black/25 p-4">
                      <div>
                        <p className="text-xs uppercase tracking-[0.18em] text-relic">Raid screenshot</p>
                        <p className="mt-2 text-xl font-black text-white">Hydra Rotation</p>
                      </div>
                      <p className="text-sm text-zinc-300">Provoke, Hex, Block Buffs</p>
                    </div>
                  </div>
                ) : (
                  <p className="whitespace-pre-wrap px-3 pb-1 pt-2 text-[15px] leading-6">{item.text}</p>
                )}

                <div className="flex items-center justify-between gap-3 px-3 pb-2 pt-1">
                  <div className="flex gap-1">
                    {item.reactions.map((reaction) => (
                      <span key={reaction} className="rounded-full bg-black/20 px-2 py-0.5 text-xs text-white">
                        {reactionText[reaction]}
                      </span>
                    ))}
                  </div>
                  <span className="ml-auto text-xs text-zinc-400">{item.time}</span>
                </div>
              </article>
            </div>
          </div>
        );
      })}
    </>
  );
}

export function ChatWindow() {
  const [message, setMessage] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(initialMessages);
  const canSend = useMemo(() => message.trim().length > 0, [message]);

  function sendMessage() {
    const text = message.trim();

    if (!text) {
      return;
    }

    setChatMessages((items) => [
      ...items,
      {
        id: `local-${Date.now()}`,
        date: "Сегодня",
        author: "Вы",
        avatar: "YOU",
        color: "from-relic to-amber-700",
        text,
        time: getCurrentTime(),
        reactions: [],
        own: true
      }
    ]);
    setMessage("");
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    sendMessage();
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  }

  return (
    <div className="mx-auto flex h-[calc(100vh-104px)] min-h-[720px] w-full max-w-7xl overflow-hidden rounded-lg border border-white/10 bg-[#11161d] shadow-2xl">
      <aside className="hidden w-[72px] shrink-0 flex-col items-center justify-between border-r border-white/10 bg-[#0d1118] py-4 lg:flex">
        <div className="space-y-4">
          <button className="grid h-11 w-11 place-items-center rounded-xl bg-relic text-black" aria-label="Теги">
            <Hash size={20} />
          </button>
          {[Menu, Archive, Shield].map((Icon, index) => (
            <button key={index} className="grid h-11 w-11 place-items-center rounded-xl text-zinc-500 transition hover:bg-white/[0.06] hover:text-white" aria-label="Меню чата">
              <Icon size={19} />
            </button>
          ))}
        </div>
        <button className="grid h-11 w-11 place-items-center rounded-xl text-zinc-500 transition hover:bg-white/[0.06] hover:text-white" aria-label="Настройки">
          <Settings size={19} />
        </button>
      </aside>

      <aside className="hidden w-[330px] shrink-0 border-r border-white/10 bg-[#121722] xl:block">
        <div className="border-b border-white/10 p-5">
          <div className="flex items-center gap-3">
            <div className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-gradient-to-br from-blood to-relic text-sm font-black text-white shadow-glow">
              RM
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h2 className="truncate text-lg font-bold text-white">Raid Manager</h2>
                <span className="rounded-full border border-relic/40 bg-relic/15 px-2 py-0.5 text-[11px] font-bold uppercase tracking-[0.12em] text-relic">
                  админ
                </span>
              </div>
              <p className="mt-1 text-sm text-zinc-500">online, модерация чата</p>
            </div>
          </div>

          <div className="mt-5 flex items-center gap-2 rounded-full border border-white/10 bg-black/30 px-3 py-2">
            <Search size={16} className="text-zinc-500" />
            <input className="min-w-0 flex-1 border-0 bg-transparent text-sm text-white placeholder:text-zinc-500 focus:ring-0" placeholder="Поиск по тегам" />
          </div>
        </div>

        <div className="px-5 pt-5">
          <p className="text-xs uppercase tracking-[0.22em] text-relic">Теги</p>
        </div>

        <div className="space-y-2 p-3">
          {tags.map((tag) => (
            <button
              key={tag.label}
              className={`flex w-full items-center justify-between rounded-lg px-4 py-3 text-left transition ${
                tag.active ? "bg-gradient-to-r from-blood to-violet-700 text-white" : "bg-black/20 text-zinc-300 hover:bg-white/[0.05]"
              }`}
            >
              <span className="flex items-center gap-2">
                <Hash size={16} />
                {tag.label}
              </span>
              <span className={`rounded-full px-2 py-0.5 text-xs ${tag.active ? "bg-white/15 text-white" : "bg-relic/15 text-relic"}`}>
                {tag.count}
              </span>
            </button>
          ))}
        </div>
      </aside>

      <section className="relative flex min-w-0 flex-1 flex-col bg-[#171d28]">
        <header className="flex items-center gap-3 border-b border-white/10 bg-[#111722]/95 px-4 py-3 backdrop-blur-xl">
          <div className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-md bg-white">
            <div className="grid h-full w-full grid-cols-2 grid-rows-2 gap-px p-1">
              <span className="rounded-sm bg-cyan-300" />
              <span className="rounded-sm bg-relic" />
              <span className="rounded-sm bg-pink-300" />
              <span className="rounded-sm bg-emerald-300" />
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 text-sm font-semibold text-[#ffb35c]">
              <span className="h-7 border-l-2 border-[#ffb35c]" />
              <span className="truncate">Закреплённое сообщение</span>
            </div>
            <p className="truncate text-base font-bold tracking-[0.12em] text-white">НАВИГАЦИЯ 1 Raid Nexus Chat</p>
          </div>
          <button className="grid h-10 w-10 place-items-center rounded-full text-zinc-400 hover:bg-white/[0.06] hover:text-white" aria-label="Закреп">
            <Pin size={18} />
          </button>
          <button className="grid h-10 w-10 place-items-center rounded-full text-zinc-400 hover:bg-white/[0.06] hover:text-white" aria-label="Поиск">
            <Search size={18} />
          </button>
        </header>

        <div className="relative flex-1 overflow-hidden">
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: "radial-gradient(circle at 1px 1px, #fff 1px, transparent 0)",
              backgroundSize: "22px 22px"
            }}
          />
          <div className="relative h-full overflow-y-auto px-4 pb-28 pt-4 md:px-10">
            <MessageList messages={chatMessages} />
          </div>
          <button className="absolute bottom-24 right-5 grid h-12 w-12 place-items-center rounded-full bg-[#3c4650] text-white shadow-xl" aria-label="Вниз">
            <ChevronDown size={24} />
          </button>
        </div>

        <form className="absolute inset-x-0 bottom-0 border-t border-black/40 bg-[#202834] px-4 py-3" onSubmit={handleSubmit}>
          <div className="flex items-end gap-2">
            <button type="button" className="grid h-11 w-11 place-items-center rounded-full text-zinc-400 hover:bg-white/[0.06] hover:text-white" aria-label="Вложение">
              <Paperclip size={22} />
            </button>
            <div className="flex min-w-0 flex-1 items-end gap-2 rounded-full border border-white/10 bg-black/25 px-4">
              <textarea
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Сообщение..."
                rows={1}
                className="max-h-28 min-h-11 min-w-0 flex-1 resize-none border-0 bg-transparent py-2.5 text-[15px] leading-6 text-white placeholder:text-zinc-500 focus:ring-0"
              />
              <button type="button" className="grid h-11 w-9 place-items-center text-zinc-400 hover:text-white" aria-label="Смайлы">
                <Smile size={20} />
              </button>
            </div>
            <button className="grid h-11 w-11 place-items-center rounded-full bg-relic text-black hover:bg-[#f0c766]" aria-label="Отправить" type="submit">
              {canSend ? <Send size={18} /> : <Mic size={20} />}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
