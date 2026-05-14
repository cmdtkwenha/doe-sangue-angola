"use client";

import {
  buildReminderCards,
  listNotifications,
  markAllNotificationsRead
} from "@doe-sangue-angola/shared-services";
import { useState } from "react";
import { useRealtimeVersion } from "@hooks/useRealtimeVersion";
import styles from "./notifications.module.css";
import { NotificationBell } from "./NotificationBell";
import { NotificationCard } from "./NotificationCard";
import { ReminderPanel } from "./ReminderPanel";

export function NotificationCenter({ donorId = "d1" }: { donorId?: string }) {
  const [, setVersion] = useState(0);
  useRealtimeVersion();
  const notifications = listNotifications(donorId);
  const reminders = buildReminderCards(donorId);

  return (
    <section className={styles.panel}>
      <div className={styles.rowTop}>
        <span>
          <strong>Centro de Notificações</strong>
          <br />
          <small className="muted">Alertas push em modo demo e mensagens no app.</small>
        </span>
        <NotificationBell donorId={donorId} />
      </div>
      <div className={styles.providerGrid}>
        <span>Mock Push</span>
        <span>Expo pronto</span>
        <span>FCM pronto</span>
      </div>
      <button
        className={styles.markButton}
        onClick={() => {
          markAllNotificationsRead(donorId);
          setVersion((item) => item + 1);
        }}
        type="button"
      >
        Marcar todas como lidas
      </button>
      {notifications.map((item) => (
        <NotificationCard item={item} key={item.id} />
      ))}
      <ReminderPanel reminders={reminders} />
    </section>
  );
}
