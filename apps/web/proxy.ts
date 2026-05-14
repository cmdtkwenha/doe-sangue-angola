import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getAllowedRolesForPath, normalizeRole } from "@doe-sangue-angola/shared-services";

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const allowedRoles = getAllowedRolesForPath(path);

  if (!allowedRoles || !hasSupabaseEnv()) return NextResponse.next();

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

  const role = normalizeRole(data.user.user_metadata?.role);
  if (!allowedRoles.includes(role)) {
    return NextResponse.redirect(new URL("/unauthorized", request.url));
  }

  return response;
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
