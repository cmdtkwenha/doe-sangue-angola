"use client";

import { useState } from "react";
import styles from "./notifications.module.css";
import type { RealNotification } from "./types";

export function NotificationCard({ item }: { item: RealNotification }) {
  const [read, setRead] = useState(item.read);

  async function markRead() {
    setRead(true);
    const response = await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notificationId: item.id })
    });
    if (!response.ok) setRead(false);
  }

  return (
    <article className={`${styles.card} ${read ? styles.read : ""}`}>
      <div className={styles.rowTop}>
        <span>
          <strong>{item.title}</strong>
          <br />
          <small className={styles.type}>{item.type}</small>
        </span>
        <span className={styles.channel}>{item.role}</span>
        {!read ? <span className={styles.dot} /> : null}
      </div>
      <p className="muted">{item.message}</p>
      <div className={styles.rowTop}>
        <small className="muted">{formatTime(item.createdAt)}</small>
        {!read ? (
          <button className={styles.textButton} onClick={() => void markRead()} type="button">
            Marcar lida
          </button>
        ) : null}
      </div>
    </article>
  );
}

function formatTime(value: string) {
  return new Date(value).toLocaleString("pt-AO", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "2-digit"
  });
}
