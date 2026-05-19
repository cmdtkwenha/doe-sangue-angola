import { isKnownRole, normalizeRole, type AuthUser } from "@doe-sangue-angola/shared-services";
import type { Session, SupabaseClient } from "@supabase/supabase-js";

export type AppSession = { token: string; user: AuthUser };

export async function resolveSupabaseSession(
  supabase: SupabaseClient,
  session: Session | null
): Promise<AppSession | null> {
  if (!session?.user) return null;
  const metadata = session.user.user_metadata ?? {};
  const { data, error } = await supabase
    .from("profiles")
    .select("id,name,email,role,linked_entity_id")
    .or(`auth_user_id.eq.${session.user.id},email.eq.${session.user.email ?? ""}`)
    .maybeSingle();
  const profileMissing = Boolean(error || !data?.id);
  if (profileMissing && process.env.NODE_ENV !== "production") {
    console.info("[auth] Perfil Supabase não encontrado", {
      authUserId: session.user.id,
      email: session.user.email
    });
  }

  return {
    token: session.access_token,
    user: {
      id: String(data?.id ?? session.user.id),
      authUserId: session.user.id,
      linkedEntityId: data?.linked_entity_id ? String(data.linked_entity_id) : undefined,
      name: String(data?.name ?? metadata.name ?? session.user.email ?? "Utilizador"),
      email: String(data?.email ?? session.user.email ?? ""),
      profileMissing,
      role: isKnownRole(data?.role) ? data.role : normalizeRole(metadata.role)
    }
  };
}
