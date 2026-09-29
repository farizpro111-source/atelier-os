import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getVerifiedTelegramUser } from "@/lib/telegram/server";
import { signSession } from "@/lib/telegram/session-token";
import { SESSION_COOKIE } from "@/lib/auth";

export async function POST(request: Request) {
  if (!process.env.SUPABASE_SECRET_KEY || !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.TELEGRAM_BOT_TOKEN) {
    return NextResponse.json(
      { ok: false, configured: false },
      { status: 503 },
    );
  }

  const body = await request.json().catch(() => null);
  const initData = typeof body?.initData === "string" ? body.initData : "";
  const telegramUser = getVerifiedTelegramUser(initData);

  if (!telegramUser) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const admin = createAdminClient();

  const { data: appUser, error: identityError } = await admin
    .from("app_users")
    .upsert(
      {
        telegram_user_id: telegramUser.id,
        first_name: telegramUser.first_name ?? null,
        last_name: telegramUser.last_name ?? null,
        username: telegramUser.username ?? null,
        photo_url: telegramUser.photo_url ?? null,
        language_code: telegramUser.language_code ?? null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "telegram_user_id" },
    )
    .select("id")
    .single();

  if (identityError || !appUser) {
    return NextResponse.json(
      { ok: false, reason: "identity_link_failed" },
      { status: 500 },
    );
  }

  const { count, error: membershipError } = await admin
    .from("organization_members")
    .select("organization_id", { count: "exact", head: true })
    .eq("user_id", appUser.id);

  if (membershipError) {
    return NextResponse.json(
      { ok: false, reason: "membership_check_failed" },
      { status: 500 },
    );
  }

  const response = NextResponse.json(
    {
      ok: true,
      onboarded: (count ?? 0) > 0,
    },
    { headers: { "Cache-Control": "private, no-store" } },
  );
  response.cookies.set(SESSION_COOKIE, signSession(appUser.id, process.env.TELEGRAM_BOT_TOKEN), {
    httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 43200,
  });
  return response;
}
