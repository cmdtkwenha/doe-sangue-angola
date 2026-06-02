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

  const profile = await loadAccessProfile(db, data.user.id, data.user.email ?? "");

  if (!profile?.role) throw new ApiError(403, "Perfil sem permissões configuradas.");
  if (profile.account_status !== "Ativo") throw new ApiError(403, "Conta sem estado ativo.");
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

type AccessProfile = {
  account_status?: string | null;
  email?: string | null;
  id: string;
  linked_entity_id?: string | null;
  name?: string | null;
  role?: string | null;
};

async function loadAccessProfile(
  db: Awaited<ReturnType<typeof createRouteSupabase>>,
  authUserId: string,
  email: string
): Promise<AccessProfile | null> {
  return await firstByAuthOrEmail(db, "users", authUserId, email) ??
    await firstByAuthOrEmail(db, "profiles", authUserId, email);
}

async function firstByAuthOrEmail(
  db: Awaited<ReturnType<typeof createRouteSupabase>>,
  table: "profiles" | "users",
  authUserId: string,
  email: string
) {
  const { data, error } = await db
    .from(table)
    .select("id,auth_user_id,role,linked_entity_id,name,email,account_status")
    .or(orFilter(authUserId, email))
    .limit(5);
  if (error) throw new ApiError(500, `Não foi possível validar ${table}. ${error.message}`);
  return (data ?? []).find((row) => row.auth_user_id === authUserId || row.id === authUserId) ?? data?.[0] ?? null;
}

function orFilter(authUserId: string, email: string) {
  return [
    `id.eq.${authUserId}`,
    `auth_user_id.eq.${authUserId}`,
    email ? `email.eq.${email}` : ""
  ].filter(Boolean).join(",");
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

export async function createRouteSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new ApiError(500, "Serviço de dados não está configurado.");
  const store = await cookies();
  return createServerClient(url, key, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: () => undefined
    }
  });
}
