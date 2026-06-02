"use client";

import type { BloodRequest, DonorResponseStatus } from "@doe-sangue-angola/shared-types";
import { useApiData } from "@hooks/useApiData";
import { useRealtimeVersion } from "@hooks/useRealtimeVersion";
import { useSupabaseRealtimeVersion } from "@hooks/useSupabaseRealtimeVersion";
import base from "./hospitalPortal.module.css";
import styles from "./hospitalAdvanced.module.css";
import { EmptyState } from "../ui/EmptyState";
import { useCurrentHospital } from "./useCurrentHospital";

export function HospitalPerformancePanel() {
  const version = useRealtimeVersion();
  const liveVersion = useSupabaseRealtimeVersion(["blood_requests", "donor_responses", "donors"]);
  const { data: hospital } = useCurrentHospital();
  const hospitalId = hospital?.id ?? "";
  const { data: requests } = useApiData<BloodRequest[]>(
    hospitalId ? `/api/blood-requests?hospitalId=${hospitalId}` : "/api/blood-requests?hospitalId=missing",
    [],
    version + liveVersion
  );
  const { data: responses } = useApiData<Array<{ status: DonorResponseStatus }>>(
    hospitalId ? "/api/hospital/accepted-donors" : "/api/appointments?hospitalId=missing",
    [],
    version + liveVersion
  );
  const completed = requests.filter((request) => ["Concluído", "Concluido"].includes(request.status));
  const activeResponses = responses.filter((item) => item.status !== "Cancelado");
  const metrics = [
    ["Pedidos ativos", String(requests.length), "Registos reais"],
    ["Agendamentos", String(activeResponses.length), "Respostas reais"],
    ["Concluídos", String(completed.length), "Este ciclo"]
  ];

  return (
    <section className={base.panel}>
      <div className={base.panelHead}>
        <strong>Desempenho do Hospital</strong>
        <span className="pill">Este mês</span>
      </div>
      <div className={styles.metricStrip}>
        {metrics.map(([label, value, delta]) => (
          <article className={styles.metricBox} key={label}>
            <span className={base.rowMuted}>{label}</span>
            <h3>{value}</h3>
            <span className={delta.startsWith("-") ? "pill green" : "pill"}>{delta}</span>
          </article>
        ))}
      </div>
      {requests.length === 0 && activeResponses.length === 0 ? (
        <EmptyState title="Sem desempenho real" message="O desempenho aparece após pedidos e dadores aceites." />
      ) : null}
    </section>
  );
}
