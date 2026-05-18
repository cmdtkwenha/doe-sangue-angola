"use client";

import {
  getOnboardingRedirectForRole,
  getRedirectForRole,
  getAuthMode,
  isDemoAuthAllowed,
  trackFailedAction,
  trackLoginEvent,
  type AuthUser
} from "@doe-sangue-angola/shared-services";
import type { UserRole } from "@doe-sangue-angola/shared-types";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { createContext, useEffect, useMemo, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import {
  findDemoAccount,
  mapDemoSession,
  resolveSupabaseSession
} from "./authSession";

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
  const demoMode = getAuthMode() !== "supabase";

  useEffect(() => {
    if (demoMode) {
      setLoading(false);
      return;
    }
    if (!supabase && getAuthMode() === "supabase") {
      setError("Supabase Auth não configurado. Crie .env.local com as chaves públicas.");
      setLoading(false);
      return;
    }
    if (!supabase) {
      setLoading(false);
      return;
    }

    const db = supabase;
    db.auth.getSession().then(async ({ data }) => {
      setSession(await resolveSupabaseSession(db, data.session));
      setLoading(false);
    });
    const { data } = db.auth.onAuthStateChange((_event, next) => {
      void resolveSupabaseSession(db, next).then(setSession);
    });

    return () => data.subscription.unsubscribe();
  }, [demoMode]);

  const value = useMemo<AuthContextValue>(() => ({
    error,
    loading,
    session,
    async login(email, password) {
      if (isDemoAuthAllowed()) {
        const demo = findDemoAccount(email, password);
        if (demo) {
          const next = mapDemoSession(demo);
          setSession(next);
          trackLoginEvent(next.user.email, next.user.role);
          router.push(getRedirectForRole(next.user.role));
          return;
        }
      }
      if (demoMode) {
        trackFailedAction("Login demo falhou", { email });
        setError("Use uma conta demo válida. Palavra-passe: Demo@2026 ou demo@2026.");
        return;
      }
      if (!supabase) {
        setError("Supabase Auth não configurado. Verifique .env.local.");
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
      const next = await resolveSupabaseSession(supabase, data.session);
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
      if (!supabase || getAuthMode() !== "supabase") {
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
        const { error: profileError } = await supabase.from("users").upsert({
          auth_user_id: data.user.id,
          email: input.email,
          name: input.name,
          role: input.role
        }, {
          onConflict: "email"
        });
        if (profileError) setError("Conta criada, mas o perfil ainda não foi guardado.");
      }
      const next = await resolveSupabaseSession(supabase, data.session);
      setSession(next);
      router.push(next ? getOnboardingRedirectForRole(next.user.role) : "/auth");
    },
    async resetPassword(email) {
      if (!supabase || getAuthMode() !== "supabase") {
        setError("Recuperação real exige Supabase Auth.");
        return;
      }
      setError(null);
      const origin = window.location.origin;
      const { error: authError } = await supabase.auth
        .resetPasswordForEmail(email, { redirectTo: `${origin}/auth` });
      if (authError) setError("Não foi possível enviar o email de recuperação.");
    }
  }), [demoMode, error, loading, router, session]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
