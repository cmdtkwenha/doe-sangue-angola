"use client";

import { useEffect, useState } from "react";
import styles from "./polish.module.css";

export function OfflineBanner() {
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    const update = () => setOffline(!navigator.onLine);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  if (!offline) return null;

  return (
    <div className={styles.offlineBanner} role="status">
      Está sem ligação. Vamos sincronizar automaticamente quando a internet voltar.
    </div>
  );
}
