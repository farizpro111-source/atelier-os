import { validateTelegramInitData } from "@/lib/telegram/validate-init-data";

export type VerifiedTelegramUser = {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  photo_url?: string;
};

export function getVerifiedTelegramUser(initData: string) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;

  if (!botToken || !initData || !validateTelegramInitData(initData, botToken)) {
    return null;
  }

  const params = new URLSearchParams(initData);
  const authDate = Number(params.get("auth_date") || 0);
  const ageSeconds = Math.floor(Date.now() / 1000) - authDate;

  if (!authDate || ageSeconds > 43200 || ageSeconds < -60) {
    return null;
  }

  try {
    const user = JSON.parse(params.get("user") || "null") as VerifiedTelegramUser | null;
    if (!user || !Number.isSafeInteger(user.id)) return null;
    return user;
  } catch {
    return null;
  }
}
