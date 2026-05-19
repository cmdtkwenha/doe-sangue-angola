import { createServerClient } from "@supabase/ssr";
import type { UserRole } from "@doe-sangue-angola/shared-types";
import { cookies } from "next/headers";
import { ApiError } from "./apiResponse";

export type ApiPrincipal = {
  authUserId: string;
  donorId?: string;
  email: string;
  hospitalId?: string;
  name: string;
  profileId: string;
  role: UserRole;
};

export async function requireApiSession(roles?: UserRole[]) {
  const db = await createRouteSupabase();
  const { data, error } = await db.auth.getUser();
  if (error || !data.user) throw new ApiError(401, "Sessão inválida. Entre novamente.");

  const { data: profile, error: profileError } = await db
    .from("profiles")
    .select("id,auth_user_id,role,linked_entity_id,name,email")
    .eq("auth_user_id", data.user.id)
    .maybeSingle();

  if (profileError) throw new ApiError(500, "Não foi possível validar o perfil.");
  if (!profile?.role) throw new ApiError(403, "Perfil sem permissões configuradas.");
  if (roles?.length && !roles.includes(profile.role as UserRole)) {
    throw new ApiError(403, "Sem permissão para esta ação.");
  }

  return {
    authUserId: data.user.id,
    donorId: profile.role === "donor" ? profile.linked_entity_id ?? undefined : undefined,
    email: profile.email ?? data.user.email ?? "",
    hospitalId: profile.role === "hospital" ? profile.linked_entity_id ?? undefined : undefined,
    name: profile.name ?? data.user.email ?? "Utilizador",
    profileId: profile.id,
    role: profile.role as UserRole
  };
}

export async function requireAuthUser() {
  const db = await createRouteSupabase();
  const { data, error } = await db.auth.getUser();
  if (error || !data.user) throw new ApiError(401, "Sessão inválida. Entre novamente.");
  return data.user;
}

export function requireSameOrigin(request: Request) {
  const method = request.method.toUpperCase();
  if (method === "GET" || method === "HEAD" || method === "OPTIONS") return;
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");
  if (!origin || !host) return;
  if (new URL(origin).host !== host) {
    throw new ApiError(403, "Origem inválida para esta ação.");
  }
}

export function requireEntityAccess(
  principal: ApiPrincipal,
  entity: "donor" | "hospital",
  id?: string | null
) {
  if (principal.role === "admin") return;
  const ownId = entity === "donor" ? principal.donorId : principal.hospitalId;
  if (!id || ownId !== id) throw new ApiError(403, "Acesso negado a este registo.");
}

async function createRouteSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new ApiError(500, "Supabase Auth não está configurado.");
  const store = await cookies();
  return createServerClient(url, key, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: () => undefined
    }
  });
}
