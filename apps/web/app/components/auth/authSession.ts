import { isKnownRole, normalizeRole, type AuthUser } from "@doe-sangue-angola/shared-services";
import type { Session, SupabaseClient } from "@supabase/supabase-js";

export type AppSession = { token: string; user: AuthUser };

export async function resolveSupabaseSession(
  supabase: SupabaseClient,
  session: Session | null
): Promise<AppSession | null> {
  if (!session?.user) return null;
  const metadata = session.user.user_metadata ?? {};
  const data = await loadAccessProfile(supabase, session.user.id, session.user.email ?? "");
  const profileMissing = !data?.id || data.account_status !== "Ativo";

  return {
    token: session.access_token,
    user: {
      id: String(data?.id ?? session.user.id),
      accountStatus: data?.account_status ?? undefined,
      authUserId: session.user.id,
      linkedEntityId: data?.linked_entity_id ? String(data.linked_entity_id) : undefined,
      name: String(data?.name ?? metadata.name ?? session.user.email ?? "Utilizador"),
      email: String(data?.email ?? session.user.email ?? ""),
      profileMissing,
      role: isKnownRole(data?.role) ? data.role : normalizeRole(metadata.role)
    }
  };
}

type AccessProfile = {
  account_status?: string | null;
  email?: string | null;
  id: string;
  linked_entity_id?: string | null;
  name?: string | null;
  role?: string | null;
};

async function loadAccessProfile(
  supabase: SupabaseClient,
  authUserId: string,
  email: string
): Promise<AccessProfile | null> {
  const user = await firstByAuthOrEmail(supabase, "users", authUserId, email);
  if (user) return user;
  return await firstByAuthOrEmail(supabase, "profiles", authUserId, email);
}

async function firstByAuthOrEmail(
  supabase: SupabaseClient,
  table: "profiles" | "users",
  authUserId: string,
  email: string
) {
  const { data, error } = await supabase
    .from(table)
    .select("id,name,email,role,linked_entity_id,account_status,auth_user_id")
    .or(orFilter(authUserId, email))
    .limit(5);
  if (error) return null;
  return (data ?? []).find((row) => row.auth_user_id === authUserId || row.id === authUserId) ?? data?.[0] ?? null;
}

function orFilter(authUserId: string, email: string) {
  return [
    `id.eq.${authUserId}`,
    `auth_user_id.eq.${authUserId}`,
    email ? `email.eq.${email}` : ""
  ].filter(Boolean).join(",");
}
