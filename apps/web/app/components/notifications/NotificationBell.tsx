"use client";

import { useApiData } from "@hooks/useApiData";
import { useSupabaseRealtimeVersion } from "@hooks/useSupabaseRealtimeVersion";
import { useState } from "react";
import styles from "./notifications.module.css";
import { NotificationBadge } from "./NotificationBadge";
import type { RealNotification } from "./types";

export function NotificationBell({ all = false }: { all?: boolean }) {
  const [open, setOpen] = useState(false);
  const liveVersion = useSupabaseRealtimeVersion(["notifications"]);
  const { data } = useApiData<RealNotification[]>(
    `/api/notifications${all ? "?all=true" : ""}`,
    [],
    liveVersion
  );
  const unread = data.filter((item) => !item.read).length;
  const latest = data[0]?.title ?? "Sem alertas novos";

  return (
    <span className={styles.bellWrap}>
      <button
        aria-expanded={open}
        aria-label="Notificações"
        className={styles.bell}
        onClick={() => setOpen((value) => !value)}
        type="button"
      >
        !
        <NotificationBadge count={unread} />
      </button>
      {open ? <span className={styles.popover}>{unread} por ler · {latest}</span> : null}
    </span>
  );
}
