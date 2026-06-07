import type { Donor } from "@doe-sangue-angola/shared-types";
import styles from "./mobileApp.module.css";

export function EligibilityStatusCard({ donor }: { donor: Donor }) {
  const state = eligibilityState(donor);
  return (
    <article className={styles.card}>
      <strong>Elegibilidade</strong>
      <p>
        <span className={`pill ${state.tone}`}>{state.label}</span>
      </p>
      <p className="muted">{state.reason}</p>
      {donor.lastDonation ? (
        <p className="muted">Última doação: {formatDate(donor.lastDonation)}</p>
      ) : null}
      {donor.nextEligibleDonationDate ? (
        <p className="muted">Próxima data elegível: {formatDate(donor.nextEligibleDonationDate)}</p>
      ) : null}
      <progress className={styles.progress} max="2000" value={donor.points} />
    </article>
  );
}

export function canDonorAcceptRequest(donor: Donor | null) {
  return eligibilityState(donor).canAccept;
}

export function eligibilityState(donor: Donor | null) {
  if (!donor?.id) {
    return {
      canAccept: false,
      label: "Perfil incompleto",
      reason: "Complete o perfil de dador para avaliar a elegibilidade.",
      tone: "red"
    };
  }
  const status = donor.eligibilityStatus ?? "Pendente";
  if (status === "Pendente") {
    return { canAccept: false, label: "Pendente", reason: "A sua conta está pendente de verificação.", tone: "red" };
  }
  if (status === "Revisão Necessária") {
    return { canAccept: false, label: "Revisão necessária", reason: "A Administração Nacional precisa rever o seu perfil antes da doação.", tone: "red" };
  }
  if (status === "Inelegível") {
    return { canAccept: false, label: "Inelegível", reason: "A sua conta está inelegível para doação.", tone: "red" };
  }
  if (status === "Temporariamente Inelegível") {
    return { canAccept: false, label: "Temporariamente inelegível", reason: "Ainda está em período de recuperação.", tone: "red" };
  }
  const next = donor.nextEligibleDonationDate ? new Date(donor.nextEligibleDonationDate) : null;
  if ((next && next.getTime() > Date.now())) {
    return {
      canAccept: false,
      label: "Temporariamente inelegível",
      reason: next ? `Pode doar novamente em ${formatDate(next.toISOString())}.` : "Aguarde a próxima autorização clínica.",
      tone: "red"
    };
  }
  if (status !== "Elegível") {
    return { canAccept: false, label: "Pendente", reason: "A sua conta está pendente de verificação.", tone: "red" };
  }
  return { canAccept: true, label: "Elegível", reason: "Pode aceitar pedidos compatíveis.", tone: "green" };
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("pt-AO");
}
