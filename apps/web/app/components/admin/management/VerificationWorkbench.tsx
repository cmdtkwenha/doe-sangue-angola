"use client";

import type { Donor, Hospital } from "@doe-sangue-angola/shared-types";
import { useState } from "react";
import { useApiData } from "../../../hooks/useApiData";
import { useSupabaseRealtimeVersion } from "../../../hooks/useSupabaseRealtimeVersion";
import { ConfirmationModal } from "../../ui/ConfirmationModal";
import { EmptyState } from "../../ui/EmptyState";
import { LoadingSkeleton } from "../../ui/LoadingSkeleton";
import styles from "./management.module.css";
import { VerificationDetailsModal, type VerificationDetails, type VerificationRow } from "./VerificationDetailsModal";

type Tab = "hospitals" | "donors" | "cases";
type Pending =
  | { action: string; donor?: Donor; hospital?: Hospital; title: string }
  | null;
type Resolved = { donors: string[]; hospitals: string[] };
type HistoryPayload = {
  donorVerifications: Array<VerificationRow & { donor_id: string }>;
  hospitalVerifications: Array<VerificationRow & { hospital_id: string }>;
};
type QueuePayload = {
  dataSource: string;
  donorStatusField: string;
  donors: Donor[];
  hospitalStatusField: string;
  hospitals: Hospital[];
};

const tabs: Array<{ id: Tab; label: string }> = [
  { id: "hospitals", label: "Hospitais Pendentes" },
  { id: "donors", label: "Dadores Pendentes" },
  { id: "cases", label: "Casos Pendentes" }
];

export function VerificationWorkbench() {
  const [active, setActive] = useState<Tab>("hospitals");
  const [refresh, setRefresh] = useState(0);
  const [pending, setPending] = useState<Pending>(null);
  const [resolved, setResolved] = useState<Resolved>({ donors: [], hospitals: [] });
  const [details, setDetails] = useState<VerificationDetails | null>(null);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const live = useSupabaseRealtimeVersion(["hospitals", "donors"]);
  const { data: queue, error: queueError, loading } = useApiData<QueuePayload>(
    "/api/admin/verification/queues",
    {
      dataSource: "Supabase",
      donorStatusField: "eligibility_status",
      donors: [],
      hospitalStatusField: "verification_status",
      hospitals: []
    },
    live + refresh
  );
  const { data: history } = useApiData<HistoryPayload>(
    "/api/admin/verification",
    { donorVerifications: [], hospitalVerifications: [] },
    refresh
  );
  const pendingHospitals = queue.hospitals.filter((item) => !resolved.hospitals.includes(item.id));
  const pendingDonors = queue.donors
    .filter((item) => ["needs_review", "pending_verification"].includes(String(item.eligibilityStatus)))
    .filter((item) => !resolved.donors.includes(item.id));
  const cases: Array<{ id: string; label: string; status: string; type: string }> = [];

  if (loading) return <LoadingSkeleton label="A carregar casos de verificação" />;
  if (queueError) return <EmptyState title="Falha ao carregar verificação" message={queueError} />;

  return (
    <section className={styles.panel}>
      <div className={styles.toolbar}>
        <strong>Fila de verificação</strong>
        <div className={styles.controls}>
          {tabs.map((tab) => (
            <button
              aria-pressed={active === tab.id}
              className={active === tab.id ? styles.activeFilter : ""}
              key={tab.id}
              onClick={() => setActive(tab.id)}
              type="button"
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
      {process.env.NODE_ENV !== "production" ? (
        <p className="muted">
          Debug: data source {queue.dataSource}; hospital status {queue.hospitalStatusField}; donor status {queue.donorStatusField}
        </p>
      ) : null}
      {message ? <p className="muted" role="status">{message}</p> : null}
      {active === "hospitals" ? (
        <HospitalList
          history={history}
          hospitals={pendingHospitals}
          onAction={setPending}
          onDetails={setDetails}
        />
      ) : null}
      {active === "donors" ? (
        <DonorList
          donors={pendingDonors}
          history={history}
          onAction={setPending}
          onDetails={setDetails}
        />
      ) : null}
      {active === "cases" ? <CaseList cases={cases} /> : null}
      <ConfirmationModal
        confirmLabel="Confirmar"
        loading={saving}
        message={pending ? "Esta ação será auditada e refletida nos painéis operacionais." : ""}
        onClose={() => setPending(null)}
        onConfirm={() => void runAction()}
        open={Boolean(pending)}
        title={pending?.title ?? "Confirmar verificação"}
        tone="danger"
      />
      {details ? <VerificationDetailsModal details={details} onClose={() => setDetails(null)} /> : null}
    </section>
  );

  async function runAction() {
    if (!pending) return;
    const body = pending.hospital
      ? { action: pending.action, hospitalId: pending.hospital.id }
      : { action: pending.action, donorId: pending.donor?.id };
    setSaving(true);
    const response = await fetch("/api/admin/verification", {
      body: JSON.stringify(body),
      headers: { "Content-Type": "application/json" },
      method: "PATCH"
    });
    const payload = await response.json().catch(() => null);
    const ok = response.ok && payload?.ok !== false;
    if (ok) markResolved(pending);
    setSaving(false);
    setPending(null);
    setMessage(ok ? "Verificação atualizada com sucesso." : payload?.message ?? "Falha na ação.");
    if (ok) setRefresh((value) => value + 1);
  }

  function markResolved(item: NonNullable<Pending>) {
    if (item.hospital && ["approve_hospital", "reject_hospital", "suspend_hospital"].includes(item.action)) {
      setResolved((value) => ({ ...value, hospitals: [...new Set([...value.hospitals, item.hospital!.id])] }));
    }
    if (item.donor && ["reject_donor", "verify_donor", "suspend_donor", "reactivate_donor"].includes(item.action)) {
      setResolved((value) => ({ ...value, donors: [...new Set([...value.donors, item.donor!.id])] }));
    }
  }
}

function HospitalList({ history, hospitals, onAction, onDetails }: {
  history: HistoryPayload;
  hospitals: Hospital[];
  onAction: (pending: Pending) => void;
  onDetails: (details: VerificationDetails) => void;
}) {
  if (!hospitals.length) return <EmptyState title="Sem hospitais pendentes." message="Todos os hospitais foram tratados." />;
  return hospitals.map((hospital) => (
    <article className={styles.rowCard} key={hospital.id}>
      <strong>{hospital.name}</strong>
      <span>{hospital.type ?? "Hospital"} · {hospital.province} · {hospital.municipality} · Licença: {hospital.licenseNumber ?? "sem registo"} · {hospitalLabel(hospital)}</span>
      <div className={styles.controls}>
        <button onClick={() => onDetails({
          histories: history.hospitalVerifications.filter((item) => item.hospital_id === hospital.id),
          hospital,
          type: "hospital"
        })} type="button">Ver detalhes</button>
        <button onClick={() => onAction({ action: "approve_hospital", hospital, title: "Aprovar hospital" })} type="button">Aprovar</button>
        <button onClick={() => onAction({ action: "review_hospital", hospital, title: "Pedir revisão" })} type="button">Pedir revisão</button>
        <button onClick={() => onAction({ action: "reject_hospital", hospital, title: "Rejeitar hospital" })} type="button">Rejeitar</button>
      </div>
    </article>
  ));
}

function DonorList({ donors, history, onAction, onDetails }: {
  donors: Donor[];
  history: HistoryPayload;
  onAction: (pending: Pending) => void;
  onDetails: (details: VerificationDetails) => void;
}) {
  if (!donors.length) return <EmptyState title="Sem dadores pendentes." message="Não há dadores à espera de revisão." />;
  return donors.map((donor) => (
    <article className={styles.rowCard} key={donor.id}>
      <strong>{donor.name}</strong>
      <span>{donor.bloodType} · {donor.province} · {donor.municipality} · {donor.phone ?? "sem telefone"} · {donorLabel(donor)}</span>
      <div className={styles.controls}>
        <button onClick={() => onDetails({
          donor,
          histories: history.donorVerifications.filter((item) => item.donor_id === donor.id),
          type: "donor"
        })} type="button">Ver detalhes</button>
        <button onClick={() => onAction({ action: "verify_donor", donor, title: "Verificar dador" })} type="button">Verificar</button>
        <button onClick={() => onAction({ action: "review_donor", donor, title: "Manter em revisão" })} type="button">Revisão</button>
        <button onClick={() => onAction({ action: "suspend_donor", donor, title: "Suspender dador" })} type="button">Suspender</button>
      </div>
    </article>
  ));
}

function CaseList({ cases }: { cases: Array<{ id: string; label: string; status: string; type: string }> }) {
  if (!cases.length) return <EmptyState title="Sem casos pendentes." message="Não há casos de verificação ativos neste momento." />;
  return cases.map((item) => (
    <article className={styles.rowCard} key={item.id}>
      <strong>{item.type}: {item.label}</strong>
      <span>{item.status}</span>
    </article>
  ));
}

function hospitalStatus(hospital: Hospital) {
  return String(hospital.verificationStatus ?? (hospital.verified ? "verified" : "pending"));
}

function hospitalLabel(hospital: Hospital) {
  const labels: Record<string, string> = {
    needs_review: "Revisão necessária",
    pending: "Pendente",
    Pendente: "Pendente",
    "Revisão Necessária": "Revisão necessária"
  };
  return labels[hospitalStatus(hospital)] ?? hospitalStatus(hospital);
}

function donorLabel(donor: Donor) {
  const labels: Record<string, string> = { needs_review: "Revisão necessária", pending_verification: "Verificação pendente" };
  return labels[String(donor.eligibilityStatus)] ?? String(donor.eligibilityStatus ?? "Elegível");
}
