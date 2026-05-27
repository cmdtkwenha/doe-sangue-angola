"use client";

import { useApiData } from "@hooks/useApiData";
import { useRealtimeVersion } from "@hooks/useRealtimeVersion";
import type { BloodRequest } from "@doe-sangue-angola/shared-types";
import styles from "./mobileApp.module.css";
import { MobileShell } from "./MobileShell";
import { RequestCard } from "./RequestCard";
import {
  isDonorProfileComplete,
  useCurrentDonor
} from "./useCurrentDonor";
import { useAuth } from "../auth/useAuth";

export function RequestList({
  acceptedRequestIds = [],
  acceptingRequestId,
  onAccept,
  onOpen
}: {
  acceptedRequestIds?: string[];
  acceptingRequestId?: string;
  onAccept?: (request: BloodRequest) => void;
  onOpen?: (request: BloodRequest) => void;
}) {
  const version = useRealtimeVersion();
  const { session } = useAuth();
  const { data: donor } = useCurrentDonor();
  const userId = session?.user.authUserId ?? session?.user.id;
  const donorReady = isDonorProfileComplete(donor, userId);
  const donorId = donorReady ? donor.id : "";
  const { data: requests, error, loading } = useApiData<BloodRequest[]>(
    donorId ? `/api/blood-requests?donorId=${donorId}` : "/api/blood-requests?donorId=missing",
    [],
    version
  );

  return (
    <MobileShell active="requests">
      <header className={styles.header}>
        <strong>← Pedidos Disponíveis</strong>
        <span>⌯</span>
      </header>
      <p className="muted">Próximo de você · <strong>Luanda</strong></p>
      {loading ? <p className="muted">A procurar pedidos compatíveis...</p> : null}
      {error ? <p className="muted">{error}</p> : null}
      {requests.length === 0 ? (
        <article className={styles.card}>
          <strong>Sem pedidos compatíveis</strong>
          <p className="muted">
            Não há pedidos próximos para o seu tipo sanguíneo neste momento.
          </p>
        </article>
      ) : requests
        .filter((request) => !donorReady || request.bloodType === donor.bloodType)
        .map((request) => (
        <RequestCard
          accepted={acceptedRequestIds.includes(request.id)}
          accepting={acceptingRequestId === request.id}
          key={request.id}
          onAccept={onAccept}
          onOpen={onOpen}
          request={request}
        />
      ))}
    </MobileShell>
  );
}
