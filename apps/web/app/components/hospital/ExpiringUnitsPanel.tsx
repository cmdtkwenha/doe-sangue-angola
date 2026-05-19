"use client";

import type { BloodRequest } from "@doe-sangue-angola/shared-types";
import base from "./hospitalPortal.module.css";
import styles from "./hospitalAdvanced.module.css";
import { useApiData } from "../../hooks/useApiData";
import { useCurrentHospital } from "./useCurrentHospital";

export function ExpiringUnitsPanel() {
  const { data: hospital } = useCurrentHospital();
  const path = hospital?.id ? `/api/blood-requests?hospitalId=${hospital.id}` : "/api/blood-requests?hospitalId=missing";
  const { data: requests } = useApiData<BloodRequest[]>(path, [], hospital?.id?.length ?? 0);
  const units = requests.slice(0, 3).map((request) => [
    request.bloodType,
    `${request.units} unidades`,
    request.urgency === "Critica" ? "Prioridade imediata" : "Monitorizar"
  ]);
  return (
    <section className={base.panel}>
      <div className={base.panelHead}>
        <strong>Unidades Próximas do Vencimento</strong>
        <a className="muted" href="/hospital/inventory">Ver todas</a>
      </div>
      {units.length === 0 ? <p className={base.rowMuted}>Sem unidades críticas registadas.</p> : null}
      {units.map(([type, unitCount, window]) => (
        <article className={styles.unitRow} key={type}>
          <div className={styles.rowTop}>
            <strong className={styles.redText}>{type}</strong>
            <span className="pill gold">{window}</span>
          </div>
          <span className={base.rowMuted}>{unitCount} em pedido ativo</span>
        </article>
      ))}
    </section>
  );
}
