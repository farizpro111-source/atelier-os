import { NextResponse } from "next/server";
import { validateTelegramInitData } from "@/lib/telegram/validate-init-data";

export async function POST(request: Request) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    return NextResponse.json(
      { ok: false, configured: false },
      { status: 503 },
    );
  }

  const body = await request.json().catch(() => null);
  const initData = body?.initData;

  if (typeof initData !== "string" || !initData) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const valid = validateTelegramInitData(initData, token);

  if (!valid) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const params = new URLSearchParams(initData);
  const authDate = Number(params.get("auth_date") || 0);
  const ageSeconds = Math.floor(Date.now() / 1000) - authDate;

  if (!authDate || ageSeconds > 3600 || ageSeconds < -60) {
    return NextResponse.json({ ok: false, reason: "stale_init_data" }, { status: 401 });
  }

  let user = null;
  try {
    user = JSON.parse(params.get("user") || "null");
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  return NextResponse.json({ ok: true, user });
}
