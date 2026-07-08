"use client";

import type React from "react";
import { MessageCircle, Send, ShieldCheck } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { getSocialProviderLabel, type SocialProvider } from "@/lib/auth/social-providers";

type SocialAuthButtonsProps = {
  mode: "login" | "register";
};

const providers: Array<{
  accent: string;
  description: string;
  icon: React.ReactNode;
  id: SocialProvider;
}> = [
  {
    id: "telegram",
    icon: <Send size={18} />,
    accent: "from-sky-500/20 to-cyan-400/10 text-sky-200 hover:border-sky-300/60",
    description: "быстрый вход для чатов и заявок"
  },
  {
    id: "vk",
    icon: <span className="text-sm font-black">VK</span>,
    accent: "from-blue-500/20 to-indigo-400/10 text-blue-200 hover:border-blue-300/60",
    description: "удобно для игроков из VK"
  },
  {
    id: "discord",
    icon: <MessageCircle size={18} />,
    accent: "from-violet-500/20 to-fuchsia-400/10 text-violet-200 hover:border-violet-300/60",
    description: "для кланов и комьюнити"
  }
];

function getReturnTo(searchParams: URLSearchParams) {
  const returnTo = searchParams.get("returnTo");

  if (returnTo?.startsWith("/") && !returnTo.startsWith("//")) {
    return returnTo;
  }

  return "/dashboard";
}

export function SocialAuthButtons({ mode }: SocialAuthButtonsProps) {
  const searchParams = useSearchParams();
  const returnTo = getReturnTo(searchParams);

  return (
    <section className="mt-5 border-t border-white/10 pt-5">
      <div className="flex items-center gap-3">
        <span className="h-px flex-1 bg-white/10" />
        <span className="text-xs font-bold text-zinc-500">{mode === "login" ? "или войти через" : "или создать через"}</span>
        <span className="h-px flex-1 bg-white/10" />
      </div>

      <div className="mt-4 grid gap-3">
        {providers.map((provider) => {
          const href = `/api/auth/social/${provider.id}/start?returnTo=${encodeURIComponent(returnTo)}`;

          return (
            <a
              key={provider.id}
              href={href}
              className={`group flex items-center gap-3 rounded-2xl border border-white/10 bg-gradient-to-r ${provider.accent} px-4 py-3 transition duration-200 hover:-translate-y-0.5 hover:bg-white/[0.08]`}
            >
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white/10 bg-black/30 text-current">
                {provider.icon}
              </span>
              <span className="min-w-0 text-left">
                <span className="block text-sm font-black text-white">Продолжить с {getSocialProviderLabel(provider.id)}</span>
                <span className="block truncate text-xs font-semibold text-zinc-400">{provider.description}</span>
              </span>
              <ShieldCheck size={16} className="ml-auto shrink-0 opacity-50 transition group-hover:opacity-100" />
            </a>
          );
        })}
      </div>

      <p className="mt-4 text-xs leading-5 text-zinc-500">
        Продолжая вход через соцсеть, вы принимаете условия портала и соглашаетесь на обработку данных профиля для авторизации.
      </p>
    </section>
  );
}
