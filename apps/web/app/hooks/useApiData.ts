"use client";

import { isSupabaseMode } from "@doe-sangue-angola/shared-services";
import { useEffect, useState } from "react";

type Envelope<T> = { ok: boolean; data?: T; message?: string };

export function useApiData<T>(path: string, fallback: T, version = 0) {
  const [data, setData] = useState<T>(fallback);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const enabled = isSupabaseMode() || process.env.NODE_ENV === "production";

  useEffect(() => {
    if (!enabled) {
      setData(fallback);
    }
  }, [enabled, fallback]);

  useEffect(() => {
    if (!enabled) return;
    let active = true;
    setLoading(true);
    setError("");

    fetch(path)
      .then((response) => response.json() as Promise<Envelope<T>>)
      .then((payload) => {
        if (!active) return;
        if (payload.ok && "data" in payload) setData(payload.data as T);
        else setError(payload.message ?? "Não foi possível carregar dados reais.");
      })
      .catch((error: unknown) =>
        active && setError(formatFetchError(path, error))
      )
      .finally(() => active && setLoading(false));

    return () => {
      active = false;
    };
  }, [enabled, path, version]);

  return { data, error, loading, usingApi: enabled };
}

function formatFetchError(path: string, error: unknown) {
  const message = error instanceof Error ? error.message : "Erro de rede desconhecido.";
  return `Falha ao sincronizar Supabase | ação: fetch ${path} | erro: ${message}`;
}
