"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

export function useSupabaseRealtimeVersion(tables: string[]) {
  const [version, setVersion] = useState(0);

  useEffect(() => {
    if (!supabase || tables.length === 0) return;
    const db = supabase;
    const channel = db.channel(`live-${tables.join("-")}-${Math.random()}`);
    tables.forEach((table) => {
      channel.on(
        "postgres_changes",
        { event: "*", schema: "public", table },
        () => setVersion((item) => item + 1)
      );
    });
    channel.subscribe();
    return () => {
      void db.removeChannel(channel);
    };
  }, [tables.join("|")]);

  return version;
}
