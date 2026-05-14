import type { ComplianceEvent } from "./complianceData";
import styles from "./compliance.module.css";

const riskClass = {
  Baixo: "low",
  Médio: "medium",
  Alto: "high"
} as const;

export function ActivityTimeline({ events }: { events: ComplianceEvent[] }) {
  return (
    <div className={styles.timeline}>
      {events.map((event) => (
        <article className={styles.event} key={event.id}>
          <div className={styles.dot} data-risk={riskClass[event.risk]} />
          <div>
            <div className={styles.eventHead}>
              <strong>{event.type}</strong>
              <span>{event.date} · {event.time}</span>
            </div>
            <p>{event.action}</p>
            <small>
              {event.actor} · {event.hospital} · {event.province}
            </small>
          </div>
          <span className={styles.risk} data-risk={riskClass[event.risk]}>{event.risk}</span>
        </article>
      ))}
    </div>
  );
}
