export {};

declare global {
  interface Window {
    Telegram?: {
      WebApp?: TelegramWebApp;
    };
  }

  interface TelegramWebApp {
    initData: string;
    initDataUnsafe?: {
      user?: {
        id: number;
        first_name?: string;
        last_name?: string;
        username?: string;
        language_code?: string;
        photo_url?: string;
      };
      start_param?: string;
    };
    colorScheme?: "light" | "dark";
    themeParams?: Record<string, string | undefined>;
    safeAreaInset?: { top: number; bottom: number; left: number; right: number };
    contentSafeAreaInset?: { top: number; bottom: number; left: number; right: number };
    HapticFeedback?: {
      impactOccurred?: (style: "light" | "medium" | "heavy" | "rigid" | "soft") => void;
      selectionChanged?: () => void;
      notificationOccurred?: (type: "error" | "success" | "warning") => void;
    };
    ready: () => void;
    expand: () => void;
    setHeaderColor?: (color: string) => void;
    setBackgroundColor?: (color: string) => void;
    setBottomBarColor?: (color: string) => void;
    onEvent?: (event: string, cb: () => void) => void;
    offEvent?: (event: string, cb: () => void) => void;
  }
}
