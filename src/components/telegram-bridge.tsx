"use client";

import { useEffect } from "react";

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
      fetch("/api/telegram/validate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ initData: webApp.initData }),
      }).catch(() => undefined);
    }

    return () => {
      webApp.offEvent?.("safeAreaChanged", sync);
      webApp.offEvent?.("contentSafeAreaChanged", sync);
    };
  }, []);

  return null;
}
