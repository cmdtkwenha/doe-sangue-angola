"use client";

import type { MockNotification } from "@doe-sangue-angola/shared-services";
import { markNotificationRead } from "@doe-sangue-angola/shared-services";
import { useState } from "react";
import styles from "./notifications.module.css";

export function NotificationCard({ item }: { item: MockNotification }) {
  const [read, setRead] = useState(item.read);

  return (
    <article className={`${styles.card} ${read ? styles.read : ""}`}>
      <div className={styles.rowTop}>
        <span>
          <strong>{item.title}</strong>
          <br />
          <small className={styles.type}>{item.type}</small>
        </span>
        <span className={styles.channel}>{item.channel}</span>
        {!read ? <span className={styles.dot} /> : null}
      </div>
      <p className="muted">{item.body}</p>
      <div className={styles.rowTop}>
        <small className="muted">{item.createdAt}</small>
        {!read ? (
          <button
            className={styles.textButton}
            onClick={() => {
              markNotificationRead(item.id);
              setRead(true);
            }}
            type="button"
          >
            Marcar lida
          </button>
        ) : null}
      </div>
    </article>
  );
}
