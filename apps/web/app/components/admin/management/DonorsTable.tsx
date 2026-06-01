"use client";

import { donorActions } from "@constants/adminActions";
import type { Donor } from "@doe-sangue-angola/shared-types";
import { useState } from "react";
import { useApiData } from "../../../hooks/useApiData";
import { useSupabaseRealtimeVersion } from "../../../hooks/useSupabaseRealtimeVersion";
import { ConfirmationModal } from "../../ui/ConfirmationModal";
import { ManagementTable } from "./ManagementTable";
import styles from "./management.module.css";

type Pending = { action: string; donor: Donor; title: string } | null;

export function DonorsTable() {
  const [refresh, setRefresh] = useState(0);
  const [pending, setPending] = useState<Pending>(null);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const version = useSupabaseRealtimeVersion(["donors"]);
  const { data: donors, error } = useApiData<Donor[]>("/api/donors", [], version + refresh);
  const reviewCount = donors.filter((donor) => donor.eligibilityStatus === "needs_review").length;

  return (
    <>
      {error ? <p className={styles.error}>Falha ao carregar dadores: {error}</p> : null}
      {reviewCount > 0 ? (
        <p className={styles.error}>{reviewCount} dador(es) precisam de revisão de elegibilidade.</p>
      ) : null}
      {message ? <p className="muted" role="status">{message}</p> : null}
      <ManagementTable
        title="Dadores"
        exportName="dadores.csv"
        columns={["Nome", "Tipo", "Província", "Município", "Disponível", "Última doação", "Próxima elegível"]}
        rows={donors.map((donor) => ({
          id: donor.id,
          status: eligibilityLabel(donor),
          values: {
            Nome: donor.name,
            Tipo: donor.bloodType,
            Província: donor.province,
            Município: donor.municipality,
            Disponível: donor.available ? "Sim" : "Não",
            "Última doação": formatDate(donor.lastDonation),
            "Próxima elegível": formatDate(donor.nextEligibleDonationDate)
          },
          actions: donorActions,
          onAction: (action) => setPending({ action, donor, title: action })
        }))}
      />
      <ConfirmationModal
        confirmLabel="Confirmar"
        loading={saving}
        message={pending ? `Confirmar "${pending.action}" para ${pending.donor.name}?` : ""}
        onClose={() => setPending(null)}
        onConfirm={() => void runPending()}
        open={Boolean(pending)}
        title={pending?.title ?? "Confirmar ação"}
        tone="danger"
      />
    </>
  );

  async function runPending() {
    if (!pending) return;
    const apiAction = actionMap[pending.action];
    if (!apiAction) return;
    setSaving(true);
    const response = await fetch("/api/admin/verification", {
      body: JSON.stringify({ action: apiAction, donorId: pending.donor.id }),
      headers: { "Content-Type": "application/json" },
      method: "PATCH"
    });
    const payload = await response.json().catch(() => null);
    setSaving(false);
    setPending(null);
    setMessage(response.ok && payload?.ok !== false
      ? "Estado do dador atualizado."
      : payload?.message ?? "Não foi possível atualizar o dador.");
    if (response.ok && payload?.ok !== false) setRefresh((value) => value + 1);
  }
}

const actionMap: Record<string, string> = {
  "Necessita revisão": "review_donor",
  "Reativar dador": "reactivate_donor",
  "Suspender dador": "suspend_donor",
  "Verificar dador": "verify_donor"
};

function eligibilityLabel(donor: Donor) {
  const labels: Record<string, string> = {
    eligible: "Elegível",
    needs_review: "Revisão necessária",
    permanently_deferred: "Diferido permanente",
    temporarily_deferred: "Diferido temporário"
  };
  return labels[donor.eligibilityStatus ?? "eligible"] ?? (donor.available ? "Elegível" : "Pendente");
}

function formatDate(value?: string) {
  return value ? new Date(value).toLocaleDateString("pt-AO") : "Sem registo";
}
