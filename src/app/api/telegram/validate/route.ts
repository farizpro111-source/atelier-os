import { NextResponse } from "next/server";
import { getVerifiedTelegramUser } from "@/lib/telegram/server";
export async function POST(request: Request) {
  if (!process.env.TELEGRAM_BOT_TOKEN) return NextResponse.json({ ok: false, configured: false }, { status: 503 });
  const body = await request.json().catch(() => null);
  const user = getVerifiedTelegramUser(typeof body?.initData === "string" ? body.initData : "");
  return NextResponse.json({ ok: !!user }, { status: user ? 200 : 401, headers: { "Cache-Control": "private, no-store" } });
}
