"use client";

import type { BloodRequest, Donor, Hospital, Metric } from "@doe-sangue-angola/shared-types";
import { useApiData } from "@hooks/useApiData";
import { LoadingSkeleton } from "../ui/LoadingSkeleton";
import { ErrorState } from "../ui/ErrorState";
import styles from "./adminCore.module.css";
import { MetricCard } from "./MetricCard";

export function AdminMetrics() {
  const { data: donors, error: donorError, loading: loadingDonors } = useApiData<Donor[]>("/api/donors", [], 0);
  const { data: hospitals, error: hospitalError, loading: loadingHospitals } = useApiData<Hospital[]>("/api/hospitals", [], 0);
  const { data: requests, error: requestError, loading: loadingRequests } = useApiData<BloodRequest[]>("/api/blood-requests", [], 0);
  const active = requests.filter((request) => !["Cancelado", "Concluído", "Concluido"].includes(request.status));
  const critical = active.filter((request) => request.urgency === "Critica");
  const month = new Date().toISOString().slice(0, 7);
  const monthlyDonations = requests.filter((request) =>
    ["Concluído", "Concluido"].includes(request.status) && request.createdAt.startsWith(month)
  );
  const metrics: Metric[] = [
    { label: "Dadores Registados", value: String(donors.length), change: "Supabase", tone: "green" },
    { label: "Hospitais Ativos", value: String(hospitals.filter((item) => item.verified).length), change: "Verificados", tone: "black" },
    { label: "Pedidos Ativos", value: String(active.length), change: "Em curso", tone: "red" },
    { label: "Alertas Emergência", value: String(critical.length), change: "Críticos", tone: "red" },
    { label: "Doações no mês", value: String(monthlyDonations.length), change: month, tone: "green" },
    { label: "Províncias", value: String(new Set(active.map((item) => item.province).filter(Boolean)).size), change: "Com pedidos", tone: "gold" }
  ];
  const icons = ["□", "!", "H", "U", "G", "△"];
  if (loadingDonors || loadingHospitals || loadingRequests) {
    return <LoadingSkeleton label="A carregar métricas nacionais reais" />;
  }
  if (donorError || hospitalError || requestError) {
    return <ErrorState message={donorError || hospitalError || requestError} title="Falha nas métricas" />;
  }

  return (
    <section className={styles.metricGrid}>
      {metrics.map((metric, index) => (
        <MetricCard icon={icons[index]} key={metric.label} metric={metric} />
      ))}
    </section>
  );
}
