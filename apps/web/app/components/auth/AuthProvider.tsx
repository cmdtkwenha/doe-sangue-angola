"use client";

import {
  getOnboardingRedirectForRole,
  getRedirectForRole,
  getAuthMode,
  trackFailedAction,
  trackLoginEvent,
  type AuthUser
} from "@doe-sangue-angola/shared-services";
import type { UserRole } from "@doe-sangue-angola/shared-types";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { createContext, useEffect, useMemo, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import { resolveSupabaseSession } from "./authSession";

type AuthContextValue = {
  error: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
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
  const authMode = getAuthMode();

  useEffect(() => {
    if (authMode !== "supabase") {
      setError("Autenticação real ainda não está ativa neste ambiente.");
      setLoading(false);
      return;
    }
    if (!supabase) {
      setError("Serviço de autenticação não configurado.");
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
  }, [authMode]);

  const value = useMemo<AuthContextValue>(() => ({
    error,
    loading,
    session,
    async login(email, password) {
      if (!supabase || authMode !== "supabase") {
        setError("Serviço de autenticação não configurado.");
        return;
      }
      setLoading(true);
      setError(null);
      const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });
      setLoading(false);
      if (authError) {
        trackFailedAction("Login falhou", { email });
        setError("Email ou palavra-passe inválidos.");
        return;
      }
      const next = await resolveSupabaseSession(supabase, data.session);
      setSession(next);
      if (next) {
        trackLoginEvent(next.user.email, next.user.role);
        void fetch("/api/audit-logs/session", { method: "POST" }).catch(() => undefined);
        router.push(getRedirectForRole(next.user.role));
      }
    },
    async logout() {
      if (supabase) await supabase.auth.signOut();
      clearAuthStorage();
      setSession(null);
      router.push("/auth");
    },
    async refreshSession() {
      if (!supabase || authMode !== "supabase") return;
      const { data } = await supabase.auth.getSession();
      setSession(await resolveSupabaseSession(supabase, data.session));
    },
    async register(input) {
      if (!supabase || getAuthMode() !== "supabase") {
        setError("Registo real ainda não está ativo neste ambiente.");
        return;
      }
      setLoading(true);
      setError(null);
      const { data, error: authError } = await supabase.auth.signUp({
        email: input.email,
        password: input.password,
        options: { data: { full_name: input.name, name: input.name, role: input.role } }
      });
      setLoading(false);
      if (authError) {
        setError(formatAuthError(authError));
        return;
      }
      if (data.user) {
        try {
          if (data.session) {
            await createSupabaseProfile({
              authUserId: data.user.id,
              email: input.email,
              name: input.name,
              role: input.role
            });
          }
        } catch (profileError) {
          setError(profileError instanceof Error
            ? profileError.message
            : "Conta criada, mas o perfil ainda não foi guardado.");
        }
      }
      const next = await resolveSupabaseSession(supabase, data.session);
      setSession(next);
      router.push(next ? getOnboardingRedirectForRole(next.user.role) : "/auth");
    },
    async resetPassword(email) {
      if (!supabase || getAuthMode() !== "supabase") {
        setError("Recuperação de acesso ainda não está ativa neste ambiente.");
        return;
      }
      setError(null);
      const origin = window.location.origin;
      const { error: authError } = await supabase.auth
        .resetPasswordForEmail(email, { redirectTo: `${origin}/auth` });
      if (authError) setError("Não foi possível enviar o email de recuperação.");
    }
  }), [authMode, error, loading, router, session]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

function clearAuthStorage() {
  if (typeof window === "undefined") return;
  const stores = [window.localStorage, window.sessionStorage];
  stores.forEach((store) => {
    Object.keys(store)
      .filter((key) => key.includes("supabase") || key.includes("sb-") || key.includes("auth"))
      .forEach((key) => store.removeItem(key));
  });
}

async function createSupabaseProfile(input: {
  authUserId: string;
  email: string;
  name: string;
  role: UserRole;
}) {
  const response = await fetch("/api/auth/profile", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input)
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    throw new Error(payload?.message ?? "Falha ao guardar perfil.");
  }
}

function formatAuthError(error: { code?: string; message: string; status?: number }) {
  return `Não foi possível criar a conta. ${error.message}`;
}
