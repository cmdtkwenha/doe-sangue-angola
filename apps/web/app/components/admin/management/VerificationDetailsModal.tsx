"use client";

import type { Donor, Hospital } from "@doe-sangue-angola/shared-types";
import { AccessibleModal } from "../../accessibility";
import styles from "./management.module.css";

export type VerificationRow = {
  created_at: string;
  id: string;
  notes?: string | null;
  status: string;
  updated_at?: string | null;
  verified_by?: string | null;
};

export type VerificationDetails =
  | { donor: Donor; histories: VerificationRow[]; type: "donor" }
  | { histories: VerificationRow[]; hospital: Hospital; type: "hospital" };

export function VerificationDetailsModal({
  details,
  onClose
}: {
  details: VerificationDetails;
  onClose: () => void;
}) {
  const title = details.type === "donor" ? details.donor.name : details.hospital.name;
  return (
    <AccessibleModal onClose={onClose} size="detail" title="Detalhes de verificação">
      <section className={styles.detailCard}>
        <header className={styles.detailHead}>
          <span>
            <p className="eyebrow">Verificação</p>
            <h2>{title}</h2>
          </span>
          <button aria-label="Fechar detalhes" onClick={onClose} type="button">×</button>
        </header>
        {details.type === "donor" ? <DonorDetails donor={details.donor} /> : <HospitalDetails hospital={details.hospital} />}
        <section className={styles.detailPanel}>
          <strong>Histórico de verificação</strong>
          {details.histories.length ? details.histories.map((item) => (
            <article className={styles.historyItem} key={item.id}>
              <span className={styles.badge}>{statusLabel(item.status)}</span>
              <p className="muted">{item.notes ?? "Sem notas"} · {formatDate(item.created_at)}</p>
            </article>
          )) : <p className="muted">Sem histórico de verificação.</p>}
        </section>
      </section>
    </AccessibleModal>
  );
}

function DonorDetails({ donor }: { donor: Donor }) {
  return (
    <section className={styles.detailGrid}>
      <Read label="Tipo sanguíneo" value={donor.bloodType} />
      <Read label="Província" value={donor.province} />
      <Read label="Município" value={donor.municipality} />
      <Read label="Contacto emergência" value={donor.emergencyContactName} />
      <Read label="Telefone emergência" value={donor.emergencyContactPhone} />
      <Read label="Elegibilidade" value={donor.eligibilityStatus ?? "Pendente"} />
    </section>
  );
}

function HospitalDetails({ hospital }: { hospital: Hospital }) {
  return (
    <section className={styles.detailGrid}>
      <Read label="Tipo" value={hospital.type} />
      <Read label="Província" value={hospital.province} />
      <Read label="Município" value={hospital.municipality} />
      <Read label="Telefone" value={hospital.contact} />
      <Read label="Email" value={hospital.email} />
      <Read label="Licença" value={hospital.licenseNumber} />
    </section>
  );
}

function Read({ label, value }: { label: string; value?: string }) {
  return <span><small>{label}</small><strong>{value || "Sem registo"}</strong></span>;
}

function statusLabel(status: string) {
  const labels: Record<string, string> = {
    approved: "Verificado",
    needs_review: "Revisão Necessária",
    rejected: "Rejeitado",
    suspended: "Suspenso",
    verified: "Verificado"
  };
  return labels[status] ?? status;
}

function formatDate(value?: string) {
  return value ? new Date(value).toLocaleString("pt-AO", { dateStyle: "short", timeStyle: "short" }) : "Sem data";
}
