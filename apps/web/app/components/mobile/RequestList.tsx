"use client";

import { useEffect, useState } from "react";
import { useApiData } from "@hooks/useApiData";
import { useRealtimeVersion } from "@hooks/useRealtimeVersion";
import { useSupabaseRealtimeVersion } from "@hooks/useSupabaseRealtimeVersion";
import type { BloodRequest } from "@doe-sangue-angola/shared-types";
import styles from "./mobileApp.module.css";
import { LoadingSkeleton } from "../ui/LoadingSkeleton";
import { MobileShell } from "./MobileShell";
import { RequestCard } from "./RequestCard";
import {
  isDonorProfileComplete,
  useCurrentDonor
} from "./useCurrentDonor";
import { useAuth } from "../auth/useAuth";
import { canDonorAcceptRequest, eligibilityState } from "./EligibilityStatusCard";

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
  const liveVersion = useSupabaseRealtimeVersion(["blood_requests", "donor_responses", "donors"]);
  const [locationMessage, setLocationMessage] = useState("A preparar localização segura...");
  const { session } = useAuth();
  const { data: donor } = useCurrentDonor();
  const userId = session?.user.authUserId ?? session?.user.id;
  const donorReady = isDonorProfileComplete(donor, userId);
  const eligibility = eligibilityState(donor);
  const donorId = donorReady ? donor.id : "";
  const { data: requests, error, loading } = useApiData<BloodRequest[]>(
    donorId ? `/api/blood-requests?donorId=${donorId}` : "/api/blood-requests?donorId=missing",
    [],
    version + liveVersion
  );

  useEffect(() => {
    if (!donorReady || !("geolocation" in navigator)) {
      setLocationMessage("Usamos província/município quando a localização não está disponível.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocationMessage("Localização ativa: pedidos ordenados por distância e ETA.");
        void saveLocation("granted", position.coords.latitude, position.coords.longitude);
      },
      () => {
        setLocationMessage("Localização desativada: a procurar por província/município.");
        void saveLocation("denied");
      },
      { enableHighAccuracy: false, maximumAge: 300000, timeout: 8000 }
    );
  }, [donorReady]);

  return (
    <MobileShell active="requests">
      <header className={styles.header}>
        <strong>← Pedidos Disponíveis</strong>
        <span>⌯</span>
      </header>
      <p className="muted">{locationMessage}</p>
      {loading ? <LoadingSkeleton label="A sincronizar pedidos compatíveis" /> : null}
      {error ? <p className="muted">{error}</p> : null}
      {!canDonorAcceptRequest(donor) && donorReady ? (
        <article className={styles.card}>
          <strong>{eligibility.label}</strong>
          <p className="muted">{eligibility.reason}</p>
        </article>
      ) : null}
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
          canAccept={canDonorAcceptRequest(donor)}
          key={request.id}
          onAccept={onAccept}
          onOpen={onOpen}
          request={request}
        />
      ))}
    </MobileShell>
  );
}

async function saveLocation(status: string, latitude?: number, longitude?: number) {
  await fetch("/api/donors/location", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ latitude, locationPermissionStatus: status, longitude })
  }).catch(() => undefined);
}
