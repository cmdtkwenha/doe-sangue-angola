import { createServerClient } from "@supabase/ssr";
import type { UserRole } from "@doe-sangue-angola/shared-types";
import { NextResponse, type NextRequest } from "next/server";
import {
  getAllowedRolesForPath,
  isKnownRole
} from "@doe-sangue-angola/shared-services";

type AccessProfile = {
  account_status?: string | null;
  auth_user_id?: string | null;
  id: string;
  role?: string | null;
};

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const allowedRoles = getAllowedRolesForPath(path);

  if (!allowedRoles) return NextResponse.next();
  if (!hasSupabaseEnv()) return redirectToAuth(request);

  let response = NextResponse.next({ request });
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll(cookies) {
          cookies.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookies.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        }
      }
    }
  );

  const { data } = await supabase.auth.getUser();
  if (!data.user) return redirectToAuth(request);

  const role = await resolveRole(supabase, data.user);
  if (!role || !allowedRoles.includes(role)) {
    return NextResponse.redirect(new URL("/unauthorized", request.url));
  }

  return response;
}

async function resolveRole(
  supabase: ReturnType<typeof createServerClient>,
  user: { id: string; email?: string }
) : Promise<UserRole | null> {
  const data = await loadAccessProfile(supabase, user.id, user.email ?? "");
  if (data?.account_status !== "Ativo") return null;

  return isKnownRole(data?.role) ? data.role : null;
}

async function loadAccessProfile(
  supabase: ReturnType<typeof createServerClient>,
  authUserId: string,
  email: string
) {
  return await firstByAuthOrEmail(supabase, "users", authUserId, email) ??
    await firstByAuthOrEmail(supabase, "profiles", authUserId, email);
}

async function firstByAuthOrEmail(
  supabase: ReturnType<typeof createServerClient>,
  table: "profiles" | "users",
  authUserId: string,
  email: string
) {
  const { data } = await supabase
    .from(table)
    .select("id,auth_user_id,role,account_status")
    .or(orFilter(authUserId, email))
    .limit(5);
  const rows = (data ?? []) as AccessProfile[];
  return rows.find((row) => row.auth_user_id === authUserId || row.id === authUserId) ?? rows[0] ?? null;
}

function orFilter(authUserId: string, email: string) {
  return [
    `id.eq.${authUserId}`,
    `auth_user_id.eq.${authUserId}`,
    email ? `email.eq.${email}` : ""
  ].filter(Boolean).join(",");
}

export const config = {
  matcher: ["/admin/:path*", "/hospital/:path*", "/mobile/:path*"]
};

function hasSupabaseEnv() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

function redirectToAuth(request: NextRequest) {
  const url = new URL("/auth", request.url);
  url.searchParams.set("next", request.nextUrl.pathname);
  return NextResponse.redirect(url);
}
