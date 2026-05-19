"use client";

import type { ReactNode } from "react";
import { EmptyState } from "../ui/EmptyState";
import { LoadingSkeleton } from "../ui/LoadingSkeleton";
import styles from "./hospitalPortal.module.css";
import { useCurrentHospital } from "./useCurrentHospital";

export function HospitalEntityGate({ children }: { children: ReactNode }) {
  const { data: hospital, loading } = useCurrentHospital();

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
          message="A sua conta existe, mas ainda não está ligada a um hospital aprovado."
          title="Hospital não encontrado"
        />
      </div>
    );
  }

  return <>{children}</>;
}
