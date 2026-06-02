"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import { EmptyState } from "../ui/EmptyState";
import { LoadingSkeleton } from "../ui/LoadingSkeleton";
import { MobileShell } from "./MobileShell";
import { useAuth } from "../auth/useAuth";

export function DonorEntityGate({ children }: { children: ReactNode }) {
  const { session } = useAuth();
  const [state, setState] = useState({
    found: false,
    loading: true,
    reason: "A verificar perfil de dador."
  });

  useEffect(() => {
    let mounted = true;
    async function checkDonor() {
      if (!supabase) {
        setState({ found: false, loading: false, reason: "Serviço de dados não configurado." });
        return;
      }
      const { data: authData, error: authError } = await supabase.auth.getUser();
      const userId = authData.user?.id ?? session?.user.authUserId ?? session?.user.id;
      if (authError || !userId) {
        setState({ found: false, loading: false, reason: authError?.message ?? "Sessão inválida." });
        return;
      }
      const { data: users, error: userError } = await supabase
        .from("users")
        .select("id")
        .or(`id.eq.${userId},auth_user_id.eq.${userId}`);
      if (userError) {
        setState({ found: false, loading: false, reason: userError.message });
        return;
      }
      const userIds = [...new Set([userId, ...(users ?? []).map((item) => item.id)])];
      const { data, error } = await supabase
        .from("donors")
        .select("*")
        .in("user_id", userIds)
        .maybeSingle();
      if (!mounted) return;
      setState({
        found: Boolean(data?.id),
        loading: false,
        reason: error?.message ?? (data?.id ? "Perfil encontrado." : "Perfil de dador ainda não criado.")
      });
    }
    void checkDonor();
    return () => {
      mounted = false;
    };
  }, [session]);

  if (state.loading) {
    return (
      <MobileShell active="profile">
        <LoadingSkeleton label="A carregar perfil do dador" />
      </MobileShell>
    );
  }

  if (!state.found) {
    return (
      <MobileShell active="profile">
        <EmptyState
          action={<Link className="button" href="/mobile/onboarding">Completar perfil</Link>}
          message={`Dador encontrado: não. Motivo do bloqueio: ${state.reason}`}
          title="Perfil ainda não configurado."
        />
      </MobileShell>
    );
  }

  return <>{children}</>;
}
