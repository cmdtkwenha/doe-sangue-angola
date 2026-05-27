"use client";

import type { Appointment, BloodRequest } from "@doe-sangue-angola/shared-types";
import { useApiData } from "@hooks/useApiData";
import { useRealtimeVersion } from "@hooks/useRealtimeVersion";
import base from "./hospitalPortal.module.css";
import styles from "./hospitalAdvanced.module.css";
import { useCurrentHospital } from "./useCurrentHospital";

export function HospitalPerformancePanel() {
  const version = useRealtimeVersion();
  const { data: hospital } = useCurrentHospital();
  const hospitalId = hospital?.id ?? "";
  const { data: requests } = useApiData<BloodRequest[]>(
    hospitalId ? `/api/blood-requests?hospitalId=${hospitalId}` : "/api/blood-requests?hospitalId=missing",
    [],
    version
  );
  const { data: appointments } = useApiData<Appointment[]>(
    hospitalId ? `/api/appointments?hospitalId=${hospitalId}` : "/api/appointments?hospitalId=missing",
    [],
    version
  );
  const completed = requests.filter((request) => ["Concluído", "Concluido"].includes(request.status));
  const metrics = [
    ["Pedidos ativos", String(requests.length), "Registos reais"],
    ["Agendamentos", String(appointments.length), "Reais"],
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
      <svg className={styles.chart} viewBox="0 0 520 140" role="img">
        <polyline fill="none" points="20,70 100,76 180,74 260,86 340,48 420,72 500,62" stroke="#df1d2d" strokeWidth="4" />
        <polyline fill="none" points="20,92 100,96 180,110 260,104 340,78 420,108 500,86" stroke="#087443" strokeWidth="4" />
        <line x1="20" x2="500" y1="118" y2="118" stroke="#e6eaf0" />
      </svg>
    </section>
  );
}
