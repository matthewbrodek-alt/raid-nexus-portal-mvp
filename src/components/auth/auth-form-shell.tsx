import Link from "next/link";
import { RaidLogo } from "@/components/brand/raid-logo";

type AuthFormShellProps = {
  children: React.ReactNode;
  mode: "login" | "register";
};

export function AuthFormShell({ children, mode }: AuthFormShellProps) {
  return (
    <main className="min-h-dvh overflow-x-hidden bg-raid-radial px-4 py-6 text-pale sm:py-8">
      <div className="mx-auto grid min-h-[calc(100dvh-3rem)] w-full max-w-6xl items-center gap-6 lg:grid-cols-[0.78fr_minmax(0,1fr)]">
        <section className="min-w-0 text-center lg:text-left">
          <Link href="/" className="inline-flex max-w-full items-center justify-center">
            <RaidLogo compact imageClassName="!h-[140px] !max-w-full sm:!h-[160px]" />
          </Link>
          <p className="mt-4 text-xs font-bold tracking-[0.22em] text-relic">
            {mode === "login" ? "Возвращение в цитадель" : "Регистрация игрока"}
          </p>
          <h1 className="mx-auto mt-3 max-w-xl text-3xl font-black leading-tight tracking-tight text-white sm:text-4xl md:text-5xl lg:mx-0">
            {mode === "login" ? "Вход в личный кабинет" : "Создание аккаунта портала"}
          </h1>
        </section>

        <div className="min-w-0 w-full max-w-xl justify-self-center lg:max-w-2xl">{children}</div>
      </div>
    </main>
  );
}
