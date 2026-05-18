import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import {
  getAllowedRolesForPath,
  getAuthMode,
  isDemoAuthAllowed,
  isKnownRole,
  normalizeRole
} from "@doe-sangue-angola/shared-services";

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const allowedRoles = getAllowedRolesForPath(path);

  if (!allowedRoles) return NextResponse.next();
  if (getAuthMode() !== "supabase") {
    return isDemoAuthAllowed() ? NextResponse.next() : redirectToAuth(request);
  }
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
  if (!allowedRoles.includes(role)) {
    return NextResponse.redirect(new URL("/unauthorized", request.url));
  }

  return response;
}

async function resolveRole(
  supabase: ReturnType<typeof createServerClient>,
  user: { id: string; email?: string; user_metadata?: Record<string, unknown> }
) {
  if (isKnownRole(user.user_metadata?.role)) return user.user_metadata.role;
  const { data } = await supabase
    .from("users")
    .select("role")
    .or(`auth_user_id.eq.${user.id},email.eq.${user.email ?? ""}`)
    .maybeSingle();

  return normalizeRole(data?.role);
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
