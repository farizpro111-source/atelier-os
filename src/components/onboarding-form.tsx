"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Building2 } from "lucide-react";

export function OnboardingForm() {
  const router = useRouter();
  const [salonName, setSalonName] = useState("");
  const [branchName, setBranchName] = useState("Основной филиал");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const initData = window.Telegram?.WebApp?.initData;
    if (!initData) {
      setError("Откройте приложение внутри Telegram.");
      return;
    }

    setLoading(true);

    try {
      const bootstrap = await fetch('/api/telegram/bootstrap', {
        method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ initData }),
      });
      if (!bootstrap.ok) throw new Error('Не удалось подтвердить Telegram-сессию. Откройте приложение заново.');
      const response = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ initData, salonName, branchName }),
      });

      const result = await response.json();

      if (!response.ok || !result.ok) {
        throw new Error(result.reason || "Не удалось создать салон.");
      }

      window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred?.("success");
      router.replace("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Произошла ошибка.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="mt-6 space-y-4">
      <label className="block">
        <span className="mb-2 flex items-center gap-2 text-[11px] font-extrabold text-black/58">
          <Building2 className="size-3.5" />
          Название салона
        </span>
        <input
          value={salonName}
          onChange={(event) => setSalonName(event.target.value)}
          minLength={2}
          maxLength={80}
          required
          placeholder="Например, Atelier 21"
          className="h-12 w-full rounded-[15px] border border-black/[.09] bg-white px-3.5 text-[13px] font-bold outline-none focus:border-[#a98652]/60 focus:ring-4 focus:ring-[#a98652]/10"
        />
      </label>

      <label className="block">
        <span className="mb-2 block text-[11px] font-extrabold text-black/58">
          Первый филиал
        </span>
        <input
          value={branchName}
          required
          minLength={2}
          onChange={(event) => setBranchName(event.target.value)}
          maxLength={80}
          className="h-12 w-full rounded-[15px] border border-black/[.09] bg-white px-3.5 text-[13px] font-bold outline-none focus:border-[#a98652]/60 focus:ring-4 focus:ring-[#a98652]/10"
        />
      </label>

      {error ? (
        <div role="alert" className="rounded-[14px] bg-[#f5e5e2] px-3.5 py-3 text-[11px] font-bold text-[#9b5047]">
          {error}
        </div>
      ) : null}

      <button
        disabled={loading || salonName.trim().length < 2}
        className="flex h-12 w-full items-center justify-center gap-2 rounded-[15px] bg-[#191a17] text-[12px] font-extrabold text-white shadow-[0_12px_28px_rgba(25,26,23,.18)] disabled:opacity-45"
      >
        {loading ? "Создаём…" : "Создать пространство"}
        {!loading ? <ArrowRight className="size-4" /> : null}
      </button>
    </form>
  );
}
