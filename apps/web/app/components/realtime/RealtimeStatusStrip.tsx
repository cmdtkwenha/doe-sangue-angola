"use client";

import { useRealtime } from "../../hooks/useRealtime";
import styles from "./realtime.module.css";

export function RealtimeStatusStrip() {
  const { count, latest } = useRealtime();

  return (
    <section className={styles.strip} aria-label="Estado realtime">
      <span>
        <span className={styles.pulse} /> Realtime mock ativo
      </span>
      <span>
        {latest ? (
          <>Último evento: <span className={styles.event}>{latest.name}</span></>
        ) : (
          "A aguardar eventos da plataforma"
        )}
      </span>
      <span>{count} eventos</span>
    </section>
  );
}
