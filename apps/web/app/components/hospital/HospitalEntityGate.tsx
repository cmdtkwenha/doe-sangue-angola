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

  if (!isVerified(hospital.verificationStatus) || !hospital.verified) {
    return (
      <div className={styles.workspace}>
        <EmptyState
          message={hospitalStatusMessage(hospital.verificationStatus, hospital.rejectionReason)}
          title={hospitalStatusTitle(hospital.verificationStatus)}
        />
      </div>
    );
  }

  return <>{children}</>;
}

function hospitalStatusTitle(status?: string) {
  if (status === "Rejeitado" || status === "rejected") return "Conta rejeitada";
  if (status === "Suspenso" || status === "suspended") return "Conta suspensa";
  return "Conta em revisão";
}

function hospitalStatusMessage(status?: string, reason?: string) {
  if (status === "Rejeitado" || status === "rejected") {
    return `${reason ?? "A candidatura foi rejeitada."} Contacte o suporte para rever a situação.`;
  }
  if (status === "Suspenso" || status === "suspended") {
    return "A conta foi suspensa. Contacte o suporte antes de criar novos pedidos.";
  }
  return "Hospital pendente de verificação. Quando for aprovado pelo Admin, poderá criar pedidos reais.";
}

function isVerified(status?: string) {
  return status === "Verificado" || status === "verified";
}
