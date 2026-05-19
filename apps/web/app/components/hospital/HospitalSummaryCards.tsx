"use client";

import type { Appointment, BloodRequest } from "@doe-sangue-angola/shared-types";
import { useApiData } from "@hooks/useApiData";
import styles from "./hospitalPortal.module.css";
import { useCurrentHospital } from "./useCurrentHospital";

export function HospitalSummaryCards() {
  const { data: hospital } = useCurrentHospital();
  const hospitalId = hospital?.id ?? "";
  const { data: requests, loading: loadingRequests } = useApiData<BloodRequest[]>(
    hospitalId ? `/api/blood-requests?hospitalId=${hospitalId}` : "/api/blood-requests?hospitalId=missing",
    [],
    hospitalId.length
  );
  const { data: appointments } = useApiData<Appointment[]>(
    hospitalId ? `/api/appointments?hospitalId=${hospitalId}` : "/api/appointments?hospitalId=missing",
    [],
    hospitalId.length
  );
  const active = requests.filter((item) => !["Cancelado", "Concluído", "Concluido"].includes(item.status));
  const incoming = appointments.filter((item) => item.status === "Pendente");
  const completed = requests.filter((item) => ["Concluído", "Concluido"].includes(item.status));
  const responseRate = requests.length ? Math.round((completed.length / requests.length) * 100) : 0;

  return (
    <>
      <SummaryCard note={loadingRequests ? "A carregar" : "Aberto"} title="Pedidos Ativos" value={String(active.length)} />
      <SummaryCard note="A caminho" title="Dadores a Caminho" value={String(incoming.length)} />
      <SummaryCard note={`${completed.length} concluídos`} title="Taxa de Resposta" value={`${responseRate}%`} />
    </>
  );
}

function SummaryCard({ title, value, note }: { title: string; value: string; note: string }) {
  return (
    <article className={styles.card}>
      <div className="muted">{title}</div>
      <h2 className={styles.kpiValue}>{value}</h2>
      <span className="pill gold">{note}</span>
    </article>
  );
}
