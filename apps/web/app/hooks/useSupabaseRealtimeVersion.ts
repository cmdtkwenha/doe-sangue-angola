"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

type Listener = () => void;
type RealtimeEntry = {
  channel: ReturnType<NonNullable<typeof supabase>["channel"]>;
  lastEventKey: string;
  listeners: Set<Listener>;
};

const entries = new Map<string, RealtimeEntry>();

export function useSupabaseRealtimeVersion(tables: string[]) {
  const [version, setVersion] = useState(0);
  const key = [...new Set(tables)].sort().join("|");

  useEffect(() => {
    if (!supabase || !key) return;
    const unsubscribe = key.split("|").map((table) =>
      subscribeTable(table, () => setVersion((item) => item + 1))
    );
    return () => {
      unsubscribe.forEach((stop) => stop());
    };
  }, [key]);

  return version;
}

function subscribeTable(table: string, listener: Listener) {
  if (!supabase) return () => undefined;
  const db = supabase;
  const entry = entries.get(table) ?? createEntry(table);
  entry.listeners.add(listener);
  entries.set(table, entry);
  return () => {
    entry.listeners.delete(listener);
    if (entry.listeners.size === 0) {
      entries.delete(table);
      void db.removeChannel(entry.channel);
    }
  };
}

function createEntry(table: string): RealtimeEntry {
  const db = supabase;
  if (!db) throw new Error("Supabase realtime indisponível.");
  const entry: RealtimeEntry = {
    channel: db.channel(`live-${table}`),
    lastEventKey: "",
    listeners: new Set()
  };
  entry.channel.on(
    "postgres_changes",
    { event: "*", schema: "public", table },
    (payload) => {
      const key = [
        payload.eventType,
        payload.table,
        payload.commit_timestamp,
        readId(payload.new) || readId(payload.old)
      ].join(":");
      if (entry.lastEventKey === key) return;
      entry.lastEventKey = key;
      entry.listeners.forEach((notify) => notify());
    }
  );
  entry.channel.subscribe();
  return entry;
}

function readId(value: unknown) {
  return typeof value === "object" && value && "id" in value
    ? String((value as { id?: unknown }).id)
    : "";
}
