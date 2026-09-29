"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

function applyInsets() {
  const webApp = window.Telegram?.WebApp;
  if (!webApp) return;

  const safe = webApp.safeAreaInset;
  const content = webApp.contentSafeAreaInset;

  if (safe) {
    document.documentElement.style.setProperty("--tg-safe-top", `${safe.top}px`);
    document.documentElement.style.setProperty("--tg-safe-bottom", `${safe.bottom}px`);
  }
  if (content) {
    document.documentElement.style.setProperty("--tg-content-safe-top", `${content.top}px`);
    document.documentElement.style.setProperty("--tg-content-safe-bottom", `${content.bottom}px`);
  }
}

export function TelegramBridge() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const webApp = window.Telegram?.WebApp;
    if (!webApp) return;

    document.documentElement.dataset.telegram = "true";
    webApp.setHeaderColor?.("#f4f0e8");
    webApp.setBackgroundColor?.("#f4f0e8");
    webApp.setBottomBarColor?.("#fbf9f5");
    webApp.expand();
    applyInsets();
    webApp.ready();

    const sync = () => applyInsets();
    webApp.onEvent?.("safeAreaChanged", sync);
    webApp.onEvent?.("contentSafeAreaChanged", sync);

    if (webApp.initData) {
      fetch("/api/telegram/bootstrap", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ initData: webApp.initData }),
      })
        .then(async (response) => {
          if (!response.ok) return null;
          return response.json() as Promise<{ ok: boolean; onboarded: boolean }>;
        })
        .then((result) => {
          if (!result?.ok) return;

          if (!result.onboarded && pathname !== "/onboarding") {
            router.replace("/onboarding");
          }

          if (result.onboarded && pathname === "/onboarding") {
            router.replace("/dashboard");
          }
        })
        .catch(() => undefined);
    }

    return () => {
      webApp.offEvent?.("safeAreaChanged", sync);
      webApp.offEvent?.("contentSafeAreaChanged", sync);
    };
  }, [pathname, router]);

  return null;
}
