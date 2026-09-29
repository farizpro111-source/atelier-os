import "server-only";
import { cookies } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifySession } from "@/lib/telegram/session-token";

export const SESSION_COOKIE = "atelier-session";
export async function actor() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const id = verifySession(token, process.env.TELEGRAM_BOT_TOKEN || "");
  if (!id) return null;
  const db = createAdminClient();
  const { data, error } = await db.from("app_users").select("id,first_name,last_name,telegram_user_id").eq("id", id).maybeSingle();
  if (error) throw new Error("Не удалось проверить сессию. Повторите попытку.");
  return data;
}
export async function context() {
  const user = await actor();
  if (!user) return null;
  const db = createAdminClient();
  const selected = (await cookies()).get("atelier-org")?.value;
  let query = db.from("organization_members").select("organization_id,role").eq("user_id", user.id);
  if (selected) query = query.eq("organization_id", selected);
  const { data: member, error } = await query.order("created_at").limit(1).maybeSingle();
  if (error) throw new Error("Не удалось проверить права доступа.");
  if (!member) return { user, member: null, organization: null, db };
  const { data: organization, error: orgError } = await db.from("organizations").select("*").eq("id", member.organization_id).single();
  if (orgError) throw new Error("Не удалось загрузить организацию.");
  return { user, member, organization, db };
}
export async function requireContext(roles: string[] = ["owner", "admin"]) {
  const ctx = await context();
  if (!ctx?.member || !ctx.organization) throw new Error("Откройте приложение из Telegram и выберите салон.");
  if (!roles.includes(ctx.member.role)) throw new Error("Недостаточно прав для этого действия.");
  return { ...ctx, member: ctx.member, organization: ctx.organization };
}
