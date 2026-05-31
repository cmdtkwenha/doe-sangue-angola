import { EmptyState } from "../../ui/EmptyState";
import type { NationalAuditEvent } from "./nationalTypes";
import styles from "./national.module.css";

export function NationalAuditTrail({ events }: { events: NationalAuditEvent[] }) {
  return (
    <section className={styles.panel}>
      <div className={styles.panelHead}>
        <strong>Auditoria Nacional</strong>
        <span className="muted">Ações sensíveis</span>
      </div>
      {!events.length ? (
        <EmptyState title="Sem trilho de auditoria" message="Eventos nacionais aparecerão após ações reais." />
      ) : (
        <div className={styles.list}>
          {events.map((event) => (
            <article className={styles.row} key={event.id}>
              <strong>{event.action}</strong>
              <small>{event.actor} · {event.time}</small>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
