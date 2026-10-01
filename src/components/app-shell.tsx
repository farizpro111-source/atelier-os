import { Settings, Scissors } from "lucide-react";
import Link from 'next/link';
import { BottomNav } from "@/components/nav";
import { TelegramUserPill } from "@/components/telegram-user-pill";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto min-h-[100dvh] w-full max-w-[1100px]">
      <header className="app-safe-top sticky top-0 z-40 border-b border-black/[.065] bg-[#f6f2ea]/92 backdrop-blur-2xl">
        <div className="flex h-[64px] items-center justify-between px-4 sm:px-5">
          <div className="flex items-center gap-2.5">
            <div className="grid size-9 place-items-center rounded-[13px] bg-[#191a17] text-white shadow-[0_7px_18px_rgba(25,26,23,.16)]">
              <Scissors className="size-4" strokeWidth={2.4} />
            </div>
            <div>
              <div className="text-[13px] font-extrabold tracking-[.11em]">ATELIER</div>
              <div className="-mt-0.5 text-[10px] font-semibold text-black/38">BEAUTY OS</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/settings"
              aria-label="Настройки профиля"
              className="grid size-10 place-items-center rounded-[14px] border border-black/[.08] bg-white/80 text-black/60 shadow-sm"
            >
              <Settings className="size-[17px]" strokeWidth={2.2} />
            </Link>
            <TelegramUserPill />
          </div>
        </div>
      </header>

      <main className="px-4 pb-[calc(104px+var(--tg-safe-bottom)+var(--tg-content-safe-bottom))] pt-5 sm:px-5 sm:pt-6 md:px-7">
        {children}
      </main>

      <BottomNav />
    </div>
  );
}
