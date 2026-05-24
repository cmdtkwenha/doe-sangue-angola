"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect } from "react";
import { EmptyState } from "../ui/EmptyState";
import { LoadingSkeleton } from "../ui/LoadingSkeleton";
import styles from "./hospitalPortal.module.css";
import { useCurrentHospital } from "./useCurrentHospital";

export function HospitalEntityGate({ children }: { children: ReactNode }) {
  const { data: hospital, loading } = useCurrentHospital();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !hospital?.id) router.replace("/onboarding/hospital");
  }, [hospital?.id, loading, router]);

  if (loading) {
    return (
      <div className={styles.workspace}>
        <LoadingSkeleton label="A carregar hospital ligado ao perfil" />
      </div>
    );
  }

  if (!hospital?.id) {
    return (
      <div className={styles.workspace}>
        <EmptyState
          message="Vamos terminar a ligação da sua conta a um hospital aprovado."
          title="Perfil ainda não configurado."
        />
      </div>
    );
  }

  return <>{children}</>;
}
