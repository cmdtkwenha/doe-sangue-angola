import { isKnownRole, type AuthUser } from "@doe-sangue-angola/shared-services";
import type { Session, SupabaseClient } from "@supabase/supabase-js";

export type AppSession = { token: string; user: AuthUser };

export async function resolveSupabaseSession(
  supabase: SupabaseClient,
  session: Session | null
): Promise<AppSession | null> {
  if (!session?.user) return null;
  const metadata = session.user.user_metadata ?? {};
  const { data } = await supabase
    .from("profiles")
    .select("id,name,email,role,linked_entity_id")
    .or(`auth_user_id.eq.${session.user.id},email.eq.${session.user.email ?? ""}`)
    .maybeSingle();

  return {
    token: session.access_token,
    user: {
      id: String(data?.id ?? session.user.id),
      authUserId: session.user.id,
      linkedEntityId: data?.linked_entity_id ? String(data.linked_entity_id) : undefined,
      name: String(data?.name ?? metadata.name ?? session.user.email ?? "Utilizador"),
      email: String(data?.email ?? session.user.email ?? ""),
      role: isKnownRole(data?.role) ? data.role : "donor"
    }
  };
}
