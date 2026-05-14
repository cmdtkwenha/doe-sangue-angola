"use client";

import { getUnreadNotificationCount } from "@doe-sangue-angola/shared-services";
import { useRealtimeVersion } from "@hooks/useRealtimeVersion";
import styles from "./notifications.module.css";
import { NotificationBadge } from "./NotificationBadge";

export function NotificationBell({ donorId = "d1" }: { donorId?: string }) {
  useRealtimeVersion();

  return (
    <button className={styles.bell} type="button" aria-label="Notificações">
      !
      <NotificationBadge count={getUnreadNotificationCount(donorId)} />
    </button>
  );
}
