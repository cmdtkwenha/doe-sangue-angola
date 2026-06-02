import styles from "./mobileApp.module.css";
import type { BloodRequest } from "@doe-sangue-angola/shared-types";
import { ContextualTooltip } from "../support";

export function RequestCard({
  accepted,
  accepting,
  canAccept = true,
  onAccept,
  onOpen,
  request
}: {
  accepted?: boolean;
  accepting?: boolean;
  canAccept?: boolean;
  onAccept?: (request: BloodRequest) => void;
  onOpen?: (request: BloodRequest) => void;
  request: BloodRequest;
}) {
  const tone = request.urgency === "Critica" || request.urgency === "Desastre"
    ? "critical"
    : request.urgency === "Alta"
      ? "warning"
      : "stable";
  const textTone = tone === "critical"
    ? styles.criticalText
    : tone === "warning"
      ? styles.warningText
      : styles.stableText;
  const remaining = request.remainingSlots ?? request.units;
  const acceptedCount = request.acceptedCount ?? Math.max(request.units - remaining, 0);
  const filled = request.status === "Concluído" || remaining <= 0;

  return (
    <article className={`${styles.request} ${styles[tone]}`}>
      <button
        className={styles.cardButton}
        onClick={() => onOpen?.(request)}
        type="button"
      >
        <span className={styles.requestTop}>
        <span>
          <strong className={textTone}>{request.urgency}</strong>
          {request.requestSource === "family" ? <em className="pill gold">Pedido Familiar</em> : null}
          <br />
          <span className={`${styles.blood} ${textTone}`}>{request.bloodType}</span>
        </span>
        <span>
          <strong>{request.hospitalName ?? request.patientCode}</strong>
          <br />
          <small>{request.hospitalLocation ?? "Localização a confirmar"}</small>
          {request.distanceKm != null ? (
            <small><br />{request.distanceKm} km · ETA {request.etaMinutes ?? "--"} min</small>
          ) : null}
        </span>
        <span aria-hidden="true">⋮</span>
        </span>
      </button>
      <div className={styles.requestMeta}>
        <small>{request.bloodType} · {request.units} bolsas</small>
        <small>{request.urgency} · {request.createdAt.slice(11, 16)} · {etaLabel(request)}</small>
        <small>
          {filled
            ? "Pedido preenchido."
            : `${acceptedCount} de ${request.units} dadores confirmados · ${remaining} vaga${remaining === 1 ? "" : "s"} restante${remaining === 1 ? "" : "s"}`}
        </small>
        <ContextualTooltip
          title="Aceitar pedido"
          text="Confirme hospital e disponibilidade. Ao aceitar, o sistema gera o seu PIN de doação."
        />
        <button
          aria-label={`Aceitar pedido ${request.bloodType} para ${request.units} bolsas`}
          className={styles.accept}
          disabled={accepted || accepting || !canAccept || filled}
          onClick={() => !accepted && !accepting && canAccept && !filled && onAccept?.(request)}
          type="button"
        >
          {filled ? "PREENCHIDO" : accepted ? "ACEITE" : accepting ? "A PROCESSAR" : canAccept ? "ACEITAR" : "BLOQUEADO"}
        </button>
      </div>
    </article>
  );
}

function etaLabel(request: BloodRequest) {
  return request.etaMinutes ? `ETA ${request.etaMinutes} min` : "ETA por município";
}
