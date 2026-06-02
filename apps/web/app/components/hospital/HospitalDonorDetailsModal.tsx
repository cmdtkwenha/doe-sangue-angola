"use client";

import type { ReactNode } from "react";
import {
  canMoveDonorResponse,
  DonorResponseStatusBadge,
  donorResponseLabels,
  normalizeDonorResponseStatus
} from "../ui/DonorResponseStatusBadge";
import type { AcceptedDonor, WorkflowStatus } from "./incomingDonorTypes";
import styles from "./HospitalDonorDetailsModal.module.css";

type Props = {
  donor: AcceptedDonor | null;
  onAction: (row: AcceptedDonor, status: WorkflowStatus) => void;
  onClose: () => void;
  saving: boolean;
};

export function HospitalDonorDetailsModal({ donor, onAction, onClose, saving }: Props) {
  if (!donor) return null;
  const status = normalizeDonorResponseStatus(donor.status);
  const donorName = resolveDonorName(donor);
  const summary = [
    donor.donorBloodType,
    donor.gender,
    donor.age ? `${donor.age} anos` : undefined
  ].filter(Boolean).join(" • ");

  return (
    <div className={styles.backdrop} role="presentation">
      <section aria-modal="true" className={styles.modal} role="dialog">
        <header className={styles.header}>
          <div className={styles.identity}>
            <div aria-hidden className={styles.photo}>{initials(donorName)}</div>
            <div>
              <h2>{donorName}</h2>
              <DonorResponseStatusBadge status={status} />
              <p className={styles.summary}>{summary || donor.donorBloodType}</p>
            </div>
          </div>
          <button className={styles.close} onClick={onClose} type="button">Fechar</button>
        </header>

        <div className={styles.body}>
          <InfoSection title="Identificação">
            <Field label="Nome completo" value={donorName} />
            <Field label="ID Dador" value={donor.donorId} />
            <Field label="Tipo sanguíneo" value={donor.donorBloodType} />
            <Field label="Género" value={donor.gender ?? "Por completar"} />
            <Field label="Idade" value={donor.age ? `${donor.age} anos` : "Por completar"} />
            <Field label="Telefone" value={donor.donorPhone} />
            <Field label="Contacto de emergência" value={donor.emergencyContactName ?? "Por completar"} />
            <Field label="Telefone de emergência" value={donor.emergencyContactPhone ?? "Por completar"} />
          </InfoSection>

          <InfoSection title="Elegibilidade">
            <Field label="Estado" value={eligibleLabel(donor.eligibilityStatus, donor.nextEligibleDate)} />
            <Field label="Última doação" value={formatDate(donor.lastDonationDate)} />
            <Field label="Próxima elegível" value={formatDate(donor.nextEligibleDate)} />
          </InfoSection>

          <InfoSection title="Métricas de Doação">
            <Field label="Total de doações" value={String(donor.totalDonations ?? 0)} />
            <Field label="Doações concluídas" value={String(donor.completedDonations ?? 0)} />
            <Field label="Fiabilidade" value={`${donor.reliabilityScore ?? 7}/10`} />
          </InfoSection>

          <InfoSection title="Pedido Atual">
            <Field label="Pedido ID" value={donor.bloodRequestId ?? "Pendente"} />
            <Field label="Aceite às" value={formatDateTime(donor.acceptedAt ?? donor.createdAt)} />
            <Field label="ETA" value={donor.eta} />
            <Field label="PIN" value={<span className={styles.pin}>{donor.pin}</span>} />
            <Field label="Estado PIN" value={donor.pinValidationStatus ?? donorResponseLabels[status]} />
          </InfoSection>
        </div>

        <div className={styles.actions}>
          <button disabled={saving || !canMoveDonorResponse(status, "Chegou")} onClick={() => onAction(donor, "Chegou")} type="button">Validar chegada</button>
          <button disabled={saving || !canMoveDonorResponse(status, "Doação concluída")} onClick={() => onAction(donor, "Doação concluída")} type="button">Concluir doação</button>
          <button disabled={saving || !canMoveDonorResponse(status, "Cancelado")} onClick={() => onAction(donor, "Cancelado")} type="button">Cancelar pedido</button>
        </div>
        <p className={styles.privacy}>Dados sensíveis, autenticação, BI completo, consentimentos legais e dados administrativos não são apresentados neste painel.</p>
      </section>
    </div>
  );
}

function InfoSection({ children, title }: { children: ReactNode; title: string }) {
  return (
    <section className={styles.section}>
      <h3>{title}</h3>
      <div className={styles.grid}>{children}</div>
    </section>
  );
}

function resolveDonorName(donor: AcceptedDonor) {
  const source = donor as AcceptedDonor & {
    fullName?: string;
    full_name?: string;
    name?: string;
    profile?: { name?: string };
    user?: { email?: string; name?: string };
    users?: { email?: string; name?: string };
  };
  return [
    donor.donorName,
    source.fullName,
    source.full_name,
    source.name,
    source.user?.name,
    source.users?.name,
    source.profile?.name,
    source.user?.email,
    source.users?.email
  ].find((value) => value?.trim())?.trim() ?? "Nome não disponível";
}

function Field({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className={styles.field}>
      <span>{label}</span>
      <strong>{value || "Por completar"}</strong>
    </div>
  );
}

function initials(name: string) {
  return name.split(" ").filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase() || "D";
}

function formatDate(value?: string) {
  if (!value) return "Sem registo";
  return new Date(value).toLocaleDateString("pt-AO");
}

function formatDateTime(value?: string) {
  if (!value) return "Sem registo";
  return new Date(value).toLocaleString("pt-AO", { dateStyle: "short", timeStyle: "short" });
}

function eligibleLabel(status = "eligible", nextEligibleDate?: string) {
  const labels: Record<string, string> = {
    eligible: "Elegível",
    needs_review: "Requer revisão",
    permanently_deferred: "Diferido permanente",
    temporarily_deferred: "Diferido temporário"
  };
  if (status !== "eligible") return labels[status] ?? "Requer revisão";
  if (!nextEligibleDate) return "Elegível";
  return new Date(nextEligibleDate).getTime() > Date.now() ? "Em pausa temporária" : "Elegível";
}
