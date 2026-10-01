"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  ContactRound,
  Grid2X2,
  LayoutDashboard,
  WalletCards,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { telegramHaptic } from "@/lib/telegram/client";

const items = [
  { href: "/dashboard", label: "Обзор", icon: LayoutDashboard },
  { href: "/appointments", label: "Записи", icon: CalendarDays },
  { href: "/clients", label: "Клиенты", icon: ContactRound },
  { href: "/finance", label: "Финансы", icon: WalletCards },
  { href: "/settings", label: "Ещё", icon: Grid2X2 },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="app-safe-bottom fixed inset-x-0 bottom-0 z-50 mx-auto w-full max-w-[1100px] border-t border-black/[.07] bg-[#fbf9f5]/94 px-2 pt-2 shadow-[0_-12px_36px_rgba(45,38,28,.07)] backdrop-blur-2xl">
      <div className="grid grid-cols-5 pb-2">
        {items.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href) || (href === '/settings' && ['/services', '/staff', '/analytics'].some(p => pathname.startsWith(p)));
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? 'page' : undefined}
              onClick={() => telegramHaptic("selection")}
              className={cn(
                "group flex min-h-[54px] flex-col items-center justify-center gap-1 rounded-[15px] px-1 text-[10px] font-bold transition",
                active ? "text-[#181916]" : "text-black/38",
              )}
            >
              <span className={cn(
                "grid h-7 min-w-10 place-items-center rounded-full transition",
                active ? "bg-[#e8ddca] shadow-[0_3px_12px_rgba(169,134,82,.13)]" : "group-active:bg-black/[.04]",
              )}>
                <Icon className="size-[18px]" strokeWidth={active ? 2.5 : 2.1} />
              </span>
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
