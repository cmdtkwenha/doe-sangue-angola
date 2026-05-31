"use client";

import { useApiData } from "@hooks/useApiData";
import { useSupabaseRealtimeVersion } from "@hooks/useSupabaseRealtimeVersion";
import { ErrorState } from "../../ui/ErrorState";
import { LoadingSkeleton } from "../../ui/LoadingSkeleton";
import { BloodAvailabilityMap } from "./BloodAvailabilityMap";
import { BloodTypeMonitoring } from "./BloodTypeMonitoring";
import { NationalAlerts } from "./NationalAlerts";
import { NationalAuditTrail } from "./NationalAuditTrail";
import { NationalMetrics } from "./NationalMetrics";
import { NationalReportExports } from "./NationalReportExports";
import { ProvinceRankings } from "./ProvinceRankings";
import type { NationalOperationsData } from "./nationalTypes";
import styles from "./national.module.css";

export function NationalOperationsCenter() {
  const version = useSupabaseRealtimeVersion([
    "audit_logs",
    "blood_requests",
    "donor_responses",
    "donors",
    "hospital_inventory",
    "hospitals"
  ]);
  const { data, error, loading } = useApiData<NationalOperationsData | null>(
    "/api/admin/national-operations",
    null,
    version
  );

  if (loading && !data) return <LoadingSkeleton label="A carregar centro nacional de operações" />;
  if (error) return <ErrorState title="Centro nacional indisponível" message={error} />;
  if (!data) return null;

  return (
    <section className={styles.shell} aria-label="Centro de Operações Nacional">
      <div className={styles.hero}>
        <div>
          <span className="eyebrow">Centro de Operações Nacional</span>
          <h2>Coordenação nacional de sangue</h2>
          <p className="muted">
            {data.sampleMode
              ? "Sem dados operacionais suficientes: a visualizar amostra para demonstração."
              : "Dados sincronizados com Supabase em tempo quase real."}
          </p>
        </div>
        <NationalReportExports data={data} />
      </div>
      <NationalMetrics metrics={data.metrics} />
      <section className={styles.gridTwo}>
        <BloodAvailabilityMap municipalities={data.municipalities} provinces={data.provinces} />
        <BloodTypeMonitoring items={data.bloodTypes} />
      </section>
      <section className={styles.gridThree}>
        <NationalAlerts alerts={data.alerts} />
        <ProvinceRankings rankings={data.rankings} />
        <NationalAuditTrail events={data.auditTrail} />
      </section>
    </section>
  );
}
