export function getTelegramWebApp() {
  if (typeof window === "undefined") return undefined;
  return window.Telegram?.WebApp;
}

export function telegramHaptic(type: "selection" | "light" | "success" = "light") {
  const haptic = getTelegramWebApp()?.HapticFeedback;
  if (!haptic) return;

  if (type === "selection") haptic.selectionChanged?.();
  else if (type === "success") haptic.notificationOccurred?.("success");
  else haptic.impactOccurred?.("light");
}
