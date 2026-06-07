"use client";

import type { BloodRequest, DonorResponseStatus } from "@doe-sangue-angola/shared-types";
import { useApiData } from "@hooks/useApiData";
import { useRealtimeVersion } from "@hooks/useRealtimeVersion";
import { useSupabaseRealtimeVersion } from "@hooks/useSupabaseRealtimeVersion";
import styles from "./hospitalPortal.module.css";
import { useCurrentHospital } from "./useCurrentHospital";

export function HospitalSummaryCards() {
  const version = useRealtimeVersion();
  const liveVersion = useSupabaseRealtimeVersion(["blood_requests", "donor_responses", "donors"]);
  const { data: hospital } = useCurrentHospital();
  const hospitalId = hospital?.id ?? "";
  const { data: requests, loading: loadingRequests } = useApiData<BloodRequest[]>(
    hospitalId ? `/api/blood-requests?hospitalId=${hospitalId}` : "/api/blood-requests?hospitalId=missing",
    [],
    version + liveVersion
  );
  const { data: responses } = useApiData<Array<{ status: DonorResponseStatus }>>(
    hospitalId ? "/api/hospital/accepted-donors" : "/api/appointments?hospitalId=missing",
    [],
    version + liveVersion
  );
  const active = requests.filter((item) => !["Cancelado", "Concluído"].includes(item.status));
  const incoming = responses.filter((item) => ["Dador a Caminho", "Chegou", "PIN Validado"].includes(item.status));
  const completed = requests.filter((item) => item.status === "Concluído");
  const responseRate = requests.length ? Math.round((completed.length / requests.length) * 100) : 0;

  return (
    <>
      <SummaryCard icon="▣" note={loadingRequests ? "A carregar" : "Em curso"} title="Pedidos Ativos" value={String(active.length)} />
      <SummaryCard icon="●" note="Ver lista" title="Dadores a Caminho" value={String(incoming.length)} />
      <SummaryCard icon="✓" note="Finalizados" title="Pedidos Concluídos" value={String(completed.length)} />
      <SummaryCard icon="↗" note="Com base nos pedidos" title="Taxa de Resposta" value={`${responseRate}%`} />
    </>
  );
}

function SummaryCard({ icon, title, value, note }: {
  icon: string;
  title: string;
  value: string;
  note: string;
}) {
  return (
    <article className={styles.kpiCard}>
      <div className={styles.kpiHead}>
        <span>{title}</span>
        <span className={styles.kpiIcon}>{icon}</span>
      </div>
      <h2 className={styles.kpiValue}>{value}</h2>
      <span className={styles.kpiNote}>{note}</span>
    </article>
  );
}
