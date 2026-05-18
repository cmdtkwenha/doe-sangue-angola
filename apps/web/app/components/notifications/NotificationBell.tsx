"use client";

import { getUnreadNotificationCount } from "@doe-sangue-angola/shared-services";
import { useRealtimeVersion } from "@hooks/useRealtimeVersion";
import { useState } from "react";
import styles from "./notifications.module.css";
import { NotificationBadge } from "./NotificationBadge";

export function NotificationBell({ donorId = "d1" }: { donorId?: string }) {
  useRealtimeVersion();
  const [open, setOpen] = useState(false);
  const count = getUnreadNotificationCount(donorId);

  return (
    <span className={styles.bellWrap}>
      <button
        aria-expanded={open}
        aria-label="Notificações"
        className={styles.bell}
        onClick={() => setOpen(!open)}
        type="button"
      >
        !
        <NotificationBadge count={count} />
      </button>
      {open ? <span className={styles.popover}>{count} notificações por ler</span> : null}
    </span>
  );
}
