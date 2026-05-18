"use client";

import { listAvailableRequestsForDonor } from "@doe-sangue-angola/shared-services";
import { useApiData } from "@hooks/useApiData";
import { useRealtimeVersion } from "@hooks/useRealtimeVersion";
import { useMemo } from "react";
import type { BloodRequest } from "@doe-sangue-angola/shared-types";
import styles from "./mobileApp.module.css";
import { MobileShell } from "./MobileShell";
import { RequestCard } from "./RequestCard";

export function RequestList({
  onAccept,
  onOpen
}: {
  onAccept?: (request: BloodRequest) => void;
  onOpen?: (request: BloodRequest) => void;
}) {
  const version = useRealtimeVersion();
  const fallback = useMemo(() => listAvailableRequestsForDonor("d1"), [version]);
  const { data: requests, error, loading } = useApiData<BloodRequest[]>(
    "/api/blood-requests?donorId=d1",
    fallback,
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
        <p className="muted">Sem pedidos compatíveis neste momento.</p>
      ) : requests.map((request) => (
        <RequestCard
          key={request.id}
          onAccept={onAccept}
          onOpen={onOpen}
          request={request}
        />
      ))}
    </MobileShell>
  );
}
