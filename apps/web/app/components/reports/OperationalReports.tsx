"use client";

import { useMemo, useState } from "react";
import { useApiData } from "@hooks/useApiData";
import { useSupabaseRealtimeVersion } from "@hooks/useSupabaseRealtimeVersion";
import { ErrorState } from "../ui/ErrorState";
import { LoadingSkeleton } from "../ui/LoadingSkeleton";
import { ReportCard } from "./ReportCard";
import { ReportFilters } from "./ReportFilters";
import { emptyFilters, type ReportDefinition, type ReportFilterState } from "./reportTypes";
import styles from "./reports.module.css";

export function OperationalReports({ role }: { role: "admin" | "hospital" }) {
  const [filters, setFilters] = useState<ReportFilterState>(emptyFilters);
  const version = useSupabaseRealtimeVersion([
    "blood_requests",
    "donor_responses",
    "donors",
    "hospital_inventory",
    "hospitals",
    "inventory_movements"
  ]);
  const path = useMemo(() => `/api/reports?role=${role}&${new URLSearchParams(filters).toString()}`, [filters, role]);
  const { data: reports, error, loading } = useApiData<ReportDefinition[]>(path, [], version);

  return (
    <>
      <ReportFilters filters={filters} onChange={setFilters} />
      <section className={styles.printable}>
        <div className={styles.printHead}>
          <strong>{role === "admin" ? "Relatórios nacionais" : "Relatórios do hospital"}</strong>
          <span>Fonte: Supabase · {new Date().toLocaleDateString("pt-AO")}</span>
        </div>
        {loading ? <LoadingSkeleton label="A carregar relatórios reais" /> : null}
        {error ? <ErrorState title="Relatórios indisponíveis" message={error} /> : null}
        <section className="grid">
          {reports.map((report) => <ReportCard key={report.id} report={report} />)}
        </section>
      </section>
    </>
  );
}
