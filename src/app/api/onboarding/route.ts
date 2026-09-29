import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getVerifiedTelegramUser } from "@/lib/telegram/server";
import { z } from "zod";

const schema = z.object({ initData: z.string().max(16384), salonName: z.string().trim().min(2).max(80), branchName: z.string().trim().min(2).max(80) });
export async function POST(request: Request) {
  if (!process.env.SUPABASE_SECRET_KEY || !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.TELEGRAM_BOT_TOKEN) return NextResponse.json({ ok: false, reason: "Сервис ещё не настроен." }, { status: 503 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ ok: false, reason: "Проверьте название салона и филиала (2–80 символов)." }, { status: 400 });
  const user = getVerifiedTelegramUser(parsed.data.initData);
  if (!user) return NextResponse.json({ ok: false, reason: "Сессия истекла. Откройте приложение заново из Telegram." }, { status: 401 });
  const db = createAdminClient();
  const { data, error } = await db.rpc("onboard_salon", { telegram_id: user.id, salon_name: parsed.data.salonName, branch_name: parsed.data.branchName });
  if (error) return NextResponse.json({ ok: false, reason: "Не удалось создать салон. Повторите попытку — дубликат не появится." }, { status: 500 });
  return NextResponse.json({ ok: true, organizationId: data }, { headers: { "Cache-Control": "private, no-store" } });
}
