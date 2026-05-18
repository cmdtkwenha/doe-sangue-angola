"use client";

import { isSupabaseMode } from "@doe-sangue-angola/shared-services";
import { useEffect, useMemo, useState } from "react";

type Envelope<T> = { ok: boolean; data?: T; message?: string };

export function useApiData<T>(path: string, fallback: T, version = 0) {
  const [data, setData] = useState<T>(fallback);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const enabled = useMemo(() => isSupabaseMode(), []);

  useEffect(() => {
    if (!enabled) {
      setData(fallback);
      return;
    }

    let active = true;
    setLoading(true);
    setError("");

    fetch(path)
      .then((response) => response.json() as Promise<Envelope<T>>)
      .then((payload) => {
        if (!active) return;
        if (payload.ok && payload.data) setData(payload.data);
        else setError(payload.message ?? "Não foi possível carregar dados.");
      })
      .catch(() => active && setError("Falha ao sincronizar dados reais."))
      .finally(() => active && setLoading(false));

    return () => {
      active = false;
    };
  }, [enabled, fallback, path, version]);

  return { data, error, loading, usingApi: enabled };
}
