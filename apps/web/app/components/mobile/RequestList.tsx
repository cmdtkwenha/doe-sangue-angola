"use client";

import { listAvailableRequestsForDonor } from "@doe-sangue-angola/shared-services";
import { useRealtimeVersion } from "@hooks/useRealtimeVersion";
import { useMemo } from "react";
import styles from "./mobileApp.module.css";
import { MobileShell } from "./MobileShell";
import { RequestCard } from "./RequestCard";

export function RequestList() {
  const version = useRealtimeVersion();
  const requests = useMemo(() => listAvailableRequestsForDonor("d1"), [version]);

  return (
    <MobileShell active="requests">
      <header className={styles.header}>
        <strong>← Pedidos Disponíveis</strong>
        <span>⌯</span>
      </header>
      <p className="muted">Próximo de você · <strong>Luanda</strong></p>
      {requests.map((request) => (
        <RequestCard request={request} key={request.id} />
      ))}
    </MobileShell>
  );
}
