"use client";

import {
  getOnboardingRedirectForRole,
  getRedirectForRole,
  getRoleFromMetadata,
  getAuthMode,
  demoAccounts,
  trackFailedAction,
  trackLoginEvent,
  type AuthUser
} from "@doe-sangue-angola/shared-services";
import type { UserRole } from "@doe-sangue-angola/shared-types";
import type { Session } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { createContext, useEffect, useMemo, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";

type AuthContextValue = {
  error: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  session: { token: string; user: AuthUser } | null;
};

type RegisterInput = {
  email: string;
  name: string;
  password: string;
  role: UserRole;
};

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthContextValue["session"]>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!supabase && getAuthMode() === "supabase") {
      setError("Supabase Auth não configurado. Crie .env.local com as chaves públicas.");
      setLoading(false);
      return;
    }
    if (!supabase) {
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      setSession(mapSession(data.session));
      setLoading(false);
    });
    const { data } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(mapSession(next));
    });

    return () => data.subscription.unsubscribe();
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    error,
    loading,
    session,
    async login(email, password) {
      if (!supabase) {
        if (getAuthMode() === "supabase") {
          setError("Supabase Auth não configurado. Verifique .env.local.");
          return;
        }
        const demo = findDemoAccount(email, password);
        if (demo) {
          const next = mapDemoSession(demo);
          setSession(next);
          trackLoginEvent(next.user.email, next.user.role);
          router.push(getRedirectForRole(next.user.role));
          return;
        }
        trackFailedAction("Login demo falhou", { email });
        setError("Use uma conta demo válida ou configure Supabase Auth.");
        return;
      }
      setLoading(true);
      setError(null);
      const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });
      setLoading(false);
      if (authError) {
        trackFailedAction("Login Supabase falhou", { email });
        setError("Email ou palavra-passe inválidos.");
        return;
      }
      const next = mapSession(data.session);
      setSession(next);
      if (next) {
        trackLoginEvent(next.user.email, next.user.role);
        router.push(getRedirectForRole(next.user.role));
      }
    },
    async logout() {
      if (supabase) await supabase.auth.signOut();
      setSession(null);
      router.push("/auth");
    },
    async register(input) {
      if (!supabase) {
        setError("Registo real exige Supabase Auth. Use contas demo neste ambiente.");
        return;
      }
      setLoading(true);
      setError(null);
      const { data, error: authError } = await supabase.auth.signUp({
        email: input.email,
        password: input.password,
        options: { data: { name: input.name, role: input.role } }
      });
      setLoading(false);
      if (authError) {
        setError("Não foi possível criar a conta.");
        return;
      }
      if (data.user) {
        await supabase.from("users").insert({
          auth_user_id: data.user.id,
          email: input.email,
          name: input.name,
          role: input.role
        });
      }
      const next = mapSession(data.session);
      setSession(next);
      router.push(next ? getOnboardingRedirectForRole(next.user.role) : "/auth");
    },
    async resetPassword(email) {
      if (!supabase) {
        setError("Recuperação real exige Supabase Auth.");
        return;
      }
      setError(null);
      const origin = window.location.origin;
      const { error: authError } = await supabase.auth
        .resetPasswordForEmail(email, { redirectTo: `${origin}/auth` });
      if (authError) setError("Não foi possível enviar o email de recuperação.");
    }
  }), [error, loading, router, session]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

type DemoAccount = typeof demoAccounts[number];

function findDemoAccount(email: string, password: string) {
  return demoAccounts.find((account) =>
    account.email === email && account.password === password
  );
}

function mapDemoSession(account: DemoAccount): NonNullable<AuthContextValue["session"]> {
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

function mapSession(session: Session | null): AuthContextValue["session"] {
  if (!session?.user) return null;
  const metadata = session.user.user_metadata ?? {};
  const role = getRoleFromMetadata(metadata);

  return {
    token: session.access_token,
    user: {
      id: session.user.id,
      name: String(metadata.name ?? session.user.email ?? "Utilizador"),
      email: session.user.email ?? "",
      role
    }
  };
}
