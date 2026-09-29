import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getVerifiedTelegramUser } from "@/lib/telegram/server";

function slugify(value: string) {
  const base = value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 42);

  return base || "salon";
}

export async function POST(request: Request) {
  if (!process.env.SUPABASE_SECRET_KEY) {
    return NextResponse.json({ ok: false, configured: false }, { status: 503 });
  }

  const body = await request.json().catch(() => null);
  const initData = typeof body?.initData === "string" ? body.initData : "";
  const telegramUser = getVerifiedTelegramUser(initData);

  if (!telegramUser) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const salonName =
    typeof body?.salonName === "string" ? body.salonName.trim() : "";
  const branchName =
    typeof body?.branchName === "string" ? body.branchName.trim() : "";

  if (salonName.length < 2 || salonName.length > 80) {
    return NextResponse.json(
      { ok: false, reason: "invalid_salon_name" },
      { status: 400 },
    );
  }

  const admin = createAdminClient();

  const { data: appUser, error: appUserError } = await admin
    .from("app_users")
    .select("id")
    .eq("telegram_user_id", telegramUser.id)
    .single();

  if (appUserError || !appUser) {
    return NextResponse.json(
      { ok: false, reason: "telegram_identity_missing" },
      { status: 409 },
    );
  }

  const { count: membershipCount } = await admin
    .from("organization_members")
    .select("organization_id", { count: "exact", head: true })
    .eq("user_id", appUser.id);

  if ((membershipCount ?? 0) > 0) {
    return NextResponse.json({ ok: true, alreadyOnboarded: true });
  }

  const slug = `${slugify(salonName)}-${crypto.randomUUID().slice(0, 8)}`;

  const { data: organization, error: orgError } = await admin
    .from("organizations")
    .insert({
      name: salonName,
      slug,
      timezone: "Asia/Almaty",
      currency: "KZT",
    })
    .select("id")
    .single();

  if (orgError || !organization) {
    return NextResponse.json(
      { ok: false, reason: "organization_create_failed" },
      { status: 500 },
    );
  }

  const { error: memberError } = await admin
    .from("organization_members")
    .insert({
      organization_id: organization.id,
      user_id: appUser.id,
      role: "owner",
    });

  if (memberError) {
    return NextResponse.json(
      { ok: false, reason: "membership_create_failed" },
      { status: 500 },
    );
  }

  const { error: branchError } = await admin
    .from("branches")
    .insert({
      organization_id: organization.id,
      name: branchName || "Основной филиал",
      timezone: "Asia/Almaty",
    });

  if (branchError) {
    return NextResponse.json(
      { ok: false, reason: "branch_create_failed" },
      { status: 500 },
    );
  }

  return NextResponse.json(
    { ok: true, organizationId: organization.id },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}
