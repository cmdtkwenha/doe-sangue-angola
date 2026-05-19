"use client";

import {
  demoAccounts,
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
  type AppSession,
  mapDemoSession,
  resolveSupabaseSession
} from "./authSession";

type AuthContextValue = {
  error: string | null;
  loginDemo: (role: UserRole) => void;
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
const demoSessionKey = "doe-sangue-angola-demo-session";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthContextValue["session"]>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const demoMode = getAuthMode() !== "supabase";

  useEffect(() => {
    if (demoMode) {
      setSession(readDemoSession());
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
    loginDemo(role) {
      if (!demoMode) {
        setError("Acesso demo disponível apenas quando NEXT_PUBLIC_AUTH_MODE=mock.");
        return;
      }
      const demo = findDemoAccountByRole(role);
      if (!demo) {
        setError("Conta demo não encontrada para este perfil.");
        return;
      }
      const next = mapDemoSession(demo);
      writeDemoSession(next);
      setError(null);
      setSession(next);
      trackLoginEvent(next.user.email, next.user.role);
      debugAuth("Login demo direto", next.user.email);
      router.push(getRedirectForRole(next.user.role));
    },
    loading,
    session,
    async login(email, password) {
      if (isDemoAuthAllowed()) {
        const demo = findDemoAccount(email, password);
        if (demo) {
          const next = mapDemoSession(demo);
          writeDemoSession(next);
          setSession(next);
          trackLoginEvent(next.user.email, next.user.role);
          debugAuth("Login demo efetuado", next.user.email);
          router.push(getRedirectForRole(next.user.role));
          return;
        }
      }
      if (demoMode) {
        trackFailedAction("Login demo falhou", { email });
        debugAuth("Login demo falhou", email);
        setError("Conta demo inválida. Confirme email e palavra-passe.");
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
      clearDemoSession();
      setSession(null);
      router.push("/auth");
    },
    async register(input) {
      if (!supabase || getAuthMode() !== "supabase") {
        setError("Registo exige NEXT_PUBLIC_AUTH_MODE=supabase e Supabase configurado.");
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
        try {
          await createSupabaseProfile({
            authUserId: data.user.id,
            email: input.email,
            name: input.name,
            role: input.role
          });
        } catch {
          setError("Conta criada, mas o perfil ainda não foi guardado.");
        }
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

function readDemoSession(): AppSession | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(demoSessionKey);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as AppSession;
  } catch {
    clearDemoSession();
    return null;
  }
}

function writeDemoSession(session: AppSession) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(demoSessionKey, JSON.stringify(session));
}

function clearDemoSession() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(demoSessionKey);
}

function debugAuth(message: string, email: string) {
  if (process.env.NODE_ENV === "development") {
    console.info(`[auth-demo] ${message}`, { email });
  }
}

const findDemoAccountByRole = (role: UserRole) =>
  demoAccounts.find((account) => account.role === role);

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

  if (!response.ok) throw new Error("Falha ao guardar perfil.");
}
