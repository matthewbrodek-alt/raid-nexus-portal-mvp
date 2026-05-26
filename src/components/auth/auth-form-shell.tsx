import Link from "next/link";
import { RaidLogo } from "@/components/brand/raid-logo";

type AuthFormShellProps = {
  children: React.ReactNode;
  mode: "login" | "register";
};

export function AuthFormShell({ children, mode }: AuthFormShellProps) {
  return (
    <main className="min-h-screen bg-raid-radial px-4 py-10 text-pale">
      <div className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-6xl items-center gap-8 lg:grid-cols-[0.85fr_1fr]">
        <section>
          <Link href="/" className="inline-flex items-center gap-3">
            <RaidLogo compact withBumpyPay className="-ml-1" />
          </Link>
          <p className="mt-8 text-xs uppercase tracking-[0.28em] text-relic">
            {mode === "login" ? "Возвращение в цитадель" : "Регистрация игрока"}
          </p>
          <h1 className="mt-4 text-4xl font-black tracking-tight text-white md:text-5xl">
            {mode === "login" ? "Вход в личный кабинет" : "Создание аккаунта портала"}
          </h1>
          <p className="mt-5 max-w-xl text-sm leading-7 text-zinc-400">
            Один вход открывает личный кабинет, историю заявок, чат, будущие форумные треды и админ-панель для
            пользователей с повышенной ролью.
          </p>
        </section>
        {children}
      </div>
    </main>
  );
}
