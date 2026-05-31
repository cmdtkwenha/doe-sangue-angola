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
  const status = donor.eligibilityStatus ?? "eligible";
  if (status === "permanently_deferred") {
    return { canAccept: false, label: "Diferido permanente", reason: "Este perfil não pode aceitar pedidos de doação.", tone: "red" };
  }
  if (status === "needs_review") {
    return { canAccept: false, label: "Requer revisão", reason: "A equipa precisa rever a elegibilidade antes da próxima doação.", tone: "red" };
  }
  const next = donor.nextEligibleDonationDate ? new Date(donor.nextEligibleDonationDate) : null;
  if (status === "temporarily_deferred" || (next && next.getTime() > Date.now())) {
    return {
      canAccept: false,
      label: "Diferido temporário",
      reason: next ? `Pode doar novamente em ${formatDate(next.toISOString())}.` : "Aguarde a próxima autorização clínica.",
      tone: "red"
    };
  }
  return { canAccept: true, label: "Elegível", reason: "Pode aceitar pedidos compatíveis.", tone: "green" };
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("pt-AO");
}
