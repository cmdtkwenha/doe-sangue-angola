import {
  demoAccounts,
  demoPasswords,
  getRoleFromMetadata,
  type AuthUser
} from "@doe-sangue-angola/shared-services";
import type { Session, SupabaseClient } from "@supabase/supabase-js";

export type AppSession = { token: string; user: AuthUser };
export type DemoAccount = typeof demoAccounts[number];

export function findDemoAccount(email: string, password: string) {
  return demoAccounts.find((account) =>
    account.email === email &&
    (account.password === password || demoPasswords.some((item) => item === password))
  );
}

export function mapDemoSession(account: DemoAccount): AppSession {
  return {
    token: `demo-${account.role}`,
    user: {
      id: `demo-${account.role}`,
      name: account.label,
      email: account.email,
      role: account.role
    }
  };
}

export async function resolveSupabaseSession(
  supabase: SupabaseClient,
  session: Session | null
): Promise<AppSession | null> {
  if (!session?.user) return null;
  const metadata = session.user.user_metadata ?? {};
  const { data } = await supabase
    .from("profiles")
    .select("id,name,email,role")
    .or(`auth_user_id.eq.${session.user.id},email.eq.${session.user.email ?? ""}`)
    .maybeSingle();

  return {
    token: session.access_token,
    user: {
      id: String(data?.id ?? session.user.id),
      name: String(data?.name ?? metadata.name ?? session.user.email ?? "Utilizador"),
      email: String(data?.email ?? session.user.email ?? ""),
      role: getRoleFromMetadata({ role: data?.role ?? metadata.role })
    }
  };
}
