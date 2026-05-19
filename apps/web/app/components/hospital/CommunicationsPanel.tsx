"use client";

import type { BloodRequest } from "@doe-sangue-angola/shared-types";
import base from "./hospitalPortal.module.css";
import styles from "./hospitalAdvanced.module.css";
import { useApiData } from "../../hooks/useApiData";
import { useCurrentHospital } from "./useCurrentHospital";

export function CommunicationsPanel() {
  const { data: hospital } = useCurrentHospital();
  const path = hospital?.id ? `/api/blood-requests?hospitalId=${hospital.id}` : "/api/blood-requests?hospitalId=missing";
  const { data: requests } = useApiData<BloodRequest[]>(path, [], hospital?.id?.length ?? 0);
  const messages = requests.slice(0, 4).map((request) => ({
    body: `Pedido ${request.bloodType} com estado ${request.status}`,
    status: request.urgency,
    target: request.patientCode,
    title: "Sistema"
  }));
  return (
    <section className={base.panel}>
      <div className={base.panelHead}>
        <strong>Comunicações Recentes</strong>
        <a className="muted" href="/hospital/reports">Ver todas</a>
      </div>
      {messages.length === 0 ? <p className={base.rowMuted}>Sem comunicações recentes.</p> : null}
      {messages.map((item) => (
        <article className={styles.messageRow} key={`${item.title}-${item.target}`}>
          <div className={styles.rowTop}>
            <strong>{item.target}</strong>
            <span className="pill">{item.title}</span>
          </div>
          <span className={base.rowMuted}>{item.body} · {item.status}</span>
        </article>
      ))}
    </section>
  );
}
