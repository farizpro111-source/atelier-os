"use client";

import { useSyncExternalStore } from "react";

function subscribe() {
  return () => undefined;
}

function getSnapshot() {
  const user = window.Telegram?.WebApp?.initDataUnsafe?.user;
  if (!user) return "";
  return JSON.stringify({
    name: user.first_name || user.username || "Профиль",
    photo: user.photo_url || "",
  });
}

function getServerSnapshot() {
  return "";
}

export function TelegramUserPill() {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const data = snapshot ? JSON.parse(snapshot) as { name: string; photo: string } : null;
  const name = data?.name || "Aruzhan";
  const photo = data?.photo;

  return (
    <div className="flex h-10 items-center gap-2 rounded-[14px] border border-black/[.08] bg-white/80 py-1 pl-1 pr-2.5 shadow-sm">
      {photo ? (
        // Telegram provides the URL after the app is launched inside Telegram.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={photo} alt="" className="size-8 rounded-[11px] object-cover" />
      ) : (
        <div className="grid size-8 place-items-center rounded-[11px] bg-[#1b1c18] text-[11px] font-extrabold text-white">
          {name.slice(0, 1).toUpperCase()}
        </div>
      )}
      <span className="max-w-20 truncate text-[11px] font-extrabold">{name}</span>
    </div>
  );
}
