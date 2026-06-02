import Link from "next/link";
import type { BloodRequest, Donor, DonorResponseStatus } from "@doe-sangue-angola/shared-types";
import { PilotFeedbackButton } from "../feedback/PilotFeedbackButton";
import { LoadingSkeleton } from "../ui/LoadingSkeleton";
import { DonorPinCard } from "./DonorPinCard";
import { EligibilityStatusCard } from "./EligibilityStatusCard";
import { RequestCard } from "./RequestCard";
import styles from "./mobileApp.module.css";
import pwa from "./mobilePwa.module.css";

export type DonorPin = {
  bloodRequestId: string;
  etaMinutes: number;
  hospitalLocation: string;
  hospitalName: string;
  pin: string;
  requestBloodType: string;
  responseId: string;
  status: DonorResponseStatus;
};

export function HomeScreen({
  donor,
  loading,
  requests
}: {
  donor: Donor | null;
  loading: boolean;
  requests: BloodRequest[];
}) {
  const urgent = requests[0];
  return (
    <section className={pwa.screen}>
      {loading ? <LoadingSkeleton label="A carregar perfil" /> : null}
      <article className={styles.hero}>
        <h1>Olá, {donor?.name?.split(" ")[0] ?? "Dador"}!</h1>
        <p>Obrigado por ajudar a salvar vidas em Angola.</p>
        <div className={styles.heroMeta}>
          <span><small>Pontos</small><strong className={styles.points}>{donor?.points ?? 0}</strong></span>
          <span><small>Tipo sanguíneo</small><strong className={styles.level}>{donor?.bloodType ?? "--"}</strong></span>
          <span className={styles.medal}>★</span>
        </div>
      </article>
      {donor ? <EligibilityStatusCard donor={donor} /> : null}
      <DonorPinCard />
      <article className={styles.card}>
        <strong>Pedido mais próximo</strong>
        {urgent ? (
          <p className="muted">{urgent.bloodType} · {urgent.hospitalName ?? "Hospital"} · {urgent.municipality ?? urgent.province}</p>
        ) : (
          <p className="muted">Não existem pedidos compatíveis neste momento.</p>
        )}
      </article>
    </section>
  );
}

export function RequestsScreen({
  acceptedIds,
  acceptingId,
  error,
  loading,
  onAccept,
  onOpen,
  requests
}: {
  acceptedIds: string[];
  acceptingId?: string;
  error?: string;
  loading: boolean;
  onAccept: (request: BloodRequest) => void;
  onOpen: (request: BloodRequest) => void;
  requests: BloodRequest[];
}) {
  return (
    <section className={pwa.screen}>
      <h1>Pedidos Disponíveis</h1>
      <p className="muted">Pedidos compatíveis com o seu perfil e localização.</p>
      {loading ? <LoadingSkeleton label="A carregar pedidos compatíveis" /> : null}
      {error ? <p className="muted">{error}</p> : null}
      {!loading && !requests.length ? <p className={pwa.empty}>Sem pedidos compatíveis agora.</p> : null}
      {requests.map((request) => (
        <RequestCard
          accepted={acceptedIds.includes(request.id)}
          accepting={acceptingId === request.id}
          key={request.id}
          onAccept={onAccept}
          onOpen={onOpen}
          request={request}
        />
      ))}
    </section>
  );
}

export function HistoryScreen({ responses }: { responses: DonorPin[] }) {
  const sorted = responses.filter((item) => item.status === "Doação concluída" || item.status === "Cancelado");
  return (
    <section className={pwa.screen}>
      <h1>Histórico</h1>
      {!sorted.length ? <p className={pwa.empty}>Ainda não há doações concluídas ou canceladas.</p> : null}
      {sorted.map((item) => (
        <article className={styles.card} key={item.responseId}>
          <strong>{item.hospitalName}</strong>
          <p className="muted">{item.requestBloodType} · {statusLabel(item.status)}</p>
        </article>
      ))}
    </section>
  );
}

export function ProfileScreen({ donor, loading }: { donor: Donor | null; loading: boolean }) {
  return (
    <section className={pwa.screen}>
      <h1>Perfil</h1>
      {loading ? <LoadingSkeleton label="A carregar dados do dador" /> : null}
      <article className={styles.card}>
        <strong>{donor?.name ?? "Perfil de dador"}</strong>
        <p className="muted">{donor?.bloodType ?? "--"} · {donor?.municipality ?? "Município"}, {donor?.province ?? "Província"}</p>
        <p className="muted">Telefone: {donor?.phone ?? "Por completar"}</p>
        <p className="muted">Contacto de emergência: {donor?.emergencyContactName ?? "Por completar"}</p>
        <Link className={styles.accept} href="/mobile/onboarding">Editar perfil</Link>
      </article>
      <PilotFeedbackButton />
    </section>
  );
}

function statusLabel(status: DonorResponseStatus) {
  const labels: Record<DonorResponseStatus, string> = {
    "Dador a Caminho": "Dador a Caminho",
    Chegou: "Chegou",
    Cancelado: "Cancelado",
    "Doação concluída": "Doação concluída",
    "Não Compareceu": "Não compareceu",
    "PIN Validado": "PIN Validado"
  };
  return labels[status] ?? status;
}
